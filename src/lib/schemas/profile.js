import { z } from "zod";
import { optionalUrlSchema } from "./common.js";
import { siteSettingsSchema } from "./site-settings.js";

export const socialLinksSchema = z.object({
  email: z.union([z.string().email(), z.literal("")]).default(""),
  github: optionalUrlSchema.default(""),
  linkedin: optionalUrlSchema.default(""),
  twitter: optionalUrlSchema.default(""),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  location: z.string().trim().default(""),
  photoUrl: optionalUrlSchema.default(""),
  about: z.string().trim().min(1),
  footnote: z.string().trim().default(""),
  socialLinks: socialLinksSchema.default({
    email: "",
    github: "",
    linkedin: "",
    twitter: "",
  }),
  bannerUrl: optionalUrlSchema.default(""),
  bannerFileId: z.string().default(""),
  resumeUrl: optionalUrlSchema.default(""),
  resumeFileId: z.string().default(""),
  letsTalkHeading: z.string().trim().min(1),
  letsTalkSubtext: z.string().trim().min(1),
});

/**
 * Admin Profile & About form (step 8, Figma 69:612). Figma's single
 * screen edits fields that actually live on two different documents per
 * docs/ARCHITECTURE.md's data model: everything above is `profile`, but
 * "Footer text" and "GitHub username" are `siteSettings` fields — reused
 * here via `.pick()` so each field's validation rule has one definition.
 * The "Show heatmap" toggle isn't part of this schema at all: it's the
 * same `sections` document's `visible` field the admin Sections screen
 * already toggles, saved instantly via that screen's own action to
 * avoid a second, driftable boolean for the same thing.
 */
export const profileFormSchema = profileSchema.extend(
  siteSettingsSchema.pick({ footerText: true, githubUsername: true }).shape,
);
