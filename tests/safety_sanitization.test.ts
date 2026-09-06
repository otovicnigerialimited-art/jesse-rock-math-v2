import { describe, it, expect } from "vitest";
import { sanitizeUserInput, sanitizeTextForPII, checkActionRateLimit } from "../src/lib/safetyUtils";

describe("Input Sanitization, XSS & Child Safety (COPPA/GDPR-K)", () => {
  it("should strip malicious script tags and event handlers", () => {
    const malicious = '<script>alert("hacked")</script>Hello <img src=x onerror=alert(1)>';
    const cleaned = sanitizeUserInput(malicious);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("onerror=");
    expect(cleaned).toContain("Hello");
  });

  it("should strip pseudo-protocol javascript: and iframe injections", () => {
    const attack = '<iframe src="javascript:alert(1)"></iframe>Click <a href="javascript:doEvil()">here</a>';
    const cleaned = sanitizeUserInput(attack);
    expect(cleaned).not.toContain("<iframe");
    expect(cleaned).not.toContain("javascript:");
  });

  it("should detect and redact private email addresses", () => {
    const text = "Contact the student at student.secret@school.edu for homework.";
    const result = sanitizeTextForPII(text);
    expect(result.isSafe).toBe(false);
    expect(result.cleaned).toContain("[Private Email Removed]");
    expect(result.cleaned).not.toContain("student.secret@school.edu");
  });

  it("should detect and redact phone numbers", () => {
    const text = "Call me at +1 (555) 234-5678 or 07123456789";
    const result = sanitizeTextForPII(text);
    expect(result.isSafe).toBe(false);
    expect(result.cleaned).toContain("[Phone Number Removed]");
  });

  it("should detect and redact credit card number patterns", () => {
    const text = "Paid with card 4111 2222 3333 4444 thanks";
    const result = sanitizeTextForPII(text);
    expect(result.isSafe).toBe(false);
    expect(result.cleaned).toContain("[Payment Info Removed]");
  });

  it("should enforce action rate limits properly", () => {
    const actionKey = "test_rate_limit_action";
    // First 3 calls allowed
    expect(checkActionRateLimit(actionKey, 3, 5000).allowed).toBe(true);
    expect(checkActionRateLimit(actionKey, 3, 5000).allowed).toBe(true);
    expect(checkActionRateLimit(actionKey, 3, 5000).allowed).toBe(true);
    // 4th call within window should be blocked
    const fourth = checkActionRateLimit(actionKey, 3, 5000);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });
});
