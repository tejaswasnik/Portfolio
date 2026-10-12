import { z } from "zod";
import { optionalUrlSchema } from "./common.js";

/** Per-entity SEO overrides; every field is optional and falls back elsewhere. */
export const seoSchema = z.object({
  title: z.string().trim().max(70).optional().or(z.literal("")),
  description: z.string().trim().max(160).optional().or(z.literal("")),
  ogImage: optionalUrlSchema.optional(),
});
