import { z } from "zod";
import { objectIdStringSchema } from "./common.js";

/**
 * Historical "uploaded for" tag. The media library (step 12) doesn't rely
 * on this for deletion safety or display — it computes live usage by
 * matching url against the real profile/siteSettings/projects documents
 * instead (`src/lib/media/usage.js`), since covers/screenshots/photo
 * never persist a fileId back onto their owning document. Kept so the
 * field shape matches docs/ARCHITECTURE.md's data model.
 */
export const mediaUsageValues = [
  "banner",
  "profile-photo",
  "resume",
  "project-cover",
  "project-screenshot",
];

/**
 * Server-side ceiling for `recordMediaUpload` (SEC-04) — the file
 * itself already reached ImageKit directly from the browser by this
 * point (CLAUDE.md step 9's signed-upload flow), so this can't stop an
 * oversized/wrong-type file from landing there, only stop it from
 * being cataloged into the app. Union of every `Dropzone` call site's
 * own `maxSizeMB`/`accept` across the app (profile photo/resume,
 * banner GIF, project covers/screenshots, favicon, skill icon upload).
 */
const MEDIA_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MEDIA_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/x-icon",
  "application/pdf",
];

export const mediaSchema = z.object({
  fileId: z.string().min(1),
  url: z.string().url(),
  name: z.string().trim().min(1),
  type: z.enum(MEDIA_ALLOWED_TYPES),
  size: z.number().int().nonnegative().max(MEDIA_MAX_SIZE_BYTES),
  usedIn: z.array(z.enum(mediaUsageValues)).default([]),
  createdAt: z.date().optional(),
});

/** Validates one `recordMediaUpload` call (step 12) — everything `mediaSchema` needs except `createdAt`, which the collection helper stamps. */
export const mediaUploadSchema = mediaSchema.omit({ createdAt: true });

/** Media library delete action, step 12. */
export const mediaIdSchema = z.object({
  id: objectIdStringSchema,
});
