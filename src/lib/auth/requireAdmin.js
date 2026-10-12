import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "./jwt.js";
import { SESSION_COOKIE_NAME } from "./session.js";
import { getDb } from "../db/client.js";
import { findUserById } from "../db/collections/users.js";

/**
 * The authoritative session check — every server action and route
 * handler under /admin must call this (CLAUDE.md: "protected twice:
 * middleware and a server-side session check in each action or route
 * handler"). Unlike `src/middleware.js` (edge, signature/expiry only),
 * this also re-verifies `tokenVersion` against the live database, so a
 * token from before a logout-elsewhere or password change is rejected
 * even if its signature and expiry are still otherwise valid.
 *
 * Read-only: does not re-issue/slide the cookie. Next.js forbids setting
 * cookies during a Server Component render, and the sliding refresh
 * already happens once per request in middleware (which runs before
 * every /admin/* request, including route handlers and server actions)
 * — see docs/DECISIONS.md step 7 for the full two-layer trust model.
 *
 * @param {{ redirectOnFail?: boolean }} [options] Pass `redirectOnFail: false`
 *   in a route handler/server action to get `null` back instead of a
 *   Next.js redirect, so the caller can return a JSON 401.
 * @returns {Promise<{ db: import('mongodb').Db, user: import('mongodb').Document } | null>}
 */
export async function requireAdmin({ redirectOnFail = true } = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) {
    try {
      const db = await getDb();
      const user = await findUserById(db, session.sub);
      if (user && user.tokenVersion === session.ver) {
        return { db, user };
      }
    } catch {
      // DB unreachable — fall through to the unauthenticated path below
      // rather than letting an infra failure look like a valid session.
    }
  }

  if (redirectOnFail) redirect("/admin/login");
  return null;
}
