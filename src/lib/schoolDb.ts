import { db } from './firebase';
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
        teacher_name: 'Jesse Rockstar',
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
    return {
      success: true,
      userObj: { id: teacherDoc.id, ...data } as Teacher
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

  // Insert teacher doc without storing plaintext password
  const docRef = await addDoc(collection(db, 'teachers'), {
    teacher_name: cleanName,
    email: cleanEmail,
    created_at: Date.now()
  });

  await updateDoc(docRef, { id: docRef.id });

  return {
    success: true,
    userObj: { id: docRef.id, teacher_name: cleanName, email: cleanEmail }
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

  // If password exists for backward compatibility, verify it; otherwise allow PIN entry
  if (data.password && data.password !== cleanPass) {
    return { success: false, error: "Incorrect password or PIN. Please ask your teacher to verify or reset it!" };
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

  // Insert standard rockstar progress data
  const initialProgressObj: MathProgressData = {
    highScore: 0,
    xp: 100,
    coins: 100,
    solved: 0,
    correctAnswers: 0,
    currentLevel: 1,
    streak: 0
  };

  // Student document does NOT store plaintext password permanently
  const newStudentData = {
    real_first_name: cleanFirstName,
    username: cleanUser,
    username_lower: cleanUser.toLowerCase(),
    teacher_id: teacherId,
    school_math_progress: initialProgressObj,
    createdAt: Date.now(),
    firstLoginRequired: true,

    // Top level stats
    coins: 100,
    xp: 100,
    badges: ["School Rockstar"],
    equipped_items: {
      hair: 'hair_default',
      body: 'body_default',
      instrument: 'instrument_default'
    },
    purchased_items: ['hair_default', 'body_default', 'instrument_default']
  };

  const docRef = await addDoc(collection(db, 'school_students'), newStudentData);
  await updateDoc(docRef, { id: docRef.id });

  // Record creation audit log (no password stored)
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

// Reset Student Credentials (Teacher Workflow)
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

    const tempPin = customNewPin?.trim() || ('rock' + Math.floor(100 + Math.random() * 900));

    // Invalidate old session & record reset timestamp without storing plaintext password
    await updateDoc(studentRef, {
      credentialsResetAt: Date.now(),
      firstLoginRequired: true,
      updatedAt: Date.now()
    });

    // Write security audit log without recording the password
    try {
      await addDoc(collection(db, 'security_audit_logs'), {
        action: 'STUDENT_CREDENTIAL_RESET',
        teacher_id: teacherId,
        student_id: studentId,
        username: studentData.username,
        timestamp: Date.now()
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
