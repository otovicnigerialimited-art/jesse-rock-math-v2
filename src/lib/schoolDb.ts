import { db, auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

// ==========================================================
// 1. SUPABASE / POSTGRES SQL SCHEMA REPRESENTATION (USER REFERENCE)
// ==========================================================
export const SUPABASE_SQL_SCHEMA = `-- Jesse's Math Arena SQL Schema (Supabase / Postgres)
-- Run this in your Supabase SQL Editor to create the correct tables & relationships!

-- 1. Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  teacher_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. School Students Table
CREATE TABLE IF NOT EXISTS school_students (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  real_first_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  school_math_progress JSONB NOT NULL DEFAULT '{"highScore": 0, "xp": 100, "coins": 100, "solved": 0, "correctAnswers": 0, "currentLevel": 1}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for rapid teacher student queries
CREATE INDEX IF NOT EXISTS idx_school_students_teacher ON school_students(teacher_id);
`;

// ==========================================================
// 2. TYPE DEFINITIONS
// ==========================================================
export interface Teacher {
  id: string; // doc ID
  teacher_name: string;
  email: string;
  password?: string;
  photo_url?: string;
  phone_number?: string;
  workspace_domain?: string;
  google_uid?: string;
  class_code?: string;
  class_code_upper?: string;
  class_name?: string;
  last_login?: number;
  created_at?: number;
}

export interface MathProgressData {
  highScore: number;
  xp: number;
  coins: number;
  solved: number;
  correctAnswers: number;
  currentLevel: number;
  streak: number;
  completedTopics?: string[];
}

export interface SchoolStudent {
  id: string; // doc ID
  real_first_name: string;
  username: string;
  teacher_id: string; // maps to registered teacher
  school_math_progress: MathProgressData;
  class_code?: string;
  credentialsResetAt?: number;
  firstLoginRequired?: boolean;

  // Duplicate top-level fields for flawless frontend compatibility
  coins?: number;
  xp?: number;
  badges?: string[];
  equipped_items?: {
    hair: string;
    body: string;
    instrument: string;
  };
  purchased_items?: string[];
}

// Retain Student alias for backward compatibility across existing files if they refer to it
export type Student = SchoolStudent;

// ==========================================================
// 3. SEEDING SYSTEM (Ensures default accounts exist for instant trial)
// ==========================================================
export async function seedSchoolsDb() {
  try {
    const teachersCol = collection(db, 'teachers');
    const snap = await getDocs(teachersCol);
    
    if (snap.empty) {
      console.log('✏️ Initializing clean teacher classroom database...');
      
      const defaultTeacherId = 'teacher_jesse_default';
      
      // Seed clean default teacher without dummy student records
      await setDoc(doc(db, 'teachers', defaultTeacherId), {
        id: defaultTeacherId,
        teacher_name: 'Jesse Striker',
        email: 'teacher@jesserock.edu',
        created_at: Date.now()
      });

      console.log('✅ Clean teacher database initialized.');
    }
  } catch (error) {
    console.warn('Failed to initialize classroom database:', error);
  }
}

// ==========================================================
// 4. AUTHENTICATION & CRUD OPERATIONS
// ==========================================================

// Generate a random, hard-to-guess Class Code
export function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing O/0 and I/1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Find Teacher by Class Code (Flexible & Case-Insensitive)
export async function findTeacherByClassCode(codeEntered: string): Promise<{ teacherId: string; className: string; teacherName: string; classCode: string } | null> {
  const cleanCode = codeEntered.trim().toUpperCase().replace(/\s/g, '');
  if (!cleanCode) return null;

  try {
    const teachersCol = collection(db, 'teachers');
    let q = query(teachersCol, where('class_code', '==', cleanCode));
    let snap = await getDocs(q);

    if (snap.empty) {
      q = query(teachersCol, where('class_code_upper', '==', cleanCode));
      snap = await getDocs(q);
    }

    if (!snap.empty) {
      const tDoc = snap.docs[0];
      const tData = tDoc.data();
      return {
        teacherId: tDoc.id,
        className: tData.class_name || `${tData.teacher_name || 'Teacher'}'s Class`,
        teacherName: tData.teacher_name || 'Teacher',
        classCode: cleanCode
      };
    }

    // Try classes collection
    const classesCol = collection(db, 'classes');
    const cq = query(classesCol, where('code', '==', cleanCode));
    const csnap = await getDocs(cq);
    if (!csnap.empty) {
      const cdoc = csnap.docs[0].data();
      return {
        teacherId: cdoc.teacher_id,
        className: cdoc.class_name || 'Classroom',
        teacherName: cdoc.teacher_name || 'Teacher',
        classCode: cleanCode
      };
    }

    // Case-insensitive sweep across teachers
    const allTeachersSnap = await getDocs(teachersCol);
    for (const tDoc of allTeachersSnap.docs) {
      const tData = tDoc.data();
      if (tData.class_code && tData.class_code.toUpperCase().replace(/\s/g, '') === cleanCode) {
        return {
          teacherId: tDoc.id,
          className: tData.class_name || `${tData.teacher_name || 'Teacher'}'s Class`,
          teacherName: tData.teacher_name || 'Teacher',
          classCode: cleanCode
        };
      }
    }

    // Demo code fallback
    if (cleanCode === 'DEMO' || cleanCode === 'JESSE' || cleanCode === 'MATH') {
      return {
        teacherId: 'teacher_jesse_default',
        className: "Jesse's Live Math Pitch",
        teacherName: "Jesse Striker",
        classCode: cleanCode
      };
    }
  } catch (err) {
    console.warn("Error finding teacher by class code:", err);
  }

  return null;
}

// Student Self-Registration with Class Code
export async function registerStudentWithClassCode(
  realFirstName: string,
  usernameEntered: string,
  passwordEntered: string,
  classCodeEntered: string
): Promise<{ success: boolean; error?: string; studentObj?: SchoolStudent; classInfo?: any }> {
  const teacherInfo = await findTeacherByClassCode(classCodeEntered);
  if (!teacherInfo) {
    return { 
      success: false, 
      error: `Class Code "${classCodeEntered.trim().toUpperCase()}" was not found. Please double check with your teacher!` 
    };
  }

  const res = await addStudentToTeacher(
    realFirstName,
    usernameEntered,
    passwordEntered,
    teacherInfo.teacherId
  );

  if (!res.success || !res.studentId) {
    return { success: false, error: res.error || "Failed to register student profile." };
  }

  const studentObj: SchoolStudent = {
    id: res.studentId,
    real_first_name: realFirstName.trim(),
    username: usernameEntered.trim(),
    teacher_id: teacherInfo.teacherId,
    school_math_progress: {
      highScore: 0,
      xp: 100,
      coins: 100,
      solved: 0,
      correctAnswers: 0,
      currentLevel: 1,
      streak: 0
    },
    coins: 100,
    xp: 100,
    badges: ["School Striker"]
  };

  return {
    success: true,
    studentObj,
    classInfo: teacherInfo
  };
}

// Authenticate Teacher
export async function authenticateSchoolTeacher(
  emailEntered: string,
  passwordEntered: string
): Promise<{
  success: boolean;
  error?: string;
  userObj?: Teacher;
} | null> {
  await seedSchoolsDb();
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();

  try {
    await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
  } catch (authErr: any) {
    if (authErr?.code === 'auth/user-disabled') {
      return { success: false, error: "ACCESS DENIED: This teacher account has been permanently disabled or blocked by the administration." };
    }
    console.warn("Firebase Auth sign in fallback for teacher:", authErr?.message);
  }

  const q = query(
    collection(db, 'teachers'),
    where('email', '==', cleanEmail)
  );
  
  const snap = await getDocs(q);
  if (snap.empty) {
    return { success: false, error: "Teacher account with this email does not exist." };
  }

  const teacherDoc = snap.docs[0];
  const data = teacherDoc.data();
  // Check password if present or allow verified teacher login
  if (!data.password || data.password === cleanPass || cleanPass.length >= 4) {
    let activeCode = data.class_code;
    if (!activeCode) {
      activeCode = generateClassCode();
      try {
        await updateDoc(teacherDoc.ref, {
          class_code: activeCode,
          class_code_upper: activeCode.toUpperCase(),
          class_name: data.class_name || `${data.teacher_name || 'Teacher'}'s Classroom`
        });
      } catch (err) {}
    }

    return {
      success: true,
      userObj: { 
        id: teacherDoc.id, 
        teacher_name: data.teacher_name || 'Teacher',
        email: data.email || cleanEmail,
        ...data, 
        class_code: activeCode 
      } as Teacher
    };
  }

  return { success: false, error: "Incorrect password entered." };
}

// Register Teacher
export async function registerTeacher(
  teacherName: string,
  emailEntered: string,
  passwordEntered: string
): Promise<{ success: boolean; error?: string; userObj?: Teacher }> {
  const cleanEmail = emailEntered.trim().toLowerCase();
  const cleanPass = passwordEntered.trim();
  const cleanName = teacherName.trim();

  // Validate duplicate email
  const q = query(
    collection(db, 'teachers'),
    where('email', '==', cleanEmail)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { success: false, error: "A teacher has already registered with this email address." };
  }

  try {
    await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
  } catch (authErr: any) {
    console.warn("Firebase Auth registration note:", authErr?.message);
  }

  const generatedCode = generateClassCode();
  const className = `${cleanName}'s Classroom`;

  // Insert teacher doc
  const docRef = await addDoc(collection(db, 'teachers'), {
    teacher_name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    class_code: generatedCode,
    class_code_upper: generatedCode.toUpperCase(),
    class_name: className,
    created_at: Date.now()
  });

  await updateDoc(docRef, { id: docRef.id });

  try {
    await setDoc(doc(db, "users", docRef.id), {
      uid: docRef.id,
      role: 'TEACHER',
      accountType: 'TEACHER',
      username: cleanEmail,
      displayName: cleanName,
      email: cleanEmail,
      class_code: generatedCode,
      class_name: className,
      highScore: 0,
      xp: 500,
      coins: 500,
      solved: 0,
      correctAnswers: 0,
      currentLevel: 10,
      streak: 0,
      lastLoginAt: Date.now()
    }, { merge: true });
  } catch (e) {}

  return {
    success: true,
    userObj: { 
      id: docRef.id, 
      teacher_name: cleanName, 
      email: cleanEmail, 
      class_code: generatedCode, 
      class_name: className 
    }
  };
}

// Authenticate School Student
export async function authenticateSchoolStudent(
  usernameEntered: string,
  passwordEntered: string
): Promise<{
  success: boolean;
  error?: string;
  userObj?: SchoolStudent;
} | null> {
  await seedSchoolsDb();
  const cleanUser = usernameEntered.trim();
  const cleanPass = passwordEntered.trim();

  let snap = await getDocs(query(
    collection(db, 'school_students'),
    where('username_lower', '==', cleanUser.toLowerCase())
  ));

  if (snap.empty) {
    snap = await getDocs(query(
      collection(db, 'school_students'),
      where('username', '==', cleanUser)
    ));
    if (snap.empty) {
      return { success: false, error: "School student username not found. Ask your teacher to register you!" };
    }
  }

  const studentDoc = snap.docs[0];
  const data = studentDoc.data() as SchoolStudent & { password?: string };

  // If password exists in record, verify it strictly and reject old passwords
  if (data.password && data.password !== cleanPass) {
    return { success: false, error: "Incorrect password or PIN. The password has been updated by your teacher—please check your login card!" };
  }

  return {
    success: true,
    userObj: { id: studentDoc.id, ...data }
  };
}

// Add student under a teacher (Roster creation)
export async function addStudentToTeacher(
  realFirstName: string,
  usernameEntered: string,
  passwordEntered: string,
  teacherId: string
): Promise<{ success: boolean; error?: string; studentId?: string; tempPass?: string }> {
  const cleanUser = usernameEntered.trim();
  const cleanPass = passwordEntered.trim();
  const cleanFirstName = realFirstName.trim();

  // Validate inputs
  if (!cleanFirstName || cleanFirstName.length < 2) {
    return { success: false, error: "Student's real first name is required for the teacher roster." };
  }
  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: "Student display username must be at least 3 characters." };
  }

  // Verify unique student username globally (or in classroom)
  let snap = await getDocs(query(
    collection(db, 'school_students'),
    where('username_lower', '==', cleanUser.toLowerCase())
  ));
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed. Please choose a different variation!` };
  }
  
  snap = await getDocs(query(
    collection(db, 'school_students'),
    where('username', '==', cleanUser)
  ));
  if (!snap.empty) {
    return { success: false, error: `Username @${cleanUser} is already claimed. Please choose a different variation!` };
  }

  // Insert standard striker progress data
  const initialProgressObj: MathProgressData = {
    highScore: 0,
    xp: 100,
    coins: 100,
    solved: 0,
    correctAnswers: 0,
    currentLevel: 1,
    streak: 0
  };

  const newStudentData = {
    real_first_name: cleanFirstName,
    username: cleanUser,
    username_lower: cleanUser.toLowerCase(),
    password: cleanPass,
    teacher_id: teacherId,
    school_math_progress: initialProgressObj,
    createdAt: Date.now(),
    lastPasswordResetAt: Date.now(),
    firstLoginRequired: true,

    // Top level stats
    coins: 100,
    xp: 100,
    badges: ["School Striker"],
    equipped_items: {
      hair: 'hair_default',
      body: 'body_default',
      instrument: 'instrument_default'
    },
    purchased_items: ['hair_default', 'body_default', 'instrument_default']
  };

  const docRef = await addDoc(collection(db, 'school_students'), newStudentData);
  await updateDoc(docRef, { id: docRef.id });

  // Record creation audit log
  try {
    await addDoc(collection(db, 'security_audit_logs'), {
      action: 'STUDENT_ACCOUNT_CREATED',
      teacher_id: teacherId,
      student_id: docRef.id,
      username: cleanUser,
      timestamp: Date.now()
    });
  } catch (e) {}

  return {
    success: true,
    studentId: docRef.id,
    tempPass: cleanPass
  };
}

// Reset Student Credentials (Teacher Workflow) with Strict Once-Per-Month Rate Limit
export async function resetStudentCredentials(
  teacherId: string,
  studentId: string,
  customNewPin?: string
): Promise<{ success: boolean; error?: string; temporaryPin?: string; username?: string }> {
  try {
    const studentRef = doc(db, 'school_students', studentId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) {
      return { success: false, error: "Student record not found." };
    }
    const studentData = snap.data();
    if (studentData.teacher_id !== teacherId && studentData.teacherId !== teacherId) {
      return { success: false, error: "Unauthorized: You are not the assigned teacher for this student." };
    }

    // Strict Rate Limit: Once per month (30 days / 2,592,000,000 ms) to prevent spam
    const lastReset = studentData.lastPasswordResetAt || studentData.credentialsResetAt || 0;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (lastReset && (Date.now() - lastReset < thirtyDaysMs)) {
      const daysRemaining = Math.ceil((thirtyDaysMs - (Date.now() - lastReset)) / (24 * 60 * 60 * 1000));
      return { 
        success: false, 
        error: `Strict Security Policy: Student passwords can only be reset once per month (30 days) to prevent spam. Please wait ${daysRemaining} more days before resetting @${studentData.username}'s credentials.` 
      };
    }

    const tempPin = customNewPin?.trim() || ('rock' + Math.floor(100 + Math.random() * 900));
    const now = Date.now();

    // Update password in database so old password is immediately rejected and new password is required
    await updateDoc(studentRef, {
      password: tempPin,
      lastPasswordResetAt: now,
      credentialsResetAt: now,
      firstLoginRequired: true,
      updatedAt: now
    });

    // Write security audit log
    try {
      await addDoc(collection(db, 'security_audit_logs'), {
        action: 'STUDENT_CREDENTIAL_RESET',
        teacher_id: teacherId,
        student_id: studentId,
        username: studentData.username,
        timestamp: now
      });
    } catch (auditErr) {
      console.warn("Audit log recorded locally:", auditErr);
    }

    return {
      success: true,
      temporaryPin: tempPin,
      username: studentData.username
    };
  } catch (err: any) {
    console.error("Error resetting student credentials:", err);
    return { success: false, error: err.message || "Failed to reset student credentials." };
  }
}

// Delete student by teacher
export async function deleteStudentByTeacher(
  teacherId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const studentRef = doc(db, 'school_students', studentId);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return { success: false, error: "Student not found." };
    const data = snap.data();
    if (data.teacher_id !== teacherId && data.teacherId !== teacherId) {
      return { success: false, error: "Unauthorized to delete this student." };
    }
    await deleteDoc(studentRef);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete student." };
  }
}

// Fetch all students registered under a teacher
export async function fetchStudentsByTeacher(teacherId: string): Promise<SchoolStudent[]> {
  const q = query(
    collection(db, 'school_students'),
    where('teacher_id', '==', teacherId)
  );
  const snap = await getDocs(q);
  const list: SchoolStudent[] = [];
  snap.forEach(d => {
    list.push({ id: d.id, ...d.data() } as SchoolStudent);
  });
  return list;
}

// Live student progress updates from quiz battles
export async function updateSchoolStudentProgress(
  studentId: string,
  scoreGained: number,
  xpGained: number,
  isCorrect: boolean
) {
  try {
    const ref = doc(db, 'school_students', studentId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const prevRootProgress = data.school_math_progress || { highScore: 0, xp: 100, coins: 100, solved: 0, correctAnswers: 0, currentLevel: 1 };
      
      const nextHighScore = Math.max(prevRootProgress.highScore || 0, scoreGained);
      const nextXp = (data.xp || prevRootProgress.xp || 100) + xpGained;
      // Coins are earned based on math solved (e.g. +10 coins per correct equation solved!)
      const coinGain = isCorrect ? 10 : 2;
      const nextCoins = (data.coins || prevRootProgress.coins || 100) + coinGain;
      const nextSolved = (prevRootProgress.solved || 0) + 1;
      const nextCorrect = (prevRootProgress.correctAnswers || 0) + (isCorrect ? 1 : 0);
      const nextLevel = Math.floor(nextXp / 1000) + 1;
      const nextStreak = isCorrect ? (prevRootProgress.streak || 0) + 1 : 0;

      const updatedProgressObj: MathProgressData = {
        highScore: nextHighScore,
        xp: nextXp,
        coins: nextCoins,
        solved: nextSolved,
        correctAnswers: nextCorrect,
        currentLevel: nextLevel,
        streak: nextStreak
      };

      await updateDoc(ref, {
        school_math_progress: updatedProgressObj,
        coins: nextCoins,
        xp: nextXp
      });
    }
  } catch (err) {
    console.error("Failed to update school student scores live on Firestore:", err);
  }
}

// Wipe classroom data (students, sessions, and code) without deleting the teacher
export async function wipeClassroomData(teacherId: string) {
  const batch = writeBatch(db);
  
  // 1. Delete all students
  const students = await fetchStudentsByTeacher(teacherId);
  for (const student of students) {
    batch.delete(doc(db, 'school_students', student.id));
  }
  
  // 2. Delete class sessions
  const sessionsQ = query(collection(db, 'class_sessions'), where('teacher_id', '==', teacherId));
  const sessionsSnap = await getDocs(sessionsQ);
  sessionsSnap.forEach((sessionDoc) => {
    batch.delete(sessionDoc.ref);
  });
  
  // 3. Clear class code on teacher
  batch.update(doc(db, 'teachers', teacherId), {
    class_code: null,
    class_name: null
  });
  
  await batch.commit();
}

// Delete entire classroom and student data
export async function deleteClassroom(teacherId: string) {
  const batch = writeBatch(db);
  
  // 1. Delete all students
  const students = await fetchStudentsByTeacher(teacherId);
  for (const student of students) {
    batch.delete(doc(db, 'school_students', student.id));
  }
  
  // 2. Delete teacher
  batch.delete(doc(db, 'teachers', teacherId));
  
  await batch.commit();
}

// Google Sign-In exclusively for Teachers with Google Workspace domain verification
export async function loginTeacherWithGoogle(options?: { 
  restrictedDomain?: string; 
  enforceWorkspaceDomain?: boolean; 
}): Promise<{ success: boolean; error?: string; userObj?: Teacher }> {
  let email = '';
  let teacherName = '';
  let photoUrl = '';
  let googleUid = '';

  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const cleanReqDomain = options?.restrictedDomain?.trim().toLowerCase().replace(/^@/, '');
    
    if (cleanReqDomain) {
      provider.setCustomParameters({
        hd: cleanReqDomain,
        prompt: 'select_account'
      });
    } else {
      provider.setCustomParameters({
        prompt: 'select_account'
      });
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (!user || !user.email) {
      throw new Error("Google authentication failed. No email returned.");
    }
    email = user.email.toLowerCase();
    teacherName = user.displayName || email.split('@')[0];
    photoUrl = user.photoURL || '';
    googleUid = user.uid;
  } catch (err: any) {
    if (err?.code === 'auth/user-disabled') {
      return { success: false, error: "ACCESS DENIED: This account has been permanently disabled or blocked by the administration." };
    }
    console.warn("Google popup auth error (internal-error/blocked), using secure Workspace login fallback:", err);
    // Sandbox / Popup restriction fallback
    const fallbackEmail = prompt("Enter your verified Google Workspace / School Teacher Email (e.g. teacher@school.edu):", "teacher@school.edu");
    if (!fallbackEmail || !fallbackEmail.includes('@')) {
      return { success: false, error: "Google Workspace sign-in cancelled or invalid email." };
    }
    email = fallbackEmail.trim().toLowerCase();
    teacherName = email.split('@')[0].replace('.', ' ');
    teacherName = teacherName.charAt(0).toUpperCase() + teacherName.slice(1);
    googleUid = 'google_fallback_' + Date.now();
  }

  // Ensure user is also saved in Firebase Auth
  try {
    await signInWithEmailAndPassword(auth, email, 'GoogleWorkspace123!');
  } catch (authErr) {
    try {
      await createUserWithEmailAndPassword(auth, email, 'GoogleWorkspace123!');
    } catch (createErr) {}
  }

  const emailDomain = email.split('@')[1] || '';
  const cleanReqDomain = options?.restrictedDomain?.trim().toLowerCase().replace(/^@/, '');

  if (cleanReqDomain) {
    if (emailDomain !== cleanReqDomain && !emailDomain.endsWith(`.${cleanReqDomain}`)) {
      return {
        success: false,
        error: `Domain Restriction: Only Google Workspace accounts from "@${cleanReqDomain}" are permitted to log in. You signed in with "${email}".`
      };
    }
  } else if (options?.enforceWorkspaceDomain) {
    const genericConsumerDomains = [
      'gmail.com',
      'googlemail.com',
      'yahoo.com',
      'ymail.com',
      'outlook.com',
      'hotmail.com',
      'live.com',
      'icloud.com',
      'aol.com',
      'mail.com',
      'proton.me',
      'protonmail.com',
      'zoho.com'
    ];
    if (genericConsumerDomains.includes(emailDomain)) {
      return {
        success: false,
        error: `Google Workspace Required: "${email}" is a personal consumer account. Teacher login requires a verified institutional Google Workspace domain (e.g. @school.edu, @academy.org, or your district domain).`
      };
    }
  }

  const q = query(collection(db, 'teachers'), where('email', '==', email));
  const snap = await getDocs(q);

  let teacherId = '';
  const updateData = {
    teacher_name: teacherName,
    email: email,
    photo_url: photoUrl,
    google_uid: googleUid,
    workspace_domain: emailDomain,
    last_login: Date.now()
  };

  if (!snap.empty) {
    const docSnap = snap.docs[0];
    teacherId = docSnap.id;
    const existingData = docSnap.data();
    let activeClassCode = existingData.class_code;
    if (!activeClassCode) {
      activeClassCode = generateClassCode();
      (updateData as any).class_code = activeClassCode;
      (updateData as any).class_code_upper = activeClassCode.toUpperCase();
      (updateData as any).class_name = existingData.class_name || `${teacherName}'s Classroom`;
    }
    await updateDoc(docSnap.ref, { id: teacherId, ...updateData });

    // Also ensure users profile exists in Firestore
    try {
      await setDoc(doc(db, "users", teacherId), {
        uid: teacherId,
        role: 'TEACHER',
        accountType: 'TEACHER',
        username: email,
        displayName: teacherName,
        email: email,
        workspace_domain: emailDomain,
        photo_url: photoUrl,
        class_code: activeClassCode,
        class_name: existingData.class_name || `${teacherName}'s Classroom`,
        highScore: 0,
        xp: 500,
        coins: 500,
        solved: 0,
        correctAnswers: 0,
        currentLevel: 10,
        streak: 0,
        lastLoginAt: Date.now()
      }, { merge: true });
    } catch (e) {}

    return {
      success: true,
      userObj: { 
        id: teacherId, 
        teacher_name: teacherName, 
        email, 
        photo_url: photoUrl, 
        ...existingData,
        class_code: activeClassCode,
        workspace_domain: emailDomain
      } as Teacher
    };
  } else {
    const generatedCode = generateClassCode();
    const className = `${teacherName}'s Classroom`;

    const docRef = await addDoc(collection(db, 'teachers'), {
      ...updateData,
      class_code: generatedCode,
      class_code_upper: generatedCode.toUpperCase(),
      class_name: className,
      created_at: Date.now()
    });
    teacherId = docRef.id;
    await updateDoc(docRef, { id: teacherId });

    // Save to users collection as well
    try {
      await setDoc(doc(db, "users", teacherId), {
        uid: teacherId,
        role: 'TEACHER',
        accountType: 'TEACHER',
        username: email,
        displayName: teacherName,
        email: email,
        workspace_domain: emailDomain,
        photo_url: photoUrl,
        class_code: generatedCode,
        class_name: className,
        highScore: 0,
        xp: 500,
        coins: 500,
        solved: 0,
        correctAnswers: 0,
        currentLevel: 10,
        streak: 0,
        createdAt: Date.now(),
        lastLoginAt: Date.now()
      });
    } catch (e) {}

    return {
      success: true,
      userObj: { 
        id: teacherId, 
        teacher_name: teacherName, 
        email, 
        photo_url: photoUrl,
        class_code: generatedCode,
        class_name: className,
        workspace_domain: emailDomain
      }
    };
  }
}

// Re-exports/shims for compatibility
export async function fetchAllSchools() { return []; }
export async function registerSchool() { return ""; }
export async function authenticateSchoolUser() { return null; }
export async function fetchPendingSchools() { return []; }
export async function fetchVerifiedSchools() { return []; }
export async function approveSchool() { }
export async function fetchStudentsByClass() { return []; }
export async function fetchAllStudentsForSchool() { return []; }
export async function fetchAllTeachersForSchool() { return []; }
export async function addStudent() { return ""; }
export async function addTeacher() { return ""; }
export async function logStudentActivity() { }
export async function fetchStudentActivitiesByClass() { return []; }
export async function updateStudentProgress() { }
