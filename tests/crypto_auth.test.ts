import { describe, it, expect } from "vitest";
import { hashPasswordWithSalt, verifyPasswordMatch } from "../src/lib/cryptoUtils";

describe("Cryptographic Authentication & Password Salting", () => {
  it("should generate a SHA-256 salted hash without exposing plaintext", async () => {
    const rawPass = "SuperSecretMathPass123";
    const hashed = await hashPasswordWithSalt(rawPass);
    expect(hashed).toBeDefined();
    expect(hashed.startsWith("sha256_")).toBe(true);
    expect(hashed).not.toContain(rawPass);
  });

  it("should successfully verify correct password matches", async () => {
    const rawPass = "SchoolClassroom2026";
    const hashed = await hashPasswordWithSalt(rawPass);
    const isValid = await verifyPasswordMatch(rawPass, hashed);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect passwords", async () => {
    const rawPass = "CorrectPassword";
    const hashed = await hashPasswordWithSalt(rawPass);
    const isWrongValid = await verifyPasswordMatch("WrongPassword", hashed);
    expect(isWrongValid).toBe(false);
  });
});
