import { z } from "zod";
import { slugSchema, optionalUrlSchema } from "./common.js";
import { seoSchema } from "./seo.js";

/**
 * Internal status values. The PRD displays "Ongoing" / "Completed";
 * stored lowercase for consistency with other enum fields.
 */
export const projectStatusValues = ["ongoing", "completed"];

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  shortDescription: z.string().trim().min(1).max(160),
  longDescription: z.string().trim().min(1),
  coverImage: optionalUrlSchema.default(""),
  screenshots: z.array(z.string().url()).default([]),
  liveUrl: optionalUrlSchema.default(""),
  githubUrl: optionalUrlSchema.default(""),
  techIds: z.array(z.string()).default([]),
  status: z.enum(projectStatusValues),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
  seo: seoSchema.optional(),
});
