"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import {
  deleteProjectById,
  reorderProjects as reorderProjectsInDb,
  updateProjectById,
} from "@/lib/db/collections/projects.js";
import {
  projectIdSchema,
  projectReorderSchema,
  projectToggleSchema,
} from "@/lib/schemas/project.js";

/** Revalidates every page the admin projects list can affect. */
function revalidateProjects() {
  revalidateTag(CACHE_TAGS.projects);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

/** @param {unknown} input `{ id, value }` */
export async function toggleProjectFeatured(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateProjectById(session.db, parsed.data.id, { featured: parsed.data.value });
  revalidateProjects();
  return { ok: true };
}

/** @param {unknown} input `{ id, value }` */
export async function toggleProjectPublished(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateProjectById(session.db, parsed.data.id, { published: parsed.data.value });
  revalidateProjects();
  return { ok: true };
}

/** @param {unknown} input `{ id }` */
export async function deleteProject(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await deleteProjectById(session.db, parsed.data.id);
  revalidateProjects();
  return { ok: true };
}

/** @param {unknown} input `{ orderedIds }` */
export async function reorderProjects(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectReorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await reorderProjectsInDb(session.db, parsed.data.orderedIds);
  revalidateProjects();
  return { ok: true };
}
