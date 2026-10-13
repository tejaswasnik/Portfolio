"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import { insertIdAtPosition } from "@/lib/db/order.js";
import {
  deleteSkillById,
  findAllSkills,
  findSkillById,
  insertSkill,
  reorderSkills as reorderSkillsInDb,
  updateSkillById,
} from "@/lib/db/collections/skills.js";
import {
  iconLibraryValues,
  skillFormSchema,
  skillIdSchema,
  skillReorderSchema,
  skillUpdateFormSchema,
  skillVisibleToggleSchema,
} from "@/lib/schemas/skill.js";
import { searchIconLibrary } from "@/lib/icons/resolveSkillIcon.js";

/** Revalidates every page a skills mutation can affect. */
function revalidateSkills() {
  revalidateTag(CACHE_TAGS.skills);
  revalidatePath("/admin/skills");
  revalidatePath("/projects");
  revalidatePath("/");
}

/** @param {unknown} input `{ id, value }` */
export async function toggleSkillVisible(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = skillVisibleToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateSkillById(session.db, parsed.data.id, { visible: parsed.data.value });
  revalidateSkills();
  return { ok: true };
}

/** @param {unknown} input `{ id }` */
export async function deleteSkill(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = skillIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await deleteSkillById(session.db, parsed.data.id);
  revalidateSkills();
  return { ok: true };
}

/** @param {unknown} input `{ orderedIds }` */
export async function reorderSkills(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = skillReorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await reorderSkillsInDb(session.db, parsed.data.orderedIds);
  revalidateSkills();
  return { ok: true };
}

/**
 * Searches one icon library for the admin icon picker (Fix 2) — never
 * returns more than 48 results, same bound every library's own
 * `search*Icons()` helper enforces.
 * @param {unknown} input `{ library, query }`
 */
export async function searchSkillIcons(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, results: [] };

  const library = iconLibraryValues.includes(input?.library) ? input.library : "simple-icons";
  const query = typeof input?.query === "string" ? input.query : "";
  return { ok: true, results: searchIconLibrary(library, query) };
}

/** @param {unknown} input `skillFormSchema` shape */
export async function createSkill(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { orderChoice, ...fields } = parsed.data;
  const result = await insertSkill(session.db, fields);
  const insertedId = result.insertedId.toString();

  const otherIds = (await findAllSkills(session.db))
    .map((skill) => skill._id.toString())
    .filter((id) => id !== insertedId);
  const orderedIds = insertIdAtPosition(otherIds, insertedId, orderChoice);
  await reorderSkillsInDb(session.db, orderedIds);

  revalidateSkills();
  return { ok: true, id: insertedId };
}

/** @param {unknown} input `skillUpdateFormSchema` shape */
export async function updateSkill(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = skillUpdateFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, orderChoice, ...fields } = parsed.data;

  const existing = await findSkillById(session.db, id);
  if (!existing) return { ok: false, error: "This skill no longer exists." };

  await updateSkillById(session.db, id, fields);

  const otherIds = (await findAllSkills(session.db))
    .map((skill) => skill._id.toString())
    .filter((skillId) => skillId !== id);
  const orderedIds = insertIdAtPosition(otherIds, id, orderChoice);
  await reorderSkillsInDb(session.db, orderedIds);

  revalidateSkills();
  return { ok: true };
}
