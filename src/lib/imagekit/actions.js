"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { deleteMediaByFileId } from "@/lib/db/collections/media.js";
import { deleteImageKitFile } from "./client.js";

const deleteFileSchema = z.object({ fileId: z.string().trim().min(1) });

/**
 * Deletes a file from ImageKit, shared by every admin form using
 * `Dropzone` (cover image, screenshots, profile photo, resume, banner)
 * so a replaced/removed file doesn't linger in the media library —
 * CLAUDE.md step 9: "storing url and fileId so replaced files are
 * deleted from ImageKit". Also removes the matching media library catalog
 * entry (step 12: "keep the media collection in sync on every upload,
 * replace and delete") — best-effort, same as the ImageKit delete itself,
 * since a missing/already-gone file is not an error the UI needs to
 * surface.
 * @param {unknown} input `{ fileId }`
 */
export async function deleteImageKitFileAction(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = deleteFileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const result = await deleteImageKitFile(parsed.data.fileId);
  deleteMediaByFileId(session.db, parsed.data.fileId).catch(() => {});
  return result;
}
