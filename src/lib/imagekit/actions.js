"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { deleteImageKitFile } from "./client.js";

const deleteFileSchema = z.object({ fileId: z.string().trim().min(1) });

/**
 * Deletes a file from ImageKit, shared by every admin form using
 * `Dropzone` (cover image, screenshots, profile photo, resume) so a
 * replaced/removed file doesn't linger in the media library — CLAUDE.md
 * step 9: "storing url and fileId so replaced files are deleted from
 * ImageKit". Best-effort: a missing/already-gone file is not an error
 * the UI needs to surface, so this never blocks the caller's own save.
 * @param {unknown} input `{ fileId }`
 */
export async function deleteImageKitFileAction(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = deleteFileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  return deleteImageKitFile(parsed.data.fileId);
}
