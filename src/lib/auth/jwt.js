import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "../env.js";

/** Sliding session lifetime (docs/ARCHITECTURE.md: "exp ≈ 30 min"). */
export const SESSION_MAX_AGE_SECONDS = 30 * 60;

function secretKey() {
  return new TextEncoder().encode(getEnv().JWT_SECRET);
}

/**
 * Signs an admin session token. Claims: `sub` (user id string) and `ver`
 * (users.tokenVersion at sign time) — docs/ARCHITECTURE.md's Authentication
 * section.
 * @param {{ sub: string, ver: number }} claims
 * @returns {Promise<string>}
 */
export function signSessionToken({ sub, ver }) {
  return new SignJWT({ ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/**
 * Verifies a session token's signature and expiry (edge-safe — this is
 * all `src/middleware.js` can do, since it can't reach MongoDB). Does
 * NOT check `tokenVersion` against the database; that's `requireAdmin()`'s
 * job, which is the authoritative check.
 * @param {string} token
 * @returns {Promise<{ sub: string, ver: number } | null>} null if invalid/expired
 */
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") return null;
    return { sub: payload.sub, ver: payload.ver };
  } catch {
    return null;
  }
}
