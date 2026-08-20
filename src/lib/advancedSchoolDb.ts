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
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreUtils';
import { SchoolStudent } from './schoolDb';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface School {
  id: string;
  name: string;
  code: string;
  adminEmail: string;
  adminPassword?: string;
  created_at: number;
}

export interface ClassRoom {
  id: string;
  school_id: string;
  class_name: string;
  year_group: string;
  teacher_ids: string[];
  student_count: number;
  created_at: number;
}

export interface ClassSession {
  id: string;
  teacher_id: string;
  class_id: string;
  class_name: string;
  topic: string;
  skill: string;
  activity: string;
  duration_minutes: number;
  status: 'active' | 'ended';
  start_time: number;
  end_time?: number;
  summary?: {
    completion_pct: number;
    avg_score: number;
    avg_accuracy: number;
    strongest_skill: string;
    weakest_skill: string;
    students_needing_support: string[];
    common_mistakes: string[];
  };
}

export interface StudentHelpRequest {
  id: string;
  session_id?: string;
  student_id: string;
  student_name: string;
  class_id: string;
  teacher_id: string;
  topic: string;
  skill: string;
  question_index: number;
  question_text: string;
  student_answer: string;
  working_notes?: string;
  attempts: number;
  time_spent_seconds: number;
  status: 'pending' | 'resolved';
  timestamp: number;
}

export interface ClassMisconception {
  id: string;
  class_id: string;
  teacher_id: string;
  topic: string;
  skill: string;
  misconception_title: string;
  affected_student_count: number;
  total_student_count: number;
  percentage: number;
  example_mistakes: string[];
  evidence: string[];
  status: 'detected' | 'addressed';
  created_at: number;
}

export interface InterventionGroupData {
  id: string;
  class_id: string;
  teacher_id: string;
  topic: string;
  skill: string;
  groups: {
    support: { student_ids: string[]; assigned_activity?: string };
    developing: { student_ids: string[]; assigned_activity?: string };
    secure: { student_ids: string[]; assigned_activity?: string };
  };
  updated_at: number;
}

export interface HomeworkAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  topic: string;
  skill: string;
  question_count: number;
  difficulty: string;
  due_date: string;
  created_at: number;
}

export interface HomeworkSubmission {
  id: string;
  homework_id: string;
  student_id: string;
  student_name: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  score: number;
  accuracy: number;
  completed_at?: number;
}

export interface ExitTicket {
  id: string;
  class_id: string;
  teacher_id: string;
  topic: string;
  skill: string;
  question_count: number;
  difficulty: string;
  status: 'active' | 'closed';
  created_at: number;
  questions: Array<{
    id: number;
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }>;
}

export interface ExitTicketResult {
  id: string;
  ticket_id: string;
  student_id: string;
  student_name: string;
  score: number;
  total: number;
  accuracy: number;
  misconceptions: string[];
  submitted_at: number;
}

export interface StudentJourneyEvent {
  id: string;
  student_id: string;
  event_type: 'lesson_started' | 'mistake_made' | 'targeted_practice' | 'accuracy_boost' | 'skill_mastered' | 'homework_completed' | 'assessment_taken';
  topic: string;
  skill: string;
  title: string;
  description: string;
  old_accuracy?: number;
  new_accuracy?: number;
  timestamp: number;
}

export interface Assessment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  topic: string;
  skills: string[];
  difficulty: string;
  question_count: number;
  time_limit_mins: number;
  calculator_allowed: boolean;
  questions: Array<{
    id: string;
    type: 'multiple_choice' | 'short_answer' | 'word_problem';
    text: string;
    options?: string[];
    correctAnswer: string;
    skill: string;
    points: number;
  }>;
  created_at: number;
}

export interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  student_id: string;
  student_name: string;
  score: number;
  max_score: number;
  accuracy: number;
  time_spent_secs: number;
  common_mistakes: string[];
  submitted_at: number;
}

// ==========================================
// 2. SCHOOL & CLASSROOM API
// ==========================================

export async function createSchool(name: string, adminEmail: string): Promise<School> {
  const code = 'SCH-' + Math.floor(1000 + Math.random() * 9000);
  const data = {
    name,
    code,
    adminEmail: adminEmail.toLowerCase().trim(),
    created_at: Date.now()
  };
  const ref = await addDoc(collection(db, 'schools'), data);
  return { id: ref.id, ...data };
}

export async function fetchSchoolByAdmin(email: string): Promise<School | null> {
  try {
    const q = query(collection(db, 'schools'), where('adminEmail', '==', email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as School;
    }
  } catch (err) {
    console.warn('fetchSchoolByAdmin failed:', err);
  }
  return null;
}

export async function createClassRoom(schoolId: string, className: string, yearGroup: string, teacherIds: string[]): Promise<ClassRoom> {
  const data = {
    school_id: schoolId,
    class_name: className,
    year_group: yearGroup,
    teacher_ids: teacherIds,
    student_count: 0,
    created_at: Date.now()
  };
  const ref = await addDoc(collection(db, 'classes'), data);
  return { id: ref.id, ...data };
}

export async function fetchClassesBySchool(schoolId: string): Promise<ClassRoom[]> {
  try {
    const q = query(collection(db, 'classes'), where('school_id', '==', schoolId));
    const snap = await getDocs(q);
    const res: ClassRoom[] = [];
    snap.forEach(d => res.push({ id: d.id, ...d.data() } as ClassRoom));
    return res;
  } catch (err) {
    console.warn('fetchClassesBySchool failed:', err);
    return [];
  }
}

// ==========================================
// 3. LIVE CLASS SESSIONS
// ==========================================

export async function startClassSession(
  teacherId: string,
  classId: string,
  className: string,
  topic: string,
  skill: string,
  activity: string,
  durationMinutes: number
): Promise<ClassSession> {
  const sessionData = {
    teacher_id: teacherId,
    class_id: classId,
    class_name: className,
    topic,
    skill,
    activity,
    duration_minutes: durationMinutes,
    status: 'active' as const,
    start_time: Date.now()
  };
  const ref = await addDoc(collection(db, 'class_sessions'), sessionData);
  return { id: ref.id, ...sessionData };
}

export async function endClassSession(sessionId: string, summary: ClassSession['summary']): Promise<void> {
  const ref = doc(db, 'class_sessions', sessionId);
  await updateDoc(ref, {
    status: 'ended',
    end_time: Date.now(),
    summary
  });
}

// ==========================================
// 4. STUDENT HELP REQUESTS
// ==========================================

export async function sendHelpRequest(
  studentId: string,
  studentName: string,
  classId: string,
  teacherId: string,
  topic: string,
  skill: string,
  questionIndex: number,
  questionText: string,
  studentAnswer: string,
  timeSpentSeconds: number,
  workingNotes?: string
): Promise<string> {
  const reqData = {
    student_id: studentId,
    student_name: studentName,
    class_id: classId,
    teacher_id: teacherId,
    topic,
    skill,
    question_index: questionIndex,
    question_text: questionText,
    student_answer: studentAnswer,
    working_notes: workingNotes || '',
    attempts: 1,
    time_spent_seconds: timeSpentSeconds,
    status: 'pending' as const,
    timestamp: Date.now()
  };
  const ref = await addDoc(collection(db, 'student_help_requests'), reqData);
  return ref.id;
}

export async function resolveHelpRequest(requestId: string): Promise<void> {
  const ref = doc(db, 'student_help_requests', requestId);
  await updateDoc(ref, { status: 'resolved' });
}

// ==========================================
// 5. HOMEWORK & EXIT TICKETS
// ==========================================

export async function createHomework(
  teacherId: string,
  classId: string,
  title: string,
  topic: string,
  skill: string,
  questionCount: number,
  difficulty: string,
  dueDate: string
): Promise<HomeworkAssignment> {
  const data = {
    teacher_id: teacherId,
    class_id: classId,
    title,
    topic,
    skill,
    question_count: questionCount,
    difficulty,
    due_date: dueDate,
    created_at: Date.now()
  };
  const ref = await addDoc(collection(db, 'homework_assignments'), data);
  return { id: ref.id, ...data };
}

export const createHomeworkAssignment = createHomework;

export async function createExitTicket(
  teacherId: string,
  classId: string,
  topic: string,
  skill: string,
  questionCount: number,
  difficulty: string,
  questions: ExitTicket['questions']
): Promise<ExitTicket> {
  const data = {
    teacher_id: teacherId,
    class_id: classId,
    topic,
    skill,
    question_count: questionCount,
    difficulty,
    questions,
    status: 'active' as const,
    created_at: Date.now()
  };
  const ref = await addDoc(collection(db, 'exit_tickets'), data);
  return { id: ref.id, ...data };
}

export async function submitExitTicketResult(
  ticketId: string,
  studentId: string,
  studentName: string,
  score: number,
  total: number,
  misconceptions: string[]
): Promise<void> {
  const accuracy = Math.round((score / total) * 100);
  await addDoc(collection(db, 'exit_ticket_results'), {
    ticket_id: ticketId,
    student_id: studentId,
    student_name: studentName,
    score,
    total,
    accuracy,
    misconceptions,
    submitted_at: Date.now()
  });
}

// ==========================================
// 6. STUDENT LEARNING JOURNEY TIMELINE
// ==========================================

export async function logJourneyEvent(
  studentId: string,
  eventType: StudentJourneyEvent['event_type'],
  topic: string,
  skill: string,
  title: string,
  description: string,
  oldAccuracy?: number,
  newAccuracy?: number
): Promise<void> {
  try {
    await addDoc(collection(db, 'student_journey_events'), {
      student_id: studentId,
      event_type: eventType,
      topic,
      skill,
      title,
      description,
      old_accuracy: oldAccuracy || 0,
      new_accuracy: newAccuracy || 0,
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn('logJourneyEvent failed:', err);
  }
}

export async function fetchStudentJourney(studentId: string): Promise<StudentJourneyEvent[]> {
  try {
    const q = query(
      collection(db, 'student_journey_events'),
      where('student_id', '==', studentId)
    );
    const snap = await getDocs(q);
    const list: StudentJourneyEvent[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as StudentJourneyEvent));
    return list.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('fetchStudentJourney failed:', err);
    return [];
  }
}

// ==========================================
// 7. ASSESSMENTS
// ==========================================

export async function createAssessment(
  teacherId: string,
  classId: string,
  title: string,
  topic: string,
  skills: string[],
  difficulty: string,
  questionCount: number,
  timeLimitMins: number,
  calculatorAllowed: boolean,
  questions: Assessment['questions']
): Promise<Assessment> {
  const data = {
    teacher_id: teacherId,
    class_id: classId,
    title,
    topic,
    skills,
    difficulty,
    question_count: questionCount,
    time_limit_mins: timeLimitMins,
    calculator_allowed: calculatorAllowed,
    questions,
    created_at: Date.now()
  };
  const ref = await addDoc(collection(db, 'assessments'), data);
  return { id: ref.id, ...data };
}
