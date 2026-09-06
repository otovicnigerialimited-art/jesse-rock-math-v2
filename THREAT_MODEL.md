# JESSE MATH FC — THREAT MODEL (STRIDE METHODOLOGY)

## 1. Threat Identification & STRIDE Matrix

| Threat Category | Potential Attack Vector | Mitigation in Jesse Math FC | Residual Risk |
| :--- | :--- | :--- | :--- |
| **Spoofing (Identity)** | Forging session cookies or spoofing user/teacher identity. | Cryptographically signed HMAC-SHA256 tokens with timing-safe validation and Firebase Auth token verification. | Low |
| **Tampering (Data)** | Injecting arbitrary high scores, modifying other students' homework, or tampering with audit logs. | Server-authoritative score processing (`/api/arena/update-score`), immutable Firestore rules, append-only logs. | Low |
| **Repudiation** | Denying completed game matches or administrative edits. | Append-only security audit log trail (`/security_audit_logs`). | Low |
| **Information Disclosure** | Exposing student emails or parental data in public leaderboards or error traces. | Anonymized error logging, COPPA PII scrubber, Firestore deny-by-default rules. | Minimal |
| **Denial of Service** | Flooding AI hint generation endpoint or brute-forcing accounts. | Express rate limiting (25 req/min on AI, 300 req/15min globally), payload size caps (250kb). | Low |
| **Elevation of Privilege** | Student promoting account to `teacher` or `admin` in update payload. | Firestore rule checks preventing role modification without admin claims; server token verification. | Minimal |

---

## 2. Asset Classification

1. **Class A (Confidential / Private):** Student full names, parent links, passwords/hashes, teacher email rosters, AI API secrets.
2. **Class B (Restricted / Semi-Public):** Classroom IDs, homework questions, SATs learning curriculum.
3. **Class C (Public):** Anonymized leaderboard scores, safe game usernames, cosmetic shop items.
