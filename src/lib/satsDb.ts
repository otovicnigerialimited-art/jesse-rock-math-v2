import { safeStorage } from './storage';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { SatsStudentProgress, MockTestResult, RevisionPlanDay, SatsDomain } from '../types/sats';
import { SATS_TOPICS } from '../data/satsData';

const SATS_STORAGE_KEY = 'jesse_sats_prep_progress';

export function generateDefaultRevisionPlan(weakDomains?: SatsDomain[]): RevisionPlanDay[] {
  return [
    {
      dayOfWeek: 'Monday',
      topicId: 'topic_equivalent_fractions',
      topicTitle: 'Fractions & Operations',
      domain: 'fractions',
      activityType: 'learn',
      durationMinutes: 15,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Tuesday',
      topicId: 'topic_place_value',
      topicTitle: 'Arithmetic & Place Value Speed Drill',
      domain: 'number',
      activityType: 'practice',
      durationMinutes: 15,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Wednesday',
      topicId: 'topic_geometry_angles',
      topicTitle: 'Angles & 2D/3D Shape Properties',
      domain: 'geometry',
      activityType: 'learn',
      durationMinutes: 15,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Thursday',
      topicId: 'topic_ratio_proportion',
      topicTitle: 'Ratio, Scaling & Missing Quantities',
      domain: 'ratio',
      activityType: 'practice',
      durationMinutes: 15,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Friday',
      topicId: 'topic_reasoning_multistep',
      topicTitle: 'Multi-Step Reasoning Heuristics',
      domain: 'reasoning',
      activityType: 'practice',
      durationMinutes: 20,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Saturday',
      topicId: 'mini_mock',
      topicTitle: 'Saturday Timed Mini Mock Exam',
      domain: 'number',
      activityType: 'mock',
      durationMinutes: 25,
      isCompleted: false,
      status: 'pending'
    },
    {
      dayOfWeek: 'Sunday',
      topicId: 'rest_review',
      topicTitle: 'Mindset Reflection & Light Revision',
      domain: 'reasoning',
      activityType: 'review',
      durationMinutes: 10,
      isCompleted: false,
      status: 'pending'
    }
  ];
}

export function getDefaultSatsProgress(userId: string = 'guest', studentName: string = 'Rockstar'): SatsStudentProgress {
  // Default target date is roughly 34 days in future
  const now = new Date();
  const targetDate = new Date(now.getTime() + 34 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    userId,
    studentName,
    targetExamDate: targetDate,
    currentConfidence: 5.0,
    readinessScore: 50,
    totalPracticeSolved: 0,
    totalCorrect: 0,
    totalMinutesStudied: 0,
    streakDays: 1,
    lastStudiedDate: new Date().toISOString().split('T')[0],
    domainMastery: {
      number: 50,
      fractions: 50,
      ratio: 50,
      algebra: 50,
      measurement: 50,
      geometry: 50,
      statistics: 50,
      reasoning: 50
    },
    topicMastery: {
      topic_place_value: 50,
      topic_equivalent_fractions: 50,
      topic_ratio_proportion: 50,
      topic_algebra_sequences: 50,
      topic_measurement_area: 50,
      topic_geometry_angles: 50,
      topic_statistics_graphs: 50,
      topic_reasoning_multistep: 50
    },
    weaknessTags: [],
    completedLessons: [],
    mockHistory: [],
    weeklyPlan: generateDefaultRevisionPlan(),
    milestones: [
      {
        id: 'm1',
        title: 'First Mock 🎓',
        desc: 'Completed your first diagnostic SATs mock paper',
        icon: 'GraduationCap'
      },
      {
        id: 'm2',
        title: 'Topic Crusher 💥',
        desc: 'Mastered 3 or more KS2 SATs curriculum topics',
        icon: 'Award'
      },
      {
        id: 'm3',
        title: 'Arithmetic Ace ⚡',
        desc: 'Achieve 85%+ accuracy in Paper 1 timed drills',
        icon: 'Zap'
      },
      {
        id: 'm4',
        title: 'Reasoning Rockstar 🧠',
        desc: 'Solve 10 multi-step problem solving challenges',
        icon: 'Brain'
      },
      {
        id: 'm5',
        title: 'SATs Ready 🚀',
        desc: 'Achieve an overall readiness score above 80%',
        icon: 'Rocket'
      }
    ],
    assignedRevisionPack: null
  };
}

export async function loadSatsProgress(userId: string = 'guest', studentName: string = 'Rockstar'): Promise<SatsStudentProgress> {
  const fallback = getDefaultSatsProgress(userId, studentName);
  
  // Try loading from local storage first for instant interactive responsiveness
  try {
    const rawLocal = safeStorage.getItem(`${SATS_STORAGE_KEY}_${userId}`);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && parsed.domainMastery) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Local SATs storage load failed:", err);
  }

  // If online & user authenticated, try Firestore
  if (userId && userId !== 'guest') {
    try {
      const docRef = doc(db, 'sats_progress', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data() as SatsStudentProgress;
        safeStorage.setItem(`${SATS_STORAGE_KEY}_${userId}`, JSON.stringify(cloudData));
        return cloudData;
      }
    } catch (err) {
      console.warn("Firestore SATs progress load error:", err);
    }
  }

  return fallback;
}

export async function saveSatsProgress(progress: SatsStudentProgress): Promise<void> {
  if (!progress || !progress.userId) return;

  // 1. Recalculate transparent readiness score based on components
  const avgMastery = Object.values(progress.domainMastery).reduce((a, b) => a + b, 0) / 8;
  const recentMockPct = progress.mockHistory.length > 0 
    ? progress.mockHistory[progress.mockHistory.length - 1].percentage 
    : 65;
  const practiceAcc = progress.totalPracticeSolved > 0 
    ? (progress.totalCorrect / progress.totalPracticeSolved) * 100 
    : 70;
  
  const computedReadiness = Math.min(99, Math.round(
    avgMastery * 0.4 + recentMockPct * 0.4 + practiceAcc * 0.2
  ));
  progress.readinessScore = computedReadiness;

  // 2. Save locally
  try {
    safeStorage.setItem(`${SATS_STORAGE_KEY}_${progress.userId}`, JSON.stringify(progress));
  } catch (err) {
    console.warn("Local SATs save warning:", err);
  }

  // 3. Save to Firestore if registered
  if (progress.userId !== 'guest') {
    try {
      const docRef = doc(db, 'sats_progress', progress.userId);
      await setDoc(docRef, progress, { merge: true });
    } catch (err) {
      console.warn("Firestore SATs progress save warning:", err);
    }
  }
}

export async function assignRevisionPackToStudent(
  teacherId: string,
  teacherName: string,
  studentId: string,
  topicId: string,
  note: string = "Focus on this topic before our next class review."
): Promise<void> {
  const topic = SATS_TOPICS.find(t => t.id === topicId) || SATS_TOPICS[0];

  const packData = {
    teacherId,
    teacherName,
    topicId,
    topicTitle: topic.title,
    assignedAt: Date.now(),
    note,
    isCompleted: false
  };

  // Update in sats_progress
  try {
    const docRef = doc(db, 'sats_progress', studentId);
    await setDoc(docRef, { assignedRevisionPack: packData }, { merge: true });
  } catch (err) {
    console.warn("Failed to assign pack in sats_progress:", err);
  }

  // Also update in school_students collection
  try {
    const studentDocRef = doc(db, 'school_students', studentId);
    await updateDoc(studentDocRef, {
      assigned_sats_pack: packData
    });
  } catch (err) {
    console.warn("Failed to update school_student doc with sats pack:", err);
  }
}
