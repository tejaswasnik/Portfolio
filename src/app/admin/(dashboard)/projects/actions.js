"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import {
  deleteProjectById,
  findAllProjects,
  findProjectById,
  insertIdAtPosition,
  insertProject,
  reorderProjects as reorderProjectsInDb,
  updateProjectById,
} from "@/lib/db/collections/projects.js";
import {
  projectFormSchema,
  projectIdSchema,
  projectReorderSchema,
  projectToggleSchema,
  projectUpdateFormSchema,
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

/** True for a MongoDB duplicate-key error (the unique `projects.slug` index). */
function isDuplicateSlugError(error) {
  return error?.code === 11000;
}

/** @param {unknown} input `projectFormSchema` shape */
export async function createProject(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { orderChoice, ...fields } = parsed.data;
  const now = new Date();

  let insertedId;
  try {
    const result = await insertProject(session.db, { ...fields, order: 0, createdAt: now, updatedAt: now });
    insertedId = result.insertedId.toString();
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return {
        ok: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["That slug is already in use."] },
      };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const otherIds = (await findAllProjects(session.db))
    .map((project) => project._id.toString())
    .filter((id) => id !== insertedId);
  const orderedIds = insertIdAtPosition(otherIds, insertedId, orderChoice);
  await reorderProjectsInDb(session.db, orderedIds);

  revalidateProjects();
  return { ok: true, id: insertedId };
}

/** @param {unknown} input `projectUpdateFormSchema` shape */
export async function updateProject(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = projectUpdateFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, orderChoice, ...fields } = parsed.data;

  const existing = await findProjectById(session.db, id);
  if (!existing) return { ok: false, error: "This project no longer exists." };

  try {
    await updateProjectById(session.db, id, { ...fields, updatedAt: new Date() });
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return {
        ok: false,
        error: "That slug is already in use.",
        fieldErrors: { slug: ["That slug is already in use."] },
      };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const otherIds = (await findAllProjects(session.db))
    .map((project) => project._id.toString())
    .filter((projectId) => projectId !== id);
  const orderedIds = insertIdAtPosition(otherIds, id, orderChoice);
  await reorderProjectsInDb(session.db, orderedIds);

  revalidateProjects();
  if (existing.slug !== fields.slug) revalidatePath(`/projects/${existing.slug}`);
  revalidatePath(`/projects/${fields.slug}`);
  return { ok: true };
}
