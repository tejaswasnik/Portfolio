import { z } from "zod";

/** Where an uploaded file is used, so the media library can block unsafe deletes. */
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
