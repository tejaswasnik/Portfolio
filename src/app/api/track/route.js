// node:crypto (via src/lib/analytics/hash.js) needs the Node runtime.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { trackEventInputSchema } from "@/lib/schemas/event.js";
import { getDb } from "@/lib/db/client.js";
import { insertEvent } from "@/lib/db/collections/events.js";
import { hashVisitor } from "@/lib/analytics/hash.js";
import { isBot } from "@/lib/analytics/bot.js";
import { parseUserAgent } from "@/lib/analytics/userAgent.js";
import { verifySessionToken } from "@/lib/auth/jwt.js";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session.js";
import { getClientIp } from "@/lib/http/clientIp.js";

/**
 * Reads one cookie from the raw `Cookie` header via the standard
 * `Headers` API — works for both the real `NextRequest` and a plain
 * `Request` (route handler tests construct the latter), unlike
 * `NextRequest`'s own `.cookies.get()` convenience method.
 */
function getCookie(request, name) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * Records one analytics event (PRD §3.2). Always returns 200 — a
 * tracking beacon must never surface an error to the visitor or block
 * the page; every failure mode (bad body, admin signed in, bot UA, DB
 * down) just quietly skips the insert.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const parsed = trackEventInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  // Skip the signed-in admin's own visits (PRD: "skip events when the
  // admin is signed in"). A signature/expiry check is enough here — no
  // need for requireAdmin()'s DB-backed tokenVersion check just to
  // decide whether to count a pageview.
  const sessionToken = getCookie(request, SESSION_COOKIE_NAME);
  if (sessionToken && (await verifySessionToken(sessionToken))) {
    return NextResponse.json({ ok: true });
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (isBot(userAgent)) return NextResponse.json({ ok: true });

  try {
    const db = await getDb();
    const { device, browser, os } = parseUserAgent(userAgent);
    const country = request.headers.get("x-vercel-ip-country") || "";
    const visitorHash = hashVisitor(getClientIp(request), userAgent);

    await insertEvent(db, {
      ...parsed.data,
      country,
      device,
      browser,
      os,
      visitorHash,
    });
  } catch {
    // DB unreachable or any other failure — still 200, never block the page.
  }

  return NextResponse.json({ ok: true });
}
