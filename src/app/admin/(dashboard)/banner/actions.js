"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import { updateProfile } from "@/lib/db/collections/profile.js";
import { bannerFormSchema } from "@/lib/schemas/profile.js";

/** @param {unknown} input `bannerFormSchema` shape — `{}` reverts to the placeholder */
export async function saveBanner(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid banner." };

  await updateProfile(session.db, parsed.data);

  revalidateTag(CACHE_TAGS.profile);
  revalidatePath("/admin/banner");
  revalidatePath("/");

  return { ok: true };
}
