import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Firestore Security Rules Specification & Verification", () => {
  const rulesContent = fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");

  it("should have rules_version = '2'", () => {
    expect(rulesContent).toContain("rules_version = '2'");
  });

  it("must enforce deny-by-default at the end of the ruleset", () => {
    expect(rulesContent).toMatch(/match\s*\/\{document=\*\*\}\s*\{\s*allow\s*read,\s*write:\s*if\s*false;/);
  });

  it("must NOT contain insecure universal allow wildcard permissions for private data", () => {
    expect(rulesContent).not.toMatch(/match\s*\/users\/\{userId\}\s*\{[^}]*allow\s*write:\s*if\s*true;/);
    expect(rulesContent).not.toMatch(/match\s*\/security_audit_logs\/\{logId\}\s*\{[^}]*allow\s*update.*:\s*if\s*true/);
  });

  it("must enforce immutable audit logs", () => {
    expect(rulesContent).toContain("allow update, delete: if false; // Strict immutability");
  });

  it("must include role and authorization helper functions", () => {
    expect(rulesContent).toContain("function isAdmin()");
    expect(rulesContent).toContain("function isTeacher()");
    expect(rulesContent).toContain("function isParent()");
    expect(rulesContent).toContain("function isUser(userId)");
    expect(rulesContent).toContain("function unchanged(field)");
  });

  it("must validate score bounds on leaderboard updates", () => {
    expect(rulesContent).toContain("function isSafeScore(val)");
    expect(rulesContent).toContain("request.resource.data.xp >= 0 && request.resource.data.xp <= 50000000");
  });
});
