import { safeStorage } from './storage';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

export const SURVEY_STORAGE_KEY = 'jesse_rock_survey_completed_v1';
export const SURVEY_RESPONSES_STORAGE_KEY = 'jesse_rock_survey_dynamic_responses_v1';

export interface SurveyAnswer {
  id?: string;
  // Question 1: Bugs & Errors Encountered
  bugsEncountered: 'none' | 'touch_delay' | 'audio_overlap' | 'avatar_reset' | 'accidental_purchase' | 'multiplayer_sync';
  // Question 2: Device Performance & Smoothness
  performanceRating: 'lightning_fast' | 'good_playable' | 'minor_lag' | 'slow_loading';
  // Question 3: Top Missing Feature Needed
  topMissingFeature: 'zen_mode' | 'bulk_csv' | 'advanced_curriculum' | 'printable_pdf' | 'more_modes';
  // Question 4: Shop & Reward Economy UX
  shopFeedback: 'love_rewards' | 'needs_confirm_popup' | 'coins_too_hard' | 'more_outfits';
  // Question 5: Top Priority Improvement Area
  developerPriority: 'tablet_touch_fix' | 'teacher_csv_tools' | 'grades_5_8_math' | 'untimed_mode' | 'offline_polish';
  timestamp: string;
}

export interface AggregatedSurveyAnalytics {
  totalResponses: number;
  zeroBugsPercentage: number;
  bugDistribution: {
    key: string;
    label: string;
    count: number;
    percentage: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  performanceDistribution: {
    key: string;
    label: string;
    count: number;
    percentage: number;
    badgeColor: string;
  }[];
  missingFeaturesRanking: {
    key: string;
    label: string;
    votes: number;
    percentage: number;
    devStatus: 'In Development' | 'Planned' | 'Under Investigation';
  }[];
  shopSentiment: {
    key: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  developerPriorityRank: {
    key: string;
    label: string;
    votes: number;
    percentage: number;
    plannedSprint: string;
  }[];
  // Research Methodology & Metadata
  datasetMetadata: {
    sampleSize: number;
    anonymizedStatus: string;
    statisticalConfidence: string;
    marginOfError: string;
    primaryDataCollection: string;
    lastUpdated: string;
  };
}

export function hasCompletedSurvey(): boolean {
  try {
    return safeStorage.getItem(SURVEY_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markSurveyCompleted(): void {
  try {
    safeStorage.setItem(SURVEY_STORAGE_KEY, 'true');
  } catch (err) {
    console.warn('Failed to save survey completion flag', err);
  }
}

export function resetSurveyPopup(): void {
  try {
    safeStorage.removeItem(SURVEY_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to reset survey popup', err);
  }
}

export function getLocalStoredSubmissions(): SurveyAnswer[] {
  try {
    const raw = safeStorage.getItem(SURVEY_RESPONSES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Saves a survey submission to both Firestore ('survey_responses' collection) and local cache.
 * Strictly NO usernames or PII are collected.
 */
export async function saveSurveySubmission(answer: Omit<SurveyAnswer, 'timestamp'>): Promise<void> {
  const newEntry: SurveyAnswer = {
    ...answer,
    timestamp: new Date().toISOString()
  };

  // 1. Persist locally first for immediate responsiveness
  try {
    const local = getLocalStoredSubmissions();
    local.push(newEntry);
    safeStorage.setItem(SURVEY_RESPONSES_STORAGE_KEY, JSON.stringify(local));
    markSurveyCompleted();
  } catch (err) {
    console.warn('Failed to save local survey fallback', err);
  }

  // 2. Persist directly to Firestore real-time collection
  try {
    if (db) {
      await addDoc(collection(db, 'survey_responses'), {
        bugsEncountered: answer.bugsEncountered,
        performanceRating: answer.performanceRating,
        topMissingFeature: answer.topMissingFeature,
        shopFeedback: answer.shopFeedback,
        developerPriority: answer.developerPriority,
        createdAt: new Date().toISOString(),
        serverTime: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firestore survey write error (fallback active):', err);
  }
}

/**
 * Subscribes to real-time survey updates from Firestore
 */
export function subscribeToRealSurveyResponses(
  onUpdate: (responses: SurveyAnswer[]) => void
): () => void {
  try {
    if (!db) {
      onUpdate(getLocalStoredSubmissions());
      return () => {};
    }

    const q = query(collection(db, 'survey_responses'), limit(500));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const firestoreResponses: SurveyAnswer[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.bugsEncountered && data.performanceRating) {
            firestoreResponses.push({
              id: doc.id,
              bugsEncountered: data.bugsEncountered,
              performanceRating: data.performanceRating,
              topMissingFeature: data.topMissingFeature,
              shopFeedback: data.shopFeedback,
              developerPriority: data.developerPriority,
              timestamp: data.createdAt || new Date().toISOString()
            });
          }
        });

        // Merge with local submissions to guarantee zero dropped responses
        const local = getLocalStoredSubmissions();
        const mergedMap = new Map<string, SurveyAnswer>();
        
        firestoreResponses.forEach((r) => mergedMap.set(r.id || r.timestamp, r));
        local.forEach((l) => mergedMap.set(l.timestamp, l));

        const allResponses = Array.from(mergedMap.values());
        onUpdate(allResponses);
      },
      (error) => {
        console.warn('Survey snapshot error, using local dataset:', error);
        onUpdate(getLocalStoredSubmissions());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore survey listener:', err);
    onUpdate(getLocalStoredSubmissions());
    return () => {};
  }
}

/**
 * Pure statistical compute function calculating exact ratios, percentages, and distribution frequencies
 * from 100% genuine user responses.
 */
export function computeSurveyAnalyticsFromResponses(responses: SurveyAnswer[]): AggregatedSurveyAnalytics {
  const total = responses.length;

  const bugsCount: Record<string, number> = {
    none: 0,
    touch_delay: 0,
    accidental_purchase: 0,
    audio_overlap: 0,
    avatar_reset: 0,
    multiplayer_sync: 0
  };

  const perfCount: Record<string, number> = {
    lightning_fast: 0,
    good_playable: 0,
    minor_lag: 0,
    slow_loading: 0
  };

  const featCount: Record<string, number> = {
    zen_mode: 0,
    bulk_csv: 0,
    advanced_curriculum: 0,
    printable_pdf: 0,
    more_modes: 0
  };

  const shopCount: Record<string, number> = {
    love_rewards: 0,
    needs_confirm_popup: 0,
    more_outfits: 0,
    coins_too_hard: 0
  };

  const prioCount: Record<string, number> = {
    tablet_touch_fix: 0,
    untimed_mode: 0,
    teacher_csv_tools: 0,
    grades_5_8_math: 0,
    offline_polish: 0
  };

  // Aggregate genuine response tallies
  responses.forEach((ans) => {
    if (bugsCount[ans.bugsEncountered] !== undefined) bugsCount[ans.bugsEncountered]++;
    if (perfCount[ans.performanceRating] !== undefined) perfCount[ans.performanceRating]++;
    if (featCount[ans.topMissingFeature] !== undefined) featCount[ans.topMissingFeature]++;
    if (shopCount[ans.shopFeedback] !== undefined) shopCount[ans.shopFeedback]++;
    if (prioCount[ans.developerPriority] !== undefined) prioCount[ans.developerPriority]++;
  });

  const zeroBugsCount = bugsCount.none;
  const zeroBugsPercentage = total > 0 ? Number(((zeroBugsCount / total) * 100).toFixed(1)) : 100;

  const calculatePct = (count: number) => {
    if (total === 0) return 0;
    return Number(((count / total) * 100).toFixed(1));
  };

  return {
    totalResponses: total,
    zeroBugsPercentage,
    bugDistribution: [
      { key: 'none', label: 'Zero Bugs (100% Smooth Play)', count: bugsCount.none, percentage: calculatePct(bugsCount.none), severity: 'low' },
      { key: 'touch_delay', label: 'Tablet / iPad Keypad Touch Latency', count: bugsCount.touch_delay, percentage: calculatePct(bugsCount.touch_delay), severity: 'high' },
      { key: 'accidental_purchase', label: 'Accidental Shop Purchase (Need Confirm Dialog)', count: bugsCount.accidental_purchase, percentage: calculatePct(bugsCount.accidental_purchase), severity: 'high' },
      { key: 'audio_overlap', label: 'Guitar Riff Audio Overlapping Timer', count: bugsCount.audio_overlap, percentage: calculatePct(bugsCount.audio_overlap), severity: 'medium' },
      { key: 'avatar_reset', label: 'Avatar Color Reset After Page Refresh', count: bugsCount.avatar_reset, percentage: calculatePct(bugsCount.avatar_reset), severity: 'medium' },
      { key: 'multiplayer_sync', label: '1v1 Match Sync / Connection Hiccup', count: bugsCount.multiplayer_sync, percentage: calculatePct(bugsCount.multiplayer_sync), severity: 'medium' }
    ],
    performanceDistribution: [
      { key: 'lightning_fast', label: '⚡ Lightning Fast (60 FPS, Zero-Lag)', count: perfCount.lightning_fast, percentage: calculatePct(perfCount.lightning_fast), badgeColor: 'bg-emerald-500' },
      { key: 'good_playable', label: '👍 Good & Responsive (Normal Play)', count: perfCount.good_playable, percentage: calculatePct(perfCount.good_playable), badgeColor: 'bg-blue-500' },
      { key: 'minor_lag', label: '⏳ Noticeable Input Delay on Numbers', count: perfCount.minor_lag, percentage: calculatePct(perfCount.minor_lag), badgeColor: 'bg-amber-500' },
      { key: 'slow_loading', label: '🐌 Heavy Resource / Slow Asset Load', count: perfCount.slow_loading, percentage: calculatePct(perfCount.slow_loading), badgeColor: 'bg-rose-500' }
    ],
    missingFeaturesRanking: [
      { key: 'zen_mode', label: 'Untimed Zen Mode / Custom 120s-180s Timers', votes: featCount.zen_mode, percentage: calculatePct(featCount.zen_mode), devStatus: 'In Development' as const },
      { key: 'bulk_csv', label: 'Bulk CSV Student Roster Upload for Teachers', votes: featCount.bulk_csv, percentage: calculatePct(featCount.bulk_csv), devStatus: 'Planned' as const },
      { key: 'advanced_curriculum', label: 'Fractions, Decimals, Algebra & Negative Numbers', votes: featCount.advanced_curriculum, percentage: calculatePct(featCount.advanced_curriculum), devStatus: 'In Development' as const },
      { key: 'printable_pdf', label: 'Printable 1-Page PDF Diagnostic Reports', votes: featCount.printable_pdf, percentage: calculatePct(featCount.printable_pdf), devStatus: 'Planned' as const },
      { key: 'more_modes', label: 'More Arcade Mini-Games & Boss Duels', votes: featCount.more_modes, percentage: calculatePct(featCount.more_modes), devStatus: 'Under Investigation' as const }
    ].sort((a, b) => b.votes - a.votes),
    shopSentiment: [
      { key: 'love_rewards', label: 'Love the Club Shop & Instrument Unlocks', count: shopCount.love_rewards, percentage: calculatePct(shopCount.love_rewards) },
      { key: 'needs_confirm_popup', label: 'Require "Are You Sure?" Confirm Dialog', count: shopCount.needs_confirm_popup, percentage: calculatePct(shopCount.needs_confirm_popup) },
      { key: 'more_outfits', label: 'Request More Rocker football kits', count: shopCount.more_outfits, percentage: calculatePct(shopCount.more_outfits) },
      { key: 'coins_too_hard', label: 'Increase Match Coin Payout Rates', count: shopCount.coins_too_hard, percentage: calculatePct(shopCount.coins_too_hard) }
    ],
    developerPriorityRank: [
      { key: 'tablet_touch_fix', label: 'Optimize Tablet & Touch Screen Number Pad Latency', votes: prioCount.tablet_touch_fix, percentage: calculatePct(prioCount.tablet_touch_fix), plannedSprint: 'Sprint 2026.3 (Active)' },
      { key: 'untimed_mode', label: 'Implement Untimed Zen Mode & Anxiety-Free Rounds', votes: prioCount.untimed_mode, percentage: calculatePct(prioCount.untimed_mode), plannedSprint: 'Sprint 2026.3 (Active)' },
      { key: 'teacher_csv_tools', label: 'Teacher CSV Roster Batch Import & Class Assignment', votes: prioCount.teacher_csv_tools, percentage: calculatePct(prioCount.teacher_csv_tools), plannedSprint: 'Sprint 2026.4' },
      { key: 'grades_5_8_math', label: 'Expand to Upper Primary & KS3 Arithmetic Modules', votes: prioCount.grades_5_8_math, percentage: calculatePct(prioCount.grades_5_8_math), plannedSprint: 'Sprint 2026.4' },
      { key: 'offline_polish', label: 'Offline Mode Asset Pre-caching & Sound Balancing', votes: prioCount.offline_polish, percentage: calculatePct(prioCount.offline_polish), plannedSprint: 'Sprint 2026.5' }
    ].sort((a, b) => b.votes - a.votes),
    datasetMetadata: {
      sampleSize: total,
      anonymizedStatus: '100% Anonymized (Zero PII or Usernames stored)',
      statisticalConfidence: total >= 30 ? '95% Confidence Level' : 'Provisional Statistical Sample',
      marginOfError: total > 0 ? `±${(1 / Math.sqrt(total) * 100).toFixed(1)}%` : 'N/A',
      primaryDataCollection: 'Live In-App Survey Prompt & Modal',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  };
}

export function computeSurveyAnalytics(): AggregatedSurveyAnalytics {
  return computeSurveyAnalyticsFromResponses(getLocalStoredSubmissions());
}
