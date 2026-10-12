"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import { updateSiteSettings, getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { updateUserEmail, updateUserPassword, bumpTokenVersion } from "@/lib/db/collections/users.js";
import { findAllProjects } from "@/lib/db/collections/projects.js";
import { findAllSkills } from "@/lib/db/collections/skills.js";
import { findMessages } from "@/lib/db/collections/messages.js";
import { serializeDoc, serializeDocs } from "@/lib/db/serialize.js";
import { hashPassword, verifyPassword } from "@/lib/auth/password.js";
import { settingsFormSchema, maintenanceToggleSchema } from "@/lib/schemas/site-settings.js";
import { changePasswordSchema } from "@/lib/schemas/user.js";

function revalidateSettings() {
  revalidateTag(CACHE_TAGS.siteSettings);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

/** @param {unknown} input `settingsFormSchema` shape */
export async function saveSettings(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = settingsFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { adminEmail, ...siteSettingsFields } = parsed.data;

  await updateSiteSettings(session.db, siteSettingsFields);

  const emailChanged = adminEmail !== session.user.email;
  if (emailChanged) {
    await updateUserEmail(session.db, session.user._id, adminEmail);
    await bumpTokenVersion(session.db, session.user._id);
  }

  revalidateSettings();
  return { ok: true, requiresReauth: emailChanged };
}

/** @param {unknown} input `{ value }` */
export async function toggleMaintenanceMode(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = maintenanceToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateSiteSettings(session.db, { maintenanceMode: parsed.data.value });
  revalidateSettings();
  return { ok: true };
}

/** @param {unknown} input `changePasswordSchema` shape */
export async function changePassword(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the form and try again.",
    };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, session.user.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await updateUserPassword(session.db, session.user._id, passwordHash);
  await bumpTokenVersion(session.db, session.user._id);

  return { ok: true, requiresReauth: true };
}

/**
 * Builds the full JSON export (Figma 71:7's "Data export" card):
 * projects, skills, messages and settings in one file for backup or
 * migration. Returned to the client, which triggers the download — no
 * route handler needed since a server action can return any JSON-able
 * value.
 */
export async function exportSiteData() {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const [projects, skills, messages, settings] = await Promise.all([
    findAllProjects(session.db),
    findAllSkills(session.db),
    findMessages(session.db),
    getSiteSettings(session.db),
  ]);

  return {
    ok: true,
    data: {
      exportedAt: new Date().toISOString(),
      projects: serializeDocs(projects),
      skills: serializeDocs(skills),
      messages: serializeDocs(messages),
      settings: serializeDoc(settings),
    },
  };
}
