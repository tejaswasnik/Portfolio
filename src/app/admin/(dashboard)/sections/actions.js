"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import {
  reorderSections as reorderSectionsInDb,
  updateSectionById,
} from "@/lib/db/collections/sections.js";
import { sectionReorderSchema, sectionVisibleToggleSchema } from "@/lib/schemas/section.js";

/** Revalidates every page a sections mutation can affect. */
function revalidateSections() {
  revalidateTag(CACHE_TAGS.sections);
  revalidatePath("/admin/sections");
  revalidatePath("/");
}

/** @param {unknown} input `{ id, value }` */
export async function toggleSectionVisible(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = sectionVisibleToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateSectionById(session.db, parsed.data.id, { visible: parsed.data.value });
  revalidateSections();
  return { ok: true };
}

/** @param {unknown} input `{ orderedIds }` */
export async function reorderSections(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = sectionReorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await reorderSectionsInDb(session.db, parsed.data.orderedIds);
  revalidateSections();
  return { ok: true };
}
