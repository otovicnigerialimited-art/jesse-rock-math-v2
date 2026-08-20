import { db, auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updatePassword as updateAuthPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { safeStorage } from './storage';

export type AccountRole = 'GUEST' | 'INDIVIDUAL' | 'STUDENT' | 'TEACHER' | 'PARENT';

export interface UserProfile {
  uid: string;
  role: AccountRole;
  accountType: AccountRole;
  username: string;
  displayName?: string;
  email?: string;
  real_first_name?: string;
  
  // Relationships
  teacher_id?: string;
  class_id?: string;
  managedBy?: 'TEACHER' | 'PARENT' | 'SELF';
  parent_uids?: string[];
  firstLoginRequired?: boolean;

  // Learning Progress Metrics
  highScore: number;
  xp: number;
  coins: number;
  solved: number;
  correctAnswers: number;
  currentLevel: number;
  streak: number;
  completedTopics?: string[];
  badges?: string[];
  equipped_items?: {
    hair?: string;
    body?: string;
    instrument?: string;
  };
  purchased_items?: string[];

  createdAt: number;
  lastLoginAt: number;
}

export interface ParentLinkCode {
  code: string;
  student_id: string;
  student_name?: string;
  teacher_id?: string;
  created_at: number;
  expires_at: number;
  used: boolean;
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, '');
}

export function usernameToEmail(username: string): string {
  const norm = normalizeUsername(username);
  return `${norm}@jessemathrockstar.internal`;
}

// ==========================================================
// 1. GUEST MODE & MIGRATION
// ==========================================================

export function initGuestSession(): UserProfile {
  let guestId = safeStorage.getItem('jesse_guest_session_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    safeStorage.setItem('jesse_guest_session_id', guestId);
  }

  const savedProgressStr = safeStorage.getItem(`jesse_guest_progress_${guestId}`);
  let guestProgress = {
    highScore: 0,
    xp: 100,
    coins: 50,
    solved: 0,
    correctAnswers: 0,
    currentLevel: 1,
    streak: 0
  };

  if (savedProgressStr) {
    try {
      guestProgress = { ...guestProgress, ...JSON.parse(savedProgressStr) };
    } catch (e) {
      console.warn("Failed to parse guest progress:", e);
    }
  }

  const guestProfile: UserProfile = {
    uid: guestId,
    role: 'GUEST',
    accountType: 'GUEST',
    username: 'Guest Rockstar',
    displayName: 'Guest Rockstar',
    highScore: guestProgress.highScore,
    xp: guestProgress.xp,
    coins: guestProgress.coins,
    solved: guestProgress.solved,
    correctAnswers: guestProgress.correctAnswers,
    currentLevel: guestProgress.currentLevel,
    streak: guestProgress.streak,
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };

  safeStorage.setItem('jesse_rock_role', 'guest');
  safeStorage.setItem('jesse_rock_my_username', 'Guest Rockstar');
  safeStorage.setItem('jesse_rock_user_id', guestId);

  return guestProfile;
}

export function saveGuestProgress(guestId: string, deltaXp: number, deltaCoins: number, isCorrect: boolean, score: number) {
  const key = `jesse_guest_progress_${guestId}`;
  const raw = safeStorage.getItem(key);
  let current = {
    highScore: 0,
    xp: 100,
    coins: 50,
    solved: 0,
    correctAnswers: 0,
    currentLevel: 1,
    streak: 0
  };

  if (raw) {
    try { current = { ...current, ...JSON.parse(raw) }; } catch (e) {}
  }

  current.xp += deltaXp;
  current.coins += deltaCoins;
  current.solved += 1;
  if (isCorrect) {
    current.correctAnswers += 1;
    current.streak += 1;
  } else {
    current.streak = 0;
  }
  current.highScore = Math.max(current.highScore, score);
  current.currentLevel = Math.floor(current.xp / 1000) + 1;

  safeStorage.setItem(key, JSON.stringify(current));
  return current;
}

// ==========================================================
// 2. INDIVIDUAL ACCOUNT
// ==========================================================

export async function createIndividualAccount(
  usernameEntered: string,
  passwordEntered: string,
  migrateGuestData: boolean = false
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const normUser = normalizeUsername(usernameEntered);
  if (!normUser || normUser.length < 3) {
    return { success: false, error: "Username must be at least 3 characters without spaces." };
  }
  if (!passwordEntered || passwordEntered.length < 4) {
    return { success: false, error: "Password must be at least 4 characters long." };
  }

  // 1. Verify username uniqueness
  const nameSnap = await getDoc(doc(db, "usernames", normUser));
  if (nameSnap.exists()) {
    return { success: false, error: `Username "${usernameEntered}" is already taken. Please pick another!` };
  }

  try {
    const syntheticEmail = usernameToEmail(normUser);
    const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, passwordEntered);
    const uid = userCredential.user.uid;

    let initialXp = 100;
    let initialCoins = 100;
    let initialHighScore = 0;
    let initialSolved = 0;
    let initialCorrect = 0;
    let initialStreak = 1;

    if (migrateGuestData) {
      const guestId = safeStorage.getItem('jesse_guest_session_id');
      if (guestId) {
        const raw = safeStorage.getItem(`jesse_guest_progress_${guestId}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            initialXp = parsed.xp || 100;
            initialCoins = parsed.coins || 100;
            initialHighScore = parsed.highScore || 0;
            initialSolved = parsed.solved || 0;
            initialCorrect = parsed.correctAnswers || 0;
            initialStreak = parsed.streak || 1;
          } catch (e) {}
        }
        // Cleanup guest session
        safeStorage.removeItem(`jesse_guest_progress_${guestId}`);
        safeStorage.removeItem('jesse_guest_session_id');
      }
    }

    const profile: UserProfile = {
      uid,
      role: 'INDIVIDUAL',
      accountType: 'INDIVIDUAL',
      username: usernameEntered.trim(),
      displayName: usernameEntered.trim(),
      highScore: initialHighScore,
      xp: initialXp,
      coins: initialCoins,
      solved: initialSolved,
      correctAnswers: initialCorrect,
      currentLevel: Math.floor(initialXp / 1000) + 1,
      streak: initialStreak,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    // Save profile to Firestore
    await setDoc(doc(db, "users", uid), profile);
    await setDoc(doc(db, "usernames", normUser), {
      uid,
      username: usernameEntered.trim(),
      createdAt: Date.now()
    });

    safeStorage.setItem('jesse_rock_role', 'individual');
    safeStorage.setItem('jesse_rock_my_username', usernameEntered.trim());
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Individual signup error:", err);
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: "Username is already registered in Authentication system." };
    }
    return { success: false, error: err.message || "Failed to create individual account." };
  }
}

// ==========================================================
// 3. LOGIN FOR INDIVIDUAL & STUDENT (USERNAME + PASSWORD)
// ==========================================================

export async function loginWithUsername(
  usernameEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const normUser = normalizeUsername(usernameEntered);
  if (!normUser || !passwordEntered) {
    return { success: false, error: "Please enter both username and password." };
  }

  // Find username lookup
  const nameSnap = await getDoc(doc(db, "usernames", normUser));
  if (!nameSnap.exists()) {
    // Check school_students collection for legacy fallback
    const studentQ = query(collection(db, 'school_students'), where('username_lower', '==', normUser));
    const studentSnap = await getDocs(studentQ);

    if (!studentSnap.empty) {
      const studentDoc = studentSnap.docs[0];
      const sData = studentDoc.data();
      if (sData.password === passwordEntered) {
        const studentProfile: UserProfile = {
          uid: studentDoc.id,
          role: 'STUDENT',
          accountType: 'STUDENT',
          username: sData.username,
          displayName: sData.real_first_name || sData.username,
          real_first_name: sData.real_first_name,
          teacher_id: sData.teacher_id,
          class_id: sData.class_id,
          managedBy: 'TEACHER',
          firstLoginRequired: sData.firstLoginRequired ?? false,
          highScore: sData.school_math_progress?.highScore || 0,
          xp: sData.xp || sData.school_math_progress?.xp || 100,
          coins: sData.coins || sData.school_math_progress?.coins || 100,
          solved: sData.school_math_progress?.solved || 0,
          correctAnswers: sData.school_math_progress?.correctAnswers || 0,
          currentLevel: sData.school_math_progress?.currentLevel || 1,
          streak: sData.school_math_progress?.streak || 0,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };

        safeStorage.setItem('jesse_rock_role', 'student');
        safeStorage.setItem('jesse_rock_my_username', sData.username);
        safeStorage.setItem('jesse_rock_user_id', studentDoc.id);

        return { success: true, user: studentProfile };
      } else {
        return { success: false, error: "Incorrect password for student account." };
      }
    }

    return { success: false, error: "Username not found. Please verify spelling or create an account." };
  }

  try {
    const syntheticEmail = usernameToEmail(normUser);
    const userCred = await signInWithEmailAndPassword(auth, syntheticEmail, passwordEntered);
    const uid = userCred.user.uid;

    const userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) {
      return { success: false, error: "Account profile missing in database." };
    }

    const userData = userSnap.data() as UserProfile;
    // Update last login
    await updateDoc(doc(db, "users", uid), { lastLoginAt: Date.now() });

    safeStorage.setItem('jesse_rock_role', userData.accountType.toLowerCase());
    safeStorage.setItem('jesse_rock_my_username', userData.username);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: userData };

  } catch (err: any) {
    console.error("Login error:", err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return { success: false, error: "Incorrect password entered." };
    }
    return { success: false, error: "Authentication failed. Please check credentials." };
  }
}

// ==========================================================
// 4. TEACHER ACCOUNT MANAGEMENT
// ==========================================================

export async function createTeacherAccount(
  teacherName: string,
  emailEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanName = teacherName.trim();

  if (!cleanName || !cleanEmail || !passwordEntered) {
    return { success: false, error: "Please complete all fields." };
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    const uid = userCred.user.uid;

    const profile: UserProfile = {
      uid,
      role: 'TEACHER',
      accountType: 'TEACHER',
      username: cleanEmail,
      displayName: cleanName,
      email: cleanEmail,
      highScore: 0,
      xp: 500,
      coins: 500,
      solved: 0,
      correctAnswers: 0,
      currentLevel: 10,
      streak: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    await setDoc(doc(db, "users", uid), profile);
    await setDoc(doc(db, "teachers", uid), {
      id: uid,
      teacher_name: cleanName,
      email: cleanEmail,
      created_at: Date.now()
    });

    safeStorage.setItem('jesse_rock_role', 'teacher');
    safeStorage.setItem('jesse_rock_my_username', cleanEmail);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Teacher account creation error:", err);
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: "A teacher account already exists with this email address." };
    }
    return { success: false, error: err.message || "Failed to create teacher account." };
  }
}

export async function loginTeacherOrParent(
  emailEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanEmail = emailEntered.trim().toLowerCase();
  if (!cleanEmail || !passwordEntered) {
    return { success: false, error: "Please enter your email and password." };
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    const uid = userCred.user.uid;

    let userSnap = await getDoc(doc(db, "users", uid));
    if (!userSnap.exists()) {
      // Check teachers collection fallback
      const teacherSnap = await getDoc(doc(db, "teachers", uid));
      if (teacherSnap.exists()) {
        const tData = teacherSnap.data();
        const createdProfile: UserProfile = {
          uid,
          role: 'TEACHER',
          accountType: 'TEACHER',
          username: cleanEmail,
          displayName: tData.teacher_name,
          email: cleanEmail,
          highScore: 0,
          xp: 500,
          coins: 500,
          solved: 0,
          correctAnswers: 0,
          currentLevel: 10,
          streak: 0,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        await setDoc(doc(db, "users", uid), createdProfile);
        
        safeStorage.setItem('jesse_rock_role', 'teacher');
        safeStorage.setItem('jesse_rock_my_username', cleanEmail);
        safeStorage.setItem('jesse_rock_user_id', uid);

        return { success: true, user: createdProfile };
      }
      return { success: false, error: "User profile record not found." };
    }

    const userData = userSnap.data() as UserProfile;
    await updateDoc(doc(db, "users", uid), { lastLoginAt: Date.now() });

    safeStorage.setItem('jesse_rock_role', userData.accountType.toLowerCase());
    safeStorage.setItem('jesse_rock_my_username', userData.username || cleanEmail);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: userData };

  } catch (err: any) {
    console.error("Teacher/Parent login error:", err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      return { success: false, error: "Incorrect password entered." };
    }
    return { success: false, error: "Login failed. Please check credentials." };
  }
}

// ==========================================================
// 5. PARENT ACCOUNT & PARENT ↔ CHILD LINKING
// ==========================================================

export async function createParentAccount(
  parentName: string,
  emailEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanName = parentName.trim();

  if (!cleanName || !cleanEmail || !passwordEntered) {
    return { success: false, error: "Please fill in all parent account fields." };
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    const uid = userCred.user.uid;

    const profile: UserProfile = {
      uid,
      role: 'PARENT',
      accountType: 'PARENT',
      username: cleanEmail,
      displayName: cleanName,
      email: cleanEmail,
      parent_uids: [],
      highScore: 0,
      xp: 100,
      coins: 100,
      solved: 0,
      correctAnswers: 0,
      currentLevel: 1,
      streak: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    await setDoc(doc(db, "users", uid), profile);

    safeStorage.setItem('jesse_rock_role', 'parent');
    safeStorage.setItem('jesse_rock_my_username', cleanEmail);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Parent creation error:", err);
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: "A parent account with this email address already exists." };
    }
    return { success: false, error: err.message || "Failed to create parent account." };
  }
}

// Generate single-use Parent Link Code for a child
export async function generateParentLinkCode(studentId: string, studentName: string, teacherId?: string): Promise<string> {
  const code = `JMR-${Math.floor(10000 + Math.random() * 90000)}`;
  const linkDoc: ParentLinkCode = {
    code,
    student_id: studentId,
    student_name: studentName,
    teacher_id: teacherId,
    created_at: Date.now(),
    expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days expiry
    used: false
  };

  await setDoc(doc(db, "parent_invitations", code), linkDoc);
  return code;
}

// Parent links child using code
export async function linkChildWithCode(
  parentUid: string,
  codeEntered: string
): Promise<{ success: boolean; error?: string; childProfile?: UserProfile }> {
  const cleanCode = codeEntered.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: "Please enter a valid Child Link Code (e.g. JMR-48291)." };
  }

  const inviteSnap = await getDoc(doc(db, "parent_invitations", cleanCode));
  if (!inviteSnap.exists()) {
    return { success: false, error: "Invalid Link Code. Please check the code provided by your child's teacher." };
  }

  const inviteData = inviteSnap.data() as ParentLinkCode;
  if (inviteData.used) {
    return { success: false, error: "This link code has already been used to connect a parent account." };
  }
  if (Date.now() > inviteData.expires_at) {
    return { success: false, error: "This link code has expired. Please ask the teacher for a new invitation code." };
  }

  const studentId = inviteData.student_id;

  // Update student profile with parentUid
  const studentRef = doc(db, "users", studentId);
  const studentSnap = await getDoc(studentRef);

  let childData: UserProfile;

  if (studentSnap.exists()) {
    await updateDoc(studentRef, {
      parent_uids: arrayUnion(parentUid)
    });
    childData = studentSnap.data() as UserProfile;
  } else {
    // Check school_students collection
    const legacySnap = await getDoc(doc(db, "school_students", studentId));
    if (legacySnap.exists()) {
      const leg = legacySnap.data();
      childData = {
        uid: studentId,
        role: 'STUDENT',
        accountType: 'STUDENT',
        username: leg.username,
        displayName: leg.real_first_name || leg.username,
        real_first_name: leg.real_first_name,
        teacher_id: leg.teacher_id,
        parent_uids: [parentUid],
        highScore: leg.school_math_progress?.highScore || 0,
        xp: leg.xp || 100,
        coins: leg.coins || 100,
        solved: leg.school_math_progress?.solved || 0,
        correctAnswers: leg.school_math_progress?.correctAnswers || 0,
        currentLevel: 1,
        streak: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      };
      await setDoc(doc(db, "users", studentId), childData);
      await updateDoc(doc(db, "school_students", studentId), {
        parent_uids: arrayUnion(parentUid)
      });
    } else {
      return { success: false, error: "Associated student record was not found." };
    }
  }

  // Record link in parent_children collection
  await setDoc(doc(db, "parent_children", `${parentUid}_${studentId}`), {
    parent_uid: parentUid,
    student_uid: studentId,
    linked_at: Date.now()
  });

  // Mark invite code used
  await updateDoc(doc(db, "parent_invitations", cleanCode), {
    used: true,
    used_by_parent: parentUid,
    used_at: Date.now()
  });

  return { success: true, childProfile: childData };
}

// Fetch children connected to parent
export async function fetchParentLinkedChildren(parentUid: string): Promise<UserProfile[]> {
  const childrenList: UserProfile[] = [];

  try {
    // Query users where parent_uids contains parentUid
    const q1 = query(collection(db, "users"), where("parent_uids", "array-contains", parentUid));
    const snap1 = await getDocs(q1);

    snap1.forEach(d => {
      childrenList.push({ uid: d.id, ...d.data() } as UserProfile);
    });

    if (childrenList.length === 0) {
      // Fallback: Check parent_children collection
      const q2 = query(collection(db, "parent_children"), where("parent_uid", "==", parentUid));
      const snap2 = await getDocs(q2);

      for (const docItem of snap2.docs) {
        const sUid = docItem.data().student_uid;
        const uSnap = await getDoc(doc(db, "users", sUid));
        if (uSnap.exists()) {
          childrenList.push({ uid: uSnap.id, ...uSnap.data() } as UserProfile);
        } else {
          // Check school_students fallback
          const sSnap = await getDoc(doc(db, "school_students", sUid));
          if (sSnap.exists()) {
            const sData = sSnap.data();
            childrenList.push({
              uid: sUid,
              role: 'STUDENT',
              accountType: 'STUDENT',
              username: sData.username,
              displayName: sData.real_first_name || sData.username,
              real_first_name: sData.real_first_name,
              highScore: sData.school_math_progress?.highScore || 0,
              xp: sData.xp || 100,
              coins: sData.coins || 100,
              solved: sData.school_math_progress?.solved || 0,
              correctAnswers: sData.school_math_progress?.correctAnswers || 0,
              currentLevel: 1,
              streak: 0,
              createdAt: Date.now(),
              lastLoginAt: Date.now()
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Error fetching parent linked children:", err);
  }

  return childrenList;
}

// ==========================================================
// 6. STUDENT PASSWORD UPDATE (FIRST LOGIN / RESET)
// ==========================================================

export async function studentUpdatePassword(
  studentUid: string,
  newPasswordEntered: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPasswordEntered || newPasswordEntered.length < 4) {
    return { success: false, error: "New password must be at least 4 characters long." };
  }

  try {
    if (auth.currentUser) {
      await updateAuthPassword(auth.currentUser, newPasswordEntered);
    }

    // Update user profile
    await updateDoc(doc(db, "users", studentUid), {
      firstLoginRequired: false
    });

    // Update school_students doc if exists
    const ssRef = doc(db, "school_students", studentUid);
    const ssSnap = await getDoc(ssRef);
    if (ssSnap.exists()) {
      await updateDoc(ssRef, {
        password: newPasswordEntered,
        firstLoginRequired: false
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error updating student password:", err);
    return { success: false, error: err.message || "Failed to update password." };
  }
}

// Sign out helper
export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (e) {}
  safeStorage.removeItem('jesse_rock_role');
  safeStorage.removeItem('jesse_rock_my_username');
  safeStorage.removeItem('jesse_rock_user_id');
}
