import nodemailer from "nodemailer";
import { getEnv } from "../env.js";

let cachedTransporter;

/**
 * Builds (and caches) the Nodemailer transport for Gmail OAuth2. Reads
 * credentials lazily, at call time, never at module load — so importing
 * this module never throws even when the Google OAuth env vars are
 * blank (see docs/DECISIONS.md step 5). Returns `null` when any required
 * credential is missing, instead of throwing, so the caller can treat a
 * missing-credential environment exactly like a real send failure.
 * @returns {import('nodemailer').Transporter | null}
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const env = getEnv();
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GMAIL_USER } = env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GMAIL_USER) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_USER,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      refreshToken: GOOGLE_REFRESH_TOKEN,
    },
  });
  return cachedTransporter;
}

/**
 * The one place the app sends email (CLAUDE.md: "one sendMail() helper").
 * Node runtime only — never import this from middleware or an edge
 * route. Never throws: any failure (missing credentials, a rejected
 * send) resolves to `{ ok: false }` so callers can record `emailFailed`
 * without their own try/catch.
 * @param {{ to: string, subject: string, text: string }} message
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendMail({ to, subject, text }) {
  try {
    const transporter = getTransporter();
    if (!transporter) return { ok: false };

    const env = getEnv();
    await transporter.sendMail({ from: env.GMAIL_USER, to, subject, text });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Builds and sends the admin notification for a new contact message.
 * @param {{ to: string, name: string, email: string, subject: string, message: string }} params
 * @returns {Promise<{ ok: boolean }>}
 */
export async function sendContactNotification({ to, name, email, subject, message }) {
  return sendMail({
    to,
    subject: subject ? `Portfolio contact: ${subject}` : "New portfolio contact message",
    text: `From: ${name} <${email}>\n\n${message}`,
  });
}
