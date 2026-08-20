import { UserStats, Difficulty, Problem } from '../types';

export interface DiagnosticResult {
  completedAt: number;
  overallLevel: number; // 1-10 scale
  tierName: string;
  score: number;
  total: number;
  accuracyPct: number;
  domainScores: {
    Arithmetic: number;
    Fractions: number;
    Decimals: number;
    Algebra: number;
    Geometry: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export interface MisconceptionRecord {
  tag: string;
  skillName: string;
  category: string;
  failCount: number;
  lastFailedAt: number;
  misconceptionDescription: string;
  explanationTip: string;
}

export interface PersonalBests {
  highestQuizScore: number;
  highestAccuracyPct: number;
  fastestAnswerTimeSec: number; // e.g. 1.8s
  longestStreak: number;
  mostXpSingleSession: number;
  lastUpdated: number;
}

export interface SpacedItem {
  skillId: string;
  skillName: string;
  category: string;
  box: number; // 1 to 5 (Leitner box)
  lastReviewedAt: number;
  nextReviewDueAt: number;
  consecutiveCorrect: number;
}

export interface SmartQuestion extends Problem {
  options: string[];
  explanation: string;
  misconception: string;
  topic: string;
  skill: string;
  difficulty: Difficulty;
  level: number;
}

export interface ExtendedUserStats extends UserStats {
  diagnosticResult?: DiagnosticResult;
  personalBests?: PersonalBests;
  misconceptions?: Record<string, MisconceptionRecord>;
  spacedItems?: Record<string, SpacedItem>;
  tierLevel?: number; // 1 to 7
  notificationsEnabled?: boolean;
  safeUsername?: string;
}
