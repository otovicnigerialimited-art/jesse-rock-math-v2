# JESSE MATH FC — SECURITY TESTING GUIDE

## 1. Running the Automated Test Suite

To run all security, authentication, and sanitization tests:

```bash
# Run all unit and security test suites
npm test

# Run only the security-focused tests
npm run test:security
```

## 2. Test Suite Structure

- `tests/security_api.test.ts`: Validates HMAC cryptographic signatures, token forgery rejection, expiration, and payload integrity.
- `tests/security_rules.test.ts`: Verifies Firestore Security Rules structure, deny-by-default logic, immutable audit trail enforcement, and boundary checks.
- `tests/safety_sanitization.test.ts`: Verifies XSS sanitization, script injection neutralization, COPPA/GDPR-K PII detection and redaction, and action rate limiting.
- `tests/crypto_auth.test.ts`: Verifies Web Crypto API SHA-256 password salting, hashing, and verification.

## 3. Running Firebase Emulator Suite

To validate rules against a local Firebase Emulator:

```bash
firebase emulators:start
```
