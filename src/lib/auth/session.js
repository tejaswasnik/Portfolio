import { SESSION_MAX_AGE_SECONDS } from "./jwt.js";

export const SESSION_COOKIE_NAME = "admin_session";

/**
 * Cookie attributes shared by every place that sets the session cookie
 * (login route, middleware's sliding refresh). HTTP-only, Secure outside
 * dev, SameSite=Lax — CLAUDE.md: "Never put the JWT in localStorage or a
 * client-readable cookie."
 * @param {number} [maxAge]
 */
export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

/**
 * Sets the session cookie on any cookie jar with a `.set(name, value, options)`
 * method — works for both `NextResponse.cookies` and the `next/headers`
 * `cookies()` store.
 * @param {{ set: Function }} cookieJar
 * @param {string} token
 */
export function setSessionCookie(cookieJar, token) {
  cookieJar.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
}

/**
 * Clears the session cookie on logout. `maxAge: 0` is the most
 * compatible "delete" across `NextResponse.cookies`/`next/headers`.
 * @param {{ set: Function }} cookieJar
 */
export function clearSessionCookie(cookieJar) {
  cookieJar.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(0) });
}
