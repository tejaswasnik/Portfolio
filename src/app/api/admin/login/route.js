// bcryptjs/mongodb need the Node runtime.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/schemas/user.js";
import { getDb } from "@/lib/db/client.js";
import {
  findUserByEmail,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/db/collections/users.js";
import {
  attemptsRemaining,
  computeAfterFailedLogin,
  isLockedOut,
} from "@/lib/auth/lockout.js";
import { verifyPassword } from "@/lib/auth/password.js";
import { signSessionToken } from "@/lib/auth/jwt.js";
import { setSessionCookie } from "@/lib/auth/session.js";
import { isSameOriginRequest } from "@/lib/auth/csrf.js";

const GENERIC_ERROR = "Invalid email or password.";
const LOCKED_ERROR = "Too many failed attempts. Try again in 15 minutes.";

export async function POST(request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  const { email, password } = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch (error) {
    console.error("Login route getDb error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later.", details: error?.message || String(error) },
      { status: 503 },
    );
  }

  const user = await findUserByEmail(db, email);

  // Same generic error whether the email doesn't exist or the password
  // is wrong — never reveal which (single-admin account, so the email
  // is already public knowledge via ADMIN_EMAIL, but stay consistent).
  if (!user) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (isLockedOut(user)) {
    return NextResponse.json({ error: LOCKED_ERROR }, { status: 423 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const failureState = computeAfterFailedLogin(user);
    await recordLoginFailure(db, email, failureState);

    if (failureState.lockedUntil) {
      return NextResponse.json({ error: LOCKED_ERROR }, { status: 423 });
    }
    const remaining = attemptsRemaining({ failedAttempts: failureState.failedAttempts });
    return NextResponse.json(
      { error: `${GENERIC_ERROR} ${remaining} attempt${remaining === 1 ? "" : "s"} left.` },
      { status: 401 },
    );
  }

  await resetLoginFailures(db, email);

  const token = await signSessionToken({ sub: user._id.toString(), ver: user.tokenVersion });
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response.cookies, token);
  return response;
}
