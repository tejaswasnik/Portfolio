import { describe, expect, it, vi, beforeEach } from "vitest";

describe("hashVisitor / currentDateKey", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("produces the same hash for the same ip/userAgent/day", async () => {
    vi.stubEnv("ANALYTICS_SALT", "test-salt");
    const { hashVisitor } = await import("./hash.js");
    const a = hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-12");
    const b = hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-12");
    expect(a).toBe(b);
  });

  it("produces a different hash on a different day (daily rotation)", async () => {
    vi.stubEnv("ANALYTICS_SALT", "test-salt");
    const { hashVisitor } = await import("./hash.js");
    const day1 = hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-12");
    const day2 = hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-13");
    expect(day1).not.toBe(day2);
  });

  it("produces a different hash for a different IP", async () => {
    vi.stubEnv("ANALYTICS_SALT", "test-salt");
    const { hashVisitor } = await import("./hash.js");
    const a = hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-12");
    const b = hashVisitor("5.6.7.8", "Mozilla/5.0", "2026-10-12");
    expect(a).not.toBe(b);
  });

  it("never throws even with no salt configured at all", async () => {
    const { hashVisitor } = await import("./hash.js");
    expect(() => hashVisitor("1.2.3.4", "Mozilla/5.0", "2026-10-12")).not.toThrow();
  });

  it("currentDateKey formats as YYYY-MM-DD", async () => {
    const { currentDateKey } = await import("./hash.js");
    expect(currentDateKey(new Date("2026-10-12T15:30:00Z"))).toBe("2026-10-12");
  });
});
