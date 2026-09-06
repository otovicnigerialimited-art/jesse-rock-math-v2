# JESSE MATH FC — SECURITY ARCHITECTURE SPECIFICATION

## 1. Zero-Trust Security Model Overview

Jesse Math FC employs a **Zero-Trust Defense-in-Depth** architecture across both client applications and backend microservices:

1. **Authentication Layer:**
   - Multi-tier support for Firebase Auth ID Tokens and Cryptographically Signed HMAC-SHA256 Session Tokens.
   - Credentials salted and hashed via client-side Web Crypto API SHA-256 before transport.
   - Tokens verified server-side with constant-time equality comparisons (`crypto.timingSafeEqual`).

2. **Authorization & RBAC Matrix:**
   - **Super Admin:** Unrestricted administrative management, audit log inspection, and global system configuration.
   - **Teacher:** Scoped to managing classes, student rosters, homework assignments, and exit ticket assessments for their registered school.
   - **Parent:** Strictly limited to viewing linked student progress, weekly report summaries, and SATs preparation metrics.
   - **Student / Individual:** Sandboxed to gameplay arenas, personal progression data, and assigned homework.
   - **Guest:** Transient, localized storage session with zero write privileges to protected school databases.

3. **Database Authorization (Firestore Security Rules):**
   - **Deny-by-Default:** Every query not explicitly matched and permitted is denied.
   - **Field Immutability:** Core tracking fields (`uid`, `createdAt`, `teacher_id`) cannot be altered during client updates.
   - **Bounded Range Verification:** High scores, XP, coins, and ratings are clamped to realistic mathematical ranges.
   - **Audit Trail Immutability:** `/security_audit_logs` permits append-only writes (`update, delete: if false`).

4. **API & Edge Protection:**
   - Express server behind reverse proxy with strict body size limits (250kb).
   - Multi-tier rate limiters: Global (300 req / 15m), AI/Gemini (25 req / 1m), Score Updates (60 req / 1m).
   - Helmet security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - Origin verification for cross-site calls.

5. **Child Safety & COPPA Compliance:**
   - Automatic PII redactor removes email addresses, phone numbers, and payment details from user-generated content.
   - Curated child-friendly username generator (`generateSafeStrikerUsername`) and pre-approved quick chat messages (`SAFE_QUICK_CHATS`).
