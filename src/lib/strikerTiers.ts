export interface StrikerTier {
  tierNumber: number;
  id: string;
  name: string;
  title: string;
  badgeEmoji: string;
  minLevel: number;
  minXp: number;
  maxXp: number;
  description: string;
  unlockedPerks: string[];
  themeColor: string;
  borderColor: string;
}

export const STRIKER_TIERS: StrikerTier[] = [
  {
    tierNumber: 1,
    id: 'rookie',
    name: 'Rookie',
    title: 'Acoustic Starter',
    badgeEmoji: '⚽',
    minLevel: 1,
    minXp: 0,
    maxXp: 250,
    description: 'Plucking your first strings in the world of math calculation speed.',
    unlockedPerks: ['Basic Math Arenas', 'Rookie Avatar Gear'],
    themeColor: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-400'
  },
  {
    tierNumber: 2,
    id: 'garage',
    name: 'Garage Striker',
    title: 'Amplifier Jammer',
    badgeEmoji: '🚗',
    minLevel: 3,
    minXp: 251,
    maxXp: 600,
    description: 'Turning up the volume with double-digit mental calculation prowess.',
    unlockedPerks: ['Multiplayer Arena Access', 'Garage Amp Sound Effects'],
    themeColor: 'from-blue-500 to-cyan-600',
    borderColor: 'border-cyan-400'
  },
  {
    tierNumber: 3,
    id: 'rising',
    name: 'Rising Star',
    title: 'Stage First Team',
    badgeEmoji: '🌟',
    minLevel: 5,
    minXp: 601,
    maxXp: 1200,
    description: 'Captivating audiences with swift fractions, decimals, and fast mental multiplication.',
    unlockedPerks: ['Fun Arcade Mini-Games', 'Golden Guitar Avatar Item'],
    themeColor: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-400'
  },
  {
    tierNumber: 4,
    id: 'performer',
    name: 'Math Performer',
    title: 'Stadium Soloist',
    badgeEmoji: '🎤',
    minLevel: 7,
    minXp: 1201,
    maxXp: 2000,
    description: 'Performing high-speed calculation solos under bright stadium spotlighting.',
    unlockedPerks: ['Spaced Practice Mastery Tracker', 'Neon Stage Theme'],
    themeColor: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400'
  },
  {
    tierNumber: 5,
    id: 'superstar',
    name: 'Superstar',
    title: 'Chart Topping Icon',
    badgeEmoji: '🔥',
    minLevel: 9,
    minXp: 2001,
    maxXp: 3500,
    description: 'Dominating global math leaderboards with flawless accuracy and blazing speed.',
    unlockedPerks: ['KS2 SATs Exam Simulator', 'Flame Crown Profile Frame'],
    themeColor: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400'
  },
  {
    tierNumber: 6,
    id: 'legend',
    name: 'Legend',
    title: 'Hall of Fame Virtuoso',
    badgeEmoji: '⚡',
    minLevel: 11,
    minXp: 3501,
    maxXp: 5000,
    description: 'An immortal master of problem solving, ratio logic, and algebraic speed.',
    unlockedPerks: ['Legendary Gold Nameplate', 'Custom Soundboard Effects'],
    themeColor: 'from-amber-400 to-orange-600',
    borderColor: 'border-amber-300'
  },
  {
    tierNumber: 7,
    id: 'ultimate',
    name: 'Ultimate Striker',
    title: 'Grand Math Sovereign',
    badgeEmoji: '👑',
    minLevel: 13,
    minXp: 5001,
    maxXp: 999999,
    description: 'The supreme pinnacle of mathematical speed, intelligence, and execution.',
    unlockedPerks: ['Universal Custom Badges', 'Developer VIP Hall Entry'],
    themeColor: 'from-yellow-400 via-amber-500 to-orange-500',
    borderColor: 'border-amber-400'
  }
];

export function getCurrentStrikerTier(xp: number, level: number): StrikerTier {
  for (let i = STRIKER_TIERS.length - 1; i >= 0; i--) {
    const tier = STRIKER_TIERS[i];
    if (xp >= tier.minXp || level >= tier.minLevel) {
      return tier;
    }
  }
  return STRIKER_TIERS[0];
}

export function getNextStrikerTier(currentTierNumber: number): StrikerTier | null {
  return STRIKER_TIERS.find(t => t.tierNumber === currentTierNumber + 1) || null;
}
