export type SatsNavTab = 
  | 'dashboard' 
  | 'learn' 
  | 'practice' 
  | 'plan' 
  | 'mocks' 
  | 'progress' 
  | 'guide' 
  | 'mindset' 
  | 'dsat_tutor'
  | 'settings';

export type SatsDomain = 
  | 'number' 
  | 'fractions' 
  | 'ratio' 
  | 'algebra' 
  | 'measurement' 
  | 'geometry' 
  | 'statistics' 
  | 'reasoning';

export interface SatsTopicInfo {
  id: string;
  domain: SatsDomain;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badgeColor: string;
  estimatedMinutes: number;
  subtopics: string[];
  learnModule: {
    concept: {
      heading: string;
      explanation: string[];
      keyRules: string[];
      visualAid?: string;
    };
    example: {
      question: string;
      steps: string[];
      finalAnswer: string;
      tip: string;
    };
    tryTogether: {
      question: string;
      hint: string;
      solutionExplanation: string;
      correctAnswer: string;
      options?: string[];
    };
    tryYourself: Array<{
      id: string;
      question: string;
      options?: string[];
      correctAnswer: string;
      explanation: string;
      marks: number;
    }>;
    satsChallenge: {
      question: string;
      context?: string;
      marks: number;
      options?: string[];
      correctAnswer: string;
      workedSolution: string;
      examinerTip: string;
    };
  };
}

export interface SatsQuestion {
  id: string;
  domain: SatsDomain;
  topicId: string;
  paperType: 'arithmetic' | 'reasoning';
  question: string;
  diagramSvg?: string;
  context?: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mistakeTag?: string;
}

export interface MockTestResult {
  id: string;
  date: string;
  timestamp: number;
  paperType: 'arithmetic' | 'reasoning' | 'mixed';
  paperName: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  strongDomains: SatsDomain[];
  weakDomains: SatsDomain[];
  weaknessTags: string[];
  recommendedFocusTopicId: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    domain: SatsDomain;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    maxMarks: number;
  }>;
}

export interface RevisionPlanDay {
  dayOfWeek: string;
  topicId: string;
  topicTitle: string;
  domain: SatsDomain;
  activityType: 'learn' | 'practice' | 'mock' | 'review';
  durationMinutes: number;
  isCompleted: boolean;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: number;
}

export interface SatsStudentProgress {
  userId: string;
  studentName: string;
  targetExamDate: string; // YYYY-MM-DD
  currentConfidence: number; // 1 to 10
  readinessScore: number; // 0 to 100
  totalPracticeSolved: number;
  totalCorrect: number;
  totalMinutesStudied: number;
  streakDays: number;
  lastStudiedDate: string;
  
  domainMastery: Record<SatsDomain, number>; // 0 to 100
  topicMastery: Record<string, number>; // topicId -> percentage
  weaknessTags: Array<{
    tag: string;
    mistakeCount: number;
    lastDetected: number;
    associatedTopicId: string;
  }>;
  
  completedLessons: string[]; // topicIds
  mockHistory: MockTestResult[];
  weeklyPlan: RevisionPlanDay[];
  milestones: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    unlockedAt?: number;
  }>;
  assignedRevisionPack?: {
    teacherId: string;
    teacherName: string;
    topicId: string;
    topicTitle: string;
    assignedAt: number;
    note: string;
    isCompleted: boolean;
  } | null;
}
