import { createHash } from "node:crypto";

/**
 * Today's UTC date as `YYYY-MM-DD`, the rotation key for `hashVisitor`.
 * A separate function (not inlined) so tests can pass a fixed `date`.
 */
export function currentDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/**
 * Daily-rotating, salted visitor id (PRD §3.2: "no cookies, no raw IPs"
 * — "a daily-rotating hashed visitor ID (IP + user agent + salt)").
 * Hashing in the date means the same visitor gets a different id every
 * day, so events can't be correlated across days even internally.
 * @param {string} ip
 * @param {string} userAgent
 * @param {string} [dateKey] defaults to today (UTC)
 * @returns {string}
 */
export function hashVisitor(ip, userAgent, dateKey = currentDateKey()) {
  const salt =
    process.env.ANALYTICS_SALT || process.env.JWT_SECRET || "portfolio-rate-limit-fallback-salt";
  return createHash("sha256").update(`${salt}:${dateKey}:${ip}:${userAgent}`).digest("hex");
}
