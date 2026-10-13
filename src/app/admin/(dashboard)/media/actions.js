"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { deleteImageKitFile } from "@/lib/imagekit/client.js";
import {
  deleteMediaById,
  findMedia,
  findMediaById,
  insertMedia,
} from "@/lib/db/collections/media.js";
import { getProfile } from "@/lib/db/collections/profile.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { findAllProjects } from "@/lib/db/collections/projects.js";
import { findAllInterestImages } from "@/lib/db/collections/interestImages.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import { mediaIdSchema, mediaUploadSchema } from "@/lib/schemas/media.js";
import { computeFileUsage } from "@/lib/media/usage.js";

/**
 * Catalogs one ImageKit upload, called by `Dropzone` right after a
 * successful upload (CLAUDE.md step 12: "keep the media collection in
 * sync on every upload"). Fire-and-forget from the caller — never blocks
 * the field's own save on this bookkeeping.
 * @param {unknown} input `{ fileId, url, name, type, size }`
 */
export async function recordMediaUpload(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false };

  const parsed = mediaUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  await insertMedia(session.db, parsed.data);
  revalidatePath("/admin/media");
  return { ok: true };
}

/** Every cataloged image, for the "pick from the library" picker in `Dropzone`. */
export async function listImageMedia() {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, files: [] };

  const files = serializeDocs(await findMedia(session.db, { type: { $regex: "^image/" } }));
  return { ok: true, files };
}

/**
 * Deletes a cataloged file. Blocked when it's currently referenced by the
 * live profile/siteSettings/projects documents (PRD 3.10: "files in use
 * are protected with a warning"), computed live by matching the file's
 * url — see `src/lib/media/usage.js` for why that beats trusting a
 * stored tag.
 * @param {unknown} input `{ id }`
 */
export async function deleteMedia(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = mediaIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const file = await findMediaById(session.db, parsed.data.id);
  if (!file) return { ok: false, error: "This file no longer exists." };

  const [profile, siteSettings, projects, interestImages] = await Promise.all([
    getProfile(session.db),
    getSiteSettings(session.db),
    findAllProjects(session.db),
    findAllInterestImages(session.db),
  ]);
  const usage = computeFileUsage(file.url, { profile, siteSettings, projects, interestImages });
  if (usage.length > 0) {
    return {
      ok: false,
      error: `In use — ${usage.map((u) => u.label).join(", ")}.`,
      usage,
    };
  }

  if (file.fileId) await deleteImageKitFile(file.fileId);
  await deleteMediaById(session.db, parsed.data.id);
  revalidatePath("/admin/media");
  return { ok: true };
}
