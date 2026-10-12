import { z } from "zod";
import { objectIdStringSchema } from "./common.js";

export const skillSchema = z.object({
  name: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  category: z.string().trim().default(""),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

/** Admin list quick show/hide toggle, step 8. */
export const skillVisibleToggleSchema = z.object({
  id: objectIdStringSchema,
  value: z.boolean(),
});

/** Admin list delete action, step 8. */
export const skillIdSchema = z.object({
  id: objectIdStringSchema,
});

/** Admin list drag-to-reorder: the skill ids in their new display order. */
export const skillReorderSchema = z.object({
  orderedIds: z.array(objectIdStringSchema).min(1),
});

/**
 * Add/Edit skill form (step 8). Same fields as `skillSchema` except
 * `order`: the form offers a 1-based "Display order" position (or
 * "last") — see `insertIdAtPosition`.
 */
export const skillFormSchema = skillSchema.omit({ order: true }).extend({
  orderChoice: z.union([z.number().int().min(1), z.literal("last")]),
});

/** `skillFormSchema` plus the id of the skill being edited. */
export const skillUpdateFormSchema = skillFormSchema.extend({
  id: objectIdStringSchema,
});
