import { z } from "zod";

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
];

export const sectionSchema = z.object({
  key: z.enum(sectionKeyValues),
  label: z.string().trim().min(1),
  visible: z.boolean().default(true),
  order: z.number().int(),
});
