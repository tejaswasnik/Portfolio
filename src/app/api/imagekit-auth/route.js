export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { generateUploadAuth } from "@/lib/imagekit/client.js";

/**
 * Signs a one-time token/expire/signature for a client-side ImageKit
 * upload (CLAUDE.md/docs/PROMPTS.md step 9: "admin only... signs upload
 * tokens"). Admin-gated with `requireAdmin`; a GET needs no CSRF check
 * (it's read-only and can't mutate state on its own), unlike the
 * POST/DELETE admin routes.
 */
export async function GET() {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const auth = generateUploadAuth();
  if (!auth) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet." },
      { status: 503 },
    );
  }

  return NextResponse.json(auth);
}
