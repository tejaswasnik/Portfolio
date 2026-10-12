"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import { updateProfile } from "@/lib/db/collections/profile.js";
import { updateSiteSettings } from "@/lib/db/collections/site-settings.js";
import { profileFormSchema } from "@/lib/schemas/profile.js";

/** @param {unknown} input `profileFormSchema` shape */
export async function saveProfileAndAbout(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = profileFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { footerText, githubUsername, ...profileFields } = parsed.data;

  await Promise.all([
    updateProfile(session.db, profileFields),
    updateSiteSettings(session.db, { footerText, githubUsername }),
  ]);

  revalidateTag(CACHE_TAGS.profile);
  revalidateTag(CACHE_TAGS.siteSettings);
  revalidatePath("/admin/profile");
  revalidatePath("/");

  return { ok: true };
}
