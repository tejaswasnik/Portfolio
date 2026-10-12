export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { bumpTokenVersion } from "@/lib/db/collections/users.js";
import { clearSessionCookie } from "@/lib/auth/session.js";
import { isSameOriginRequest } from "@/lib/auth/csrf.js";

/**
 * Bumps tokenVersion (invalidating this token and any other outstanding
 * one, per CLAUDE.md) and clears the cookie — belt-and-suspenders, since
 * a plain JWT can't be revoked by itself.
 */
export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = await requireAdmin({ redirectOnFail: false });
  const response = NextResponse.json({ ok: true });

  if (session) {
    await bumpTokenVersion(session.db, session.user._id);
  }

  clearSessionCookie(response.cookies);
  return response;
}
