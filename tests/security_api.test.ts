import { describe, it, expect } from "vitest";
import { createSignedToken, verifySignedToken, SecureSessionPayload } from "../api/index";

describe("API Security & Session Token Architecture", () => {
  it("should create a valid cryptographically signed session token", () => {
    const payload: SecureSessionPayload = {
      userId: "usr_student_123",
      role: "student",
      username: "SonicSolver99",
      iat: Math.floor(Date.now() / 1000)
    };

    const token = createSignedToken(payload);
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const verified = verifySignedToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("usr_student_123");
    expect(verified?.role).toBe("student");
    expect(verified?.username).toBe("SonicSolver99");
  });

  it("should reject tampered session tokens attempting privilege escalation", () => {
    const originalPayload: SecureSessionPayload = {
      userId: "usr_student_123",
      role: "student",
      username: "SonicSolver99",
      iat: Math.floor(Date.now() / 1000)
    };

    const validToken = createSignedToken(originalPayload);
    const [payloadB64, signature] = validToken.split(".");

    // Attacker modifies role from 'student' to 'super_admin'
    const tamperedObj = {
      userId: "usr_student_123",
      role: "super_admin",
      username: "SonicSolver99",
      iat: Math.floor(Date.now() / 1000)
    };
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(tamperedObj)).toString("base64url");
    const tamperedToken = `${tamperedPayloadB64}.${signature}`;

    const verified = verifySignedToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it("should reject expired session tokens older than 7 days", () => {
    const expiredPayload: SecureSessionPayload = {
      userId: "usr_student_123",
      role: "student",
      username: "SonicSolver99",
      iat: Math.floor(Date.now() / 1000) - (8 * 86400) // 8 days ago
    };

    const token = createSignedToken(expiredPayload);
    const verified = verifySignedToken(token);
    expect(verified).toBeNull();
  });

  it("should reject malformed or non-token strings", () => {
    expect(verifySignedToken("")).toBeNull();
    expect(verifySignedToken("random-string-without-dot")).toBeNull();
    expect(verifySignedToken("invalid.signature.extra")).toBeNull();
  });
});
