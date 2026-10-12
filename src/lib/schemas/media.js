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

export const mediaSchema = z.object({
  fileId: z.string().min(1),
  url: z.string().url(),
  name: z.string().trim().min(1),
  type: z.string().trim().min(1),
  size: z.number().int().nonnegative(),
  usedIn: z.array(z.enum(mediaUsageValues)).default([]),
  createdAt: z.date().optional(),
});

/** Validates one `recordMediaUpload` call (step 12) — everything `mediaSchema` needs except `createdAt`, which the collection helper stamps. */
export const mediaUploadSchema = mediaSchema.omit({ createdAt: true });

/** Media library delete action, step 12. */
export const mediaIdSchema = z.object({
  id: objectIdStringSchema,
});
