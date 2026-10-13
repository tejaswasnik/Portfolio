// Nodemailer needs the Node runtime (CLAUDE.md: never import it in
// middleware or edge routes).
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { contactFormSchema, honeypotFieldName } from "@/lib/schemas/message.js";
import { getDb } from "@/lib/db/client.js";
import { insertMessage, markMessageEmailFailed } from "@/lib/db/collections/messages.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { checkAndIncrementRateLimit } from "@/lib/rate-limit/index.js";
import { hashIp } from "@/lib/rate-limit/hash.js";
import { sendContactNotification } from "@/lib/mail/sendMail.js";
import { getClientIp } from "@/lib/http/clientIp.js";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    // A filled-in honeypot means a bot submitted the form. Pretend
    // success so the bot gets no signal to adjust its behavior, without
    // saving the message or sending an email (docs/DECISIONS.md step 5).
    if (fieldErrors[honeypotFieldName]) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Please check the form and try again.", fieldErrors },
      { status: 400 },
    );
  }

  // Destructure the honeypot off before it ever reaches a DB write.
  const { [honeypotFieldName]: _honeypot, ...fields } = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 503 },
    );
  }

  const ipHash = hashIp(getClientIp(request));

  const allowed = await checkAndIncrementRateLimit(db, ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again in an hour." },
      { status: 429 },
    );
  }

  // Always save first, per CLAUDE.md's contact-form rule — the message
  // is captured even if the notification email below fails.
  const inserted = await insertMessage(db, { ...fields, ipHash });

  const siteSettings = await getSiteSettings(db);
  const notificationEmail = siteSettings?.notificationEmail;

  const sendResult = notificationEmail
    ? await sendContactNotification({ to: notificationEmail, ...fields })
    : { ok: false };

  if (!sendResult.ok) {
    await markMessageEmailFailed(db, inserted.insertedId);
  }

  // The visitor's message was captured regardless of whether the
  // notification email went out, so the client always sees success.
  return NextResponse.json({ ok: true });
}
