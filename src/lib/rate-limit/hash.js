import { createHash } from "node:crypto";

/**
 * Hashes a visitor's IP so it's never stored raw (CLAUDE.md's contact-form
 * rule). Uses ANALYTICS_SALT when set (same salting strategy the daily
 * visitor hash in src/lib/analytics will use), falling back to JWT_SECRET
 * — both are app secrets already, and this only needs *a* secret, not a
 * dedicated one, to stop the hash being a trivial unsalted lookup. Falls
 * back once more to a fixed string so a dev box with neither set still
 * never stores a raw IP (see docs/DECISIONS.md step 5).
 * @param {string} ip
 * @returns {string}
 */
export function hashIp(ip) {
  const salt =
    process.env.ANALYTICS_SALT || process.env.JWT_SECRET || "portfolio-rate-limit-fallback-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}
