const SAFE_ADJECTIVES = [
  'Sonic', 'Neon', 'Electric', 'Golden', 'Silver', 'Cosmic', 'Hyper', 'Swift',
  'Acoustic', 'Turbo', 'Stellar', 'Mega', 'Striker', 'Thunder', 'Solar'
];

const SAFE_NOUNS = [
  'Rocker', 'Beat', 'Guitar', 'Soloist', 'Amplifier', 'Drummer', 'Phoenix',
  'Falcon', 'Vortex', 'Melody', 'Legend', 'Star', 'Solver', 'Calculus', 'Champion'
];

export function generateSafeStrikerUsername(): string {
  const adj = SAFE_ADJECTIVES[Math.floor(Math.random() * SAFE_ADJECTIVES.length)];
  const noun = SAFE_NOUNS[Math.floor(Math.random() * SAFE_NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}

// Strictly sanitized quick chat options for multiplayer child safety
export const SAFE_QUICK_CHATS = [
  'Great game! ⚽',
  'Nice calculation speed! ⚡',
  'Good luck, striker! 🏆',
  'Awesome streak! 🔥',
  'Replay match? 🔄',
  'Well played! 👏',
  'Almost had it! 🎯',
  'Let\'s rock! 🎤'
];

export function sanitizeTextForPII(text: string): { isSafe: boolean; cleaned: string } {
  let cleaned = text;

  // Mask email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(cleaned)) {
    return { isSafe: false, cleaned: '[Private Email Removed]' };
  }

  // Mask phone numbers (7+ digits)
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{10,11}\b/g;
  if (phoneRegex.test(cleaned)) {
    return { isSafe: false, cleaned: '[Phone Number Removed]' };
  }

  return { isSafe: true, cleaned };
}
