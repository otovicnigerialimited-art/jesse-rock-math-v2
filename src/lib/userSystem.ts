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
import { hashPasswordWithSalt, verifyPasswordMatch } from './cryptoUtils';
import { checkActionRateLimit, sanitizeUserInput } from './safetyUtils';

export type AccountRole = 'GUEST' | 'INDIVIDUAL' | 'STUDENT' | 'TEACHER' | 'PARENT';

export interface UserProfile {
  uid: string;
  role: AccountRole;
  accountType: AccountRole;
  username: string;
  displayName?: string;
  email?: string;
  real_first_name?: string;
  phoneNumber?: string;
  
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
  return `${norm}@jessemathstriker.internal`;
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
    username: 'Guest Striker',
    displayName: 'Guest Striker',
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
  safeStorage.setItem('jesse_rock_my_username', 'Guest Striker');
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

  // Rate-limiting check for signups
  const rl = checkActionRateLimit(`signup_${normUser}`, 5, 60000);
  if (!rl.allowed) {
    return { success: false, error: `Too many registration attempts. Please wait ${rl.retryAfterSeconds}s before trying again.` };
  }

  // 1. Verify username uniqueness
  const nameSnap = await getDoc(doc(db, "usernames", normUser));
  if (nameSnap.exists()) {
    return { success: false, error: `Username "${usernameEntered}" is already taken. Please pick another!` };
  }

  let uid = `user_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
  try {
    const syntheticEmail = usernameToEmail(normUser);
    const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, passwordEntered);
    if (userCredential.user?.uid) {
      uid = userCredential.user.uid;
    }
  } catch (authErr: any) {
    console.warn("Firebase Auth fallback for individual signup:", authErr?.message);
  }

  try {
    const secureHashedPassword = await hashPasswordWithSalt(passwordEntered);
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

    const cleanUsername = sanitizeUserInput(usernameEntered.trim(), 30);
    const profile: UserProfile = {
      uid,
      role: 'INDIVIDUAL',
      accountType: 'INDIVIDUAL',
      username: cleanUsername,
      displayName: cleanUsername,
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

    // Save profile to Firestore with salted hash
    await setDoc(doc(db, "users", uid), {
      ...profile,
      password: secureHashedPassword
    });
    await setDoc(doc(db, "usernames", normUser), {
      uid,
      username: cleanUsername,
      password: secureHashedPassword,
      createdAt: Date.now()
    });

    safeStorage.setItem('jesse_rock_role', 'individual');
    safeStorage.setItem('jesse_rock_my_username', usernameEntered.trim());
    safeStorage.setItem('jesse_rock_user_id', uid);
    safeStorage.setItem('jesse_rock_device_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Individual signup error:", err);
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

  // Rate-limiting check for login attempts (10 attempts per minute)
  const rl = checkActionRateLimit(`login_${normUser}`, 10, 60000);
  if (!rl.allowed) {
    return { success: false, error: `Too many login attempts. Please wait ${rl.retryAfterSeconds}s before trying again.` };
  }

  // Find username lookup
  const nameSnap = await getDoc(doc(db, "usernames", normUser));
  if (nameSnap.exists()) {
    const uData = nameSnap.data();
    const uid = uData.uid || `user_${normUser}`;

    // Cryptographic or legacy password match
    const isMatch = await verifyPasswordMatch(passwordEntered, uData.password);
    if (isMatch) {
      // Auto-upgrade legacy plaintext password to secure salted SHA-256
      if (uData.password && !uData.password.startsWith("sha256_")) {
        try {
          const newHash = await hashPasswordWithSalt(passwordEntered);
          await updateDoc(doc(db, "usernames", normUser), { password: newHash });
          await updateDoc(doc(db, "users", uid), { password: newHash });
        } catch (e) {}
      }

      const userSnap = await getDoc(doc(db, "users", uid));
      let userData: UserProfile;
      if (userSnap.exists()) {
        userData = userSnap.data() as UserProfile;
        try {
          await updateDoc(doc(db, "users", uid), { lastLoginAt: Date.now() });
        } catch (e) {}
      } else {
        userData = {
          uid,
          role: 'INDIVIDUAL',
          accountType: 'INDIVIDUAL',
          username: uData.username || usernameEntered.trim(),
          displayName: uData.username || usernameEntered.trim(),
          highScore: 0,
          xp: 100,
          coins: 100,
          solved: 0,
          correctAnswers: 0,
          currentLevel: 1,
          streak: 1,
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        try {
          await setDoc(doc(db, "users", uid), userData);
        } catch (e) {}
      }

      safeStorage.setItem('jesse_rock_role', (userData.accountType || 'individual').toLowerCase());
      safeStorage.setItem('jesse_rock_my_username', userData.username);
      safeStorage.setItem('jesse_rock_user_id', uid);
      safeStorage.setItem('jesse_rock_device_id', uid);

      return { success: true, user: userData };
    }

    // Try Firebase Auth if password was hashed/stored in auth
    try {
      const syntheticEmail = usernameToEmail(normUser);
      const userCred = await signInWithEmailAndPassword(auth, syntheticEmail, passwordEntered);
      const authUid = userCred.user.uid;

      const userSnap = await getDoc(doc(db, "users", authUid));
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        try {
          await updateDoc(doc(db, "users", authUid), { lastLoginAt: Date.now() });
        } catch (e) {}
        safeStorage.setItem('jesse_rock_role', (userData.accountType || 'individual').toLowerCase());
        safeStorage.setItem('jesse_rock_my_username', userData.username);
        safeStorage.setItem('jesse_rock_user_id', authUid);
        return { success: true, user: userData };
      }
    } catch (err: any) {
      if (err?.code === 'auth/user-disabled') {
        return { success: false, error: "ACCESS DENIED: This account has been completely blocked and disabled by the administration." };
      }
      console.warn("Auth check failed:", err?.message);
    }

    if (uData.password && !isMatch) {
      return { success: false, error: "Incorrect password entered." };
    }
  }

  // Check school_students collection for student account
  const studentQ = query(collection(db, 'school_students'), where('username_lower', '==', normUser));
  const studentSnap = await getDocs(studentQ);

  if (!studentSnap.empty) {
    const studentDoc = studentSnap.docs[0];
    const sData = studentDoc.data();
    const isStudentPassValid = !sData.password || (await verifyPasswordMatch(passwordEntered, sData.password));
    if (isStudentPassValid) {
      // Auto-upgrade student password to salted hash if plaintext
      if (sData.password && !sData.password.startsWith("sha256_")) {
        try {
          const newHash = await hashPasswordWithSalt(passwordEntered);
          await updateDoc(studentDoc.ref, { password: newHash });
        } catch (e) {}
      }

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

  let uid = `teacher_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    if (userCred.user?.uid) {
      uid = userCred.user.uid;
    }
  } catch (authErr: any) {
    console.warn("Firebase Auth fallback for teacher creation:", authErr?.message);
    if (authErr.code === 'auth/email-already-in-use') {
      return { success: false, error: "A teacher account already exists with this email address." };
    }
  }

  try {
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

    const secureHashedPassword = await hashPasswordWithSalt(passwordEntered);
    await setDoc(doc(db, "users", uid), {
      ...profile,
      password: secureHashedPassword
    });
    await setDoc(doc(db, "teachers", uid), {
      id: uid,
      teacher_name: cleanName,
      email: cleanEmail,
      password: secureHashedPassword,
      created_at: Date.now()
    });

    safeStorage.setItem('jesse_rock_role', 'teacher');
    safeStorage.setItem('jesse_rock_my_username', cleanEmail);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Teacher account creation error:", err);
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

  // Rate-limiting check
  const rl = checkActionRateLimit(`login_adult_${cleanEmail}`, 10, 60000);
  if (!rl.allowed) {
    return { success: false, error: `Too many login attempts. Please wait ${rl.retryAfterSeconds}s before trying again.` };
  }

  // 1. Try Firebase Auth
  let authUid: string | null = null;
  try {
    const userCred = await signInWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    authUid = userCred.user.uid;
  } catch (authErr: any) {
    if (authErr?.code === 'auth/user-disabled') {
      return { success: false, error: "ACCESS DENIED: This account has been completely blocked and disabled by the administration." };
    }
    console.warn("Firebase Auth sign-in fallback:", authErr?.message);
  }

  // 2. Check teachers collection directly
  const teacherQ = query(collection(db, 'teachers'), where('email', '==', cleanEmail));
  const teacherSnap = await getDocs(teacherQ);
  if (!teacherSnap.empty) {
    const tDoc = teacherSnap.docs[0];
    const tData = tDoc.data();
    const isTeacherPassValid = !tData.password || (await verifyPasswordMatch(passwordEntered, tData.password));
    if (isTeacherPassValid) {
      // Auto-upgrade plaintext to hash if needed
      if (tData.password && !tData.password.startsWith("sha256_")) {
        try {
          const newHash = await hashPasswordWithSalt(passwordEntered);
          await updateDoc(tDoc.ref, { password: newHash });
        } catch (e) {}
      }

      const uid = authUid || tDoc.id;
      const profile: UserProfile = {
        uid,
        role: 'TEACHER',
        accountType: 'TEACHER',
        username: cleanEmail,
        displayName: tData.teacher_name || 'Educator',
        email: cleanEmail,
        highScore: 0,
        xp: 500,
        coins: 500,
        solved: 0,
        correctAnswers: 0,
        currentLevel: 10,
        streak: 0,
        createdAt: tData.created_at || Date.now(),
        lastLoginAt: Date.now()
      };

      try {
        await setDoc(doc(db, "users", uid), profile, { merge: true });
      } catch (e) {}

      safeStorage.setItem('jesse_rock_role', 'teacher');
      safeStorage.setItem('jesse_rock_my_username', cleanEmail);
      safeStorage.setItem('jesse_rock_user_id', uid);

      return { success: true, user: profile };
    }
  }

  // 3. Check users collection
  if (authUid) {
    const userSnap = await getDoc(doc(db, "users", authUid));
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      try {
        await updateDoc(doc(db, "users", authUid), { lastLoginAt: Date.now() });
      } catch (e) {}

      safeStorage.setItem('jesse_rock_role', (userData.accountType || 'teacher').toLowerCase());
      safeStorage.setItem('jesse_rock_my_username', userData.username || cleanEmail);
      safeStorage.setItem('jesse_rock_user_id', authUid);

      return { success: true, user: userData };
    }
  }

  return { success: false, error: "Invalid email or password. Please verify your credentials." };
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

  let uid = `parent_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordEntered);
    if (userCred.user?.uid) {
      uid = userCred.user.uid;
    }
  } catch (authErr: any) {
    console.warn("Firebase Auth fallback for parent creation:", authErr?.message);
    if (authErr.code === 'auth/email-already-in-use') {
      return { success: false, error: "A parent account with this email address already exists." };
    }
  }

  try {
    const secureHashedPassword = await hashPasswordWithSalt(passwordEntered);
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

    await setDoc(doc(db, "users", uid), {
      ...profile,
      password: secureHashedPassword
    });

    safeStorage.setItem('jesse_rock_role', 'parent');
    safeStorage.setItem('jesse_rock_my_username', cleanEmail);
    safeStorage.setItem('jesse_rock_user_id', uid);

    return { success: true, user: profile };

  } catch (err: any) {
    console.error("Parent creation error:", err);
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

  // Rate-limiting check (5 attempts per minute per parent)
  const rl = checkActionRateLimit(`link_child_${parentUid}`, 5, 60000);
  if (!rl.allowed) {
    return { success: false, error: `Too many link attempts. Please wait ${rl.retryAfterSeconds}s before trying again.` };
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
    const studentRef = doc(db, "school_students", studentUid);
    const ssSnap = await getDoc(studentRef);
    if (ssSnap.exists()) {
      const data = ssSnap.data();
      const lastReset = data.lastPasswordResetAt || data.credentialsResetAt || 0;
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (lastReset && (Date.now() - lastReset < thirtyDaysMs)) {
        const daysRemaining = Math.ceil((thirtyDaysMs - (Date.now() - lastReset)) / (24 * 60 * 60 * 1000));
        return { success: false, error: `Strict Security Policy: Passwords can only be changed once per month (30 days) to prevent spam. Please wait ${daysRemaining} more days.` };
      }
    }

    if (auth.currentUser) {
      await updateAuthPassword(auth.currentUser, newPasswordEntered);
    }

    const now = Date.now();
    const secureHashedPassword = await hashPasswordWithSalt(newPasswordEntered);

    // Update user profile
    await updateDoc(doc(db, "users", studentUid), {
      password: secureHashedPassword,
      firstLoginRequired: false,
      lastPasswordResetAt: now
    });

    // Update school_students doc if exists
    if (ssSnap.exists()) {
      await updateDoc(studentRef, {
        password: secureHashedPassword,
        firstLoginRequired: false,
        lastPasswordResetAt: now,
        credentialsResetAt: now,
        updatedAt: now
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
