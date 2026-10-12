/**
 * Absolute origin used for sitemap.xml, robots.txt and OpenGraph image
 * resolution. Reads process.env.SITE_URL directly rather than through
 * getEnv() so sitemap/robots generation never depends on the core
 * Mongo/JWT/admin-email env vars being set — see docs/DECISIONS.md
 * step 6. Not secret, so a plain default is fine when unset.
 * @returns {string} an origin with no trailing slash
 */
export function getSiteUrl() {
  const raw = process.env.SITE_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : "http://localhost:3000";
}
