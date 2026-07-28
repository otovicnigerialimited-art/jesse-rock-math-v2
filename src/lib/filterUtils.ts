export const BAD_WORDS = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "cock",
  "bastard", "slut", "whore", "faggot", "nigger", "nigga", "retard",
  "crap", "piss", "damn", "douche", "dyke", "kike", "spic", "chink",
  "twat", "wank", "wanker", "prick", "boob", "tits", "vagina", "penis",
  "sex", "porn", "xxx", "rape", "murder", "kill", "suicide", "nazi",
  "hitler", "racist", "gay", "lesbian", "trans", "queer"
];

export function isAppropriate(text: string): boolean {
  if (!text) return true;
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const word of BAD_WORDS) {
    if (normalized.includes(word)) {
      return false;
    }
  }
  return true;
}
