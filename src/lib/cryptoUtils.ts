/**
 * Cryptographic security utilities for zero-plaintext password hashing
 * and client-side credential protection using Web Crypto API SHA-256.
 */

const SALT_PREFIX = "jesse_fc_sec_salt_v2026_";

/**
 * Computes a SHA-256 hash of the input string with a deterministic salt.
 */
export async function hashPasswordWithSalt(password: string): Promise<string> {
  if (!password) return "";
  const salted = `${SALT_PREFIX}:${password.trim()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256_${hashHex}`;
}

/**
 * Verifies if entered password matches the stored password (whether it's an upgraded sha256 hash or legacy string).
 */
export async function verifyPasswordMatch(enteredPass: string, storedPass?: string): Promise<boolean> {
  if (!storedPass || !enteredPass) return false;
  
  // If stored pass is already a salted SHA-256 hash
  if (storedPass.startsWith("sha256_")) {
    const computedHash = await hashPasswordWithSalt(enteredPass);
    return computedHash === storedPass;
  }
  
  // Legacy plaintext match
  return enteredPass.trim() === storedPass.trim();
}
