import { z } from "zod";
import { objectIdStringSchema, slugSchema, optionalUrlSchema } from "./common.js";
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

/** Admin list quick-toggle actions (featured/published), step 8. */
export const projectToggleSchema = z.object({
  id: objectIdStringSchema,
  value: z.boolean(),
});

/** Admin list delete action, step 8. */
export const projectIdSchema = z.object({
  id: objectIdStringSchema,
});

/** Admin list drag-to-reorder: the project ids in their new display order. */
export const projectReorderSchema = z.object({
  orderedIds: z.array(objectIdStringSchema).min(1),
});

/**
 * New/Edit project form (step 8). Same fields as `projectSchema` except
 * `order`: the form offers a 1-based "Display order" position (or
 * "last"), which the create/update actions turn into a real `order` by
 * re-sequencing every project — see `insertIdAtPosition`.
 */
export const projectFormSchema = projectSchema.omit({ order: true }).extend({
  orderChoice: z.union([z.number().int().min(1), z.literal("last")]),
});

/** `projectFormSchema` plus the id of the project being edited. */
export const projectUpdateFormSchema = projectFormSchema.extend({
  id: objectIdStringSchema,
});
