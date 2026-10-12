import { describe, expect, it } from "vitest";
import {
  LOCKOUT_THRESHOLD,
  attemptsRemaining,
  computeAfterFailedLogin,
  isLockedOut,
} from "./lockout.js";

describe("isLockedOut", () => {
  it("is false with no lockedUntil", () => {
    expect(isLockedOut({ lockedUntil: null })).toBe(false);
  });

  it("is true while lockedUntil is in the future", () => {
    const future = new Date(Date.now() + 60_000);
    expect(isLockedOut({ lockedUntil: future })).toBe(true);
  });

  it("is false once lockedUntil is in the past", () => {
    const past = new Date(Date.now() - 60_000);
    expect(isLockedOut({ lockedUntil: past })).toBe(false);
  });
});

describe("computeAfterFailedLogin", () => {
  it("increments failedAttempts and leaves lockedUntil null below the threshold", () => {
    const result = computeAfterFailedLogin({ failedAttempts: 1 });
    expect(result).toEqual({ failedAttempts: 2, lockedUntil: null });
  });

  it("locks the account once failedAttempts reaches the threshold", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const result = computeAfterFailedLogin({ failedAttempts: LOCKOUT_THRESHOLD - 1 }, now);
    expect(result.failedAttempts).toBe(LOCKOUT_THRESHOLD);
    expect(result.lockedUntil).toEqual(new Date(now.getTime() + 15 * 60 * 1000));
  });

  it("treats a missing failedAttempts as 0", () => {
    expect(computeAfterFailedLogin({})).toEqual({ failedAttempts: 1, lockedUntil: null });
  });
});

describe("attemptsRemaining", () => {
  it("counts down from the threshold", () => {
    expect(attemptsRemaining({ failedAttempts: 0 })).toBe(LOCKOUT_THRESHOLD);
    expect(attemptsRemaining({ failedAttempts: 3 })).toBe(LOCKOUT_THRESHOLD - 3);
  });

  it("never goes negative", () => {
    expect(attemptsRemaining({ failedAttempts: LOCKOUT_THRESHOLD + 5 })).toBe(0);
  });
});
