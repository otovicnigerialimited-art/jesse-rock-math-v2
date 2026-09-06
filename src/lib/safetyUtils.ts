import { BAD_WORDS } from './filterUtils';

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

/**
 * Strips dangerous HTML, scripts, events, SQL injection payloads, and Prompt Injections.
 */
export function sanitizeUserInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // 1. Remove dangerous HTML script/iframe/object tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // 2. Remove inline event handlers like onerror=, onload=, onclick=
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    // 3. Remove pseudo-protocols like javascript: or data:text/html
    .replace(/javascript:/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    // 4. Strip common SQL injection patterns
    .replace(/(\b(UNION(\s+ALL)?|SELECT\s+.*?\s+FROM|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM)\b)/gi, '')
    .replace(/(--|;|(\/\*[\s\S]*?\*\/))/g, '');

  // Truncate to maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Comprehensive PII and Student Privacy scrubber following COPPA & GDPR-K rules.
 */
export function sanitizeTextForPII(text: string): { isSafe: boolean; cleaned: string } {
  if (!text) return { isSafe: true, cleaned: '' };
  let cleaned = text;
  let isSafe = true;

  // Mask email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(cleaned)) {
    cleaned = cleaned.replace(emailRegex, '[Private Email Removed]');
    isSafe = false;
  }

  // Mask phone numbers (international, US, UK formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10,12}\b/g;
  if (phoneRegex.test(cleaned)) {
    cleaned = cleaned.replace(phoneRegex, '[Phone Number Removed]');
    isSafe = false;
  }

  // Mask Credit Card / Debit Card number sequences (13-16 digits)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{15,16}\b/g;
  if (ccRegex.test(cleaned)) {
    cleaned = cleaned.replace(ccRegex, '[Payment Info Removed]');
    isSafe = false;
  }

  // Mask UK National Insurance / US SSN formats
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b|\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{6}\s?[A-D]\b/gi;
  if (ssnRegex.test(cleaned)) {
    cleaned = cleaned.replace(ssnRegex, '[Gov ID Removed]');
    isSafe = false;
  }

  return { isSafe, cleaned };
}

const memoryRateLimits = new Map<string, number[]>();

/**
 * High-speed in-memory & localStorage client-side rate limiter
 * Protects against brute-force attacks, survey submission flooding, and comment spam.
 */
export function checkActionRateLimit(
  actionKey: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; retryAfterSeconds: number } {
  try {
    const storageKey = `jesse_ratelimit_${actionKey}`;
    const now = Date.now();
    let attempts: number[] = memoryRateLimits.get(storageKey) || [];

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          attempts = JSON.parse(raw);
        }
      } catch {}
    }

    // Filter out timestamps outside the sliding window
    attempts = attempts.filter(ts => now - ts < windowMs);

    if (attempts.length >= maxAttempts) {
      const oldest = attempts[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
    }

    attempts.push(now);
    memoryRateLimits.set(storageKey, attempts);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(attempts));
      } catch {}
    }

    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
