import { z } from "zod";
import { objectIdStringSchema } from "./common.js";

/** The 8 home sections, per docs/PRD.md §2.2. */
export const sectionKeyValues = [
  "banner",
  "profile",
  "about",
  "contact-links",
  "github-heatmap",
  "projects",
  "tech-stack",
  "lets-talk",
  "interest-images",
];

export const sectionSchema = z.object({
  key: z.enum(sectionKeyValues),
  label: z.string().trim().min(1),
  visible: z.boolean().default(true),
  order: z.number().int(),
});

/** Admin Sections screen's quick visibility toggle, step 8. */
export const sectionVisibleToggleSchema = z.object({
  id: objectIdStringSchema,
  value: z.boolean(),
});

/** Admin Sections screen's drag-to-reorder: ids in their new order. */
export const sectionReorderSchema = z.object({
  orderedIds: z.array(objectIdStringSchema).min(1),
});
