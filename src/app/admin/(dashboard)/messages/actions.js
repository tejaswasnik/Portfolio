"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import {
  deleteMessageById,
  findMessageById,
  markAllMessagesRead,
  updateMessageById,
} from "@/lib/db/collections/messages.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { sendContactNotification } from "@/lib/mail/sendMail.js";
import { messageIdSchema, messageToggleSchema } from "@/lib/schemas/message.js";

function revalidateMessages() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

/** @param {unknown} input `{ id, value }` — sets `read` */
export async function setMessageRead(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = messageToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateMessageById(session.db, parsed.data.id, { read: parsed.data.value });
  revalidateMessages();
  return { ok: true };
}

/** @param {unknown} input `{ id, value }` — sets `archived` */
export async function setMessageArchived(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = messageToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateMessageById(session.db, parsed.data.id, { archived: parsed.data.value });
  revalidateMessages();
  return { ok: true };
}

/** @param {unknown} input `{ id }` */
export async function deleteMessage(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = messageIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await deleteMessageById(session.db, parsed.data.id);
  revalidateMessages();
  return { ok: true };
}

export async function markAllRead() {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  await markAllMessagesRead(session.db);
  revalidateMessages();
  return { ok: true };
}

/**
 * Re-attempts the admin notification email for a message previously
 * flagged `emailFailed` (CLAUDE.md: "if the email fails set emailFailed
 * for retry"). Clears the flag on success; leaves it set on another
 * failure so the retry button stays available.
 * @param {unknown} input `{ id }`
 */
export async function retryMessageEmail(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = messageIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const message = await findMessageById(session.db, parsed.data.id);
  if (!message) return { ok: false, error: "This message no longer exists." };

  const siteSettings = await getSiteSettings(session.db);
  if (!siteSettings?.notificationEmail) {
    return { ok: false, error: "No notification email is set in Settings." };
  }

  const result = await sendContactNotification({
    to: siteSettings.notificationEmail,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
  });

  await updateMessageById(session.db, parsed.data.id, { emailFailed: !result.ok });
  revalidateMessages();

  return result.ok ? { ok: true } : { ok: false, error: "The retry also failed. Try again later." };
}
