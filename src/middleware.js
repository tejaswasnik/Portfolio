import { NextResponse } from "next/server";
import { signSessionToken, verifySessionToken } from "./lib/auth/jwt.js";
import { SESSION_COOKIE_NAME, setSessionCookie } from "./lib/auth/session.js";

/**
 * Edge-safe first pass for /admin/*: `jose`'s HS256 verify works here
 * (no mongodb driver, no bcrypt, no Nodemailer — none of those run on
 * the Edge runtime). This only checks the token's signature and expiry;
 * it cannot check `tokenVersion` against the database, so
 * `src/lib/auth/requireAdmin.js` remains the authoritative check every
 * server action/route handler must also call (docs/DECISIONS.md step 7
 * has the full two-layer trust model).
 *
 * `/admin/login` is excluded (it's the one admin route that must stay
 * reachable without a session). On every other matched request with a
 * valid token, the cookie is re-issued with a fresh expiry — this is
 * the "slides on activity" behavior CLAUDE.md asks for; it happens here
 * because middleware is the one place that runs before *every* request
 * (pages, server actions, route handlers alike) and is allowed to set
 * response cookies.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const response = NextResponse.next();
  const freshToken = await signSessionToken(session);
  setSessionCookie(response.cookies, freshToken);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
