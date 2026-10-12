/**
 * Login lockout policy (Figma 57:2's own copy: "Repeated failed attempts
 * lock sign-in for 15 minutes"). Pure functions only — no DB access — so
 * they're testable without a connection; src/app/api/admin/login/route.js
 * is the only caller that persists the results.
 */
export const LOCKOUT_THRESHOLD = 5;
export const LOCKOUT_MINUTES = 15;

/**
 * @param {{ lockedUntil?: Date | null }} user
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isLockedOut(user, now = new Date()) {
  return Boolean(user?.lockedUntil && new Date(user.lockedUntil) > now);
}

/**
 * Computes the `users` document update after a failed login attempt.
 * Locks the account once `failedAttempts` reaches the threshold.
 * @param {{ failedAttempts?: number }} user
 * @param {Date} [now]
 * @returns {{ failedAttempts: number, lockedUntil: Date | null }}
 */
export function computeAfterFailedLogin(user, now = new Date()) {
  const failedAttempts = (user?.failedAttempts ?? 0) + 1;
  const lockedUntil =
    failedAttempts >= LOCKOUT_THRESHOLD
      ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
      : null;
  return { failedAttempts, lockedUntil };
}

/**
 * How many failed attempts remain before lockout, for the "N attempts
 * left" copy (Figma 57:70). Never negative.
 * @param {{ failedAttempts?: number }} user
 * @returns {number}
 */
export function attemptsRemaining(user) {
  return Math.max(0, LOCKOUT_THRESHOLD - (user?.failedAttempts ?? 0));
}

/** The reset state written on a successful login. */
export const RESET_LOGIN_STATE = { failedAttempts: 0, lockedUntil: null };
