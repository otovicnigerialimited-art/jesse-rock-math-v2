import { UserStats } from '../types';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  category: string;
  checkUnlocked: (stats: UserStats) => boolean;
}

export const CORE_BADGES: Badge[] = [
  {
    id: "first_steps",
    title: "The Spark ⚡️",
    description: "Launch your journey by finishing your first Arena session!",
    emoji: "⚡️",
    color: "from-yellow-400 to-orange-500",
    category: "Milestone",
    checkUnlocked: (stats) => stats.history.length > 0
  },
  {
    id: "accuracy_king",
    title: "Perfect Target 🎯",
    description: "Submit a matching session with flawless accuracy!",
    emoji: "🎯",
    color: "from-red-400 to-pink-500",
    category: "Precision",
    checkUnlocked: (stats) => stats.history.some(h => h.score === h.total && h.total >= 3)
  },
  {
    id: "streak_racer",
    title: "Brain Streak Champion 🔥",
    description: "Power up your thinking and get a 5-question streak!",
    emoji: "🔥",
    color: "from-orange-500 to-red-600",
    category: "Streak",
    checkUnlocked: (stats) => stats.bestStreak >= 5
  },
  {
    id: "level_three_elite",
    title: "Ascended Scholar 👑",
    description: "Grow your brain muscles by accumulating 2,000 XP!",
    emoji: "👑",
    color: "from-purple-400 to-violet-600",
    category: "Level",
    checkUnlocked: (stats) => stats.xp >= 2000
  },
  {
    id: "legendary_xp",
    title: "Math Striker ⚽",
    description: "Climb the charts and accumulate 1,000 total XP!",
    emoji: "⚽",
    color: "from-blue-400 to-violet-500",
    category: "XP",
    checkUnlocked: (stats) => stats.xp >= 1000
  },
  {
    id: "fearless_solver",
    title: "Fearless Explorer 🧭",
    description: "Enter the advanced modes (hard/extreme) & test your limits!",
    emoji: "🧭",
    color: "from-emerald-400 to-teal-600",
    category: "Courage",
    checkUnlocked: (stats) => stats.history.some(h => h.difficulty === 'hard' || h.difficulty === 'extreme')
  },
  ...Array.from({ length: 194 }).map((_, i) => ({
    id: i === 193 ? "grand_master" : `scholar_${i + 1}`,
    title: i === 193 ? "Legendary Striker 🏆" : `Scholar Level ${i + 1}`,
    description: i === 193 ? "Achieved the elite Legendary rank by solving 200 problems!" : `Solve ${i + 7} problems correctly!`,
    emoji: i === 193 ? "🏆" : "🌟",
    color: i === 193 ? "from-yellow-400 to-amber-600" : "from-blue-400 to-indigo-500",
    category: "Milestone",
    checkUnlocked: (stats: UserStats) => stats.totalSolved >= (i + 7)
  }))
];

export function calculateLevel(stats: UserStats): number {
  const baseLevel = Math.floor(stats.xp / 1000) + 1;
  const coreUnlocked = CORE_BADGES.filter(b => b.checkUnlocked(stats)).length;
  const weeklyUnlocked = stats.unlockedBadges?.length || 0;
  return baseLevel + coreUnlocked + weeklyUnlocked;
}
