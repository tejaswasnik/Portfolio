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
  taglines: z.array(z.string().trim().min(1)).min(1),
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
 * Admin Profile & About form (step 8, Figma 69:612; wired to ImageKit in
 * step 9). Figma's single screen edits fields that actually live on two
 * different documents per docs/ARCHITECTURE.md's data model: everything
 * above is `profile`, but "Footer text" and "GitHub username" are
 * `siteSettings` fields — reused here via `.pick()` so each field's
 * validation rule has one definition. The "Show heatmap" toggle isn't
 * part of this schema at all: it's the same `sections` document's
 * `visible` field the admin Sections screen already toggles, saved
 * instantly via that screen's own action to avoid a second, driftable
 * boolean for the same thing.
 *
 * `bannerUrl`/`bannerFileId` are omitted on purpose: the admin Banner
 * screen (step 9, its own form/action) is the only writer of those two
 * fields. Including them here — even with their schema defaults — would
 * mean every Profile & About save `$set`s them back to `""`, silently
 * wiping whatever the Banner screen had just set.
 */
export const profileFormSchema = profileSchema
  .omit({ bannerUrl: true, bannerFileId: true })
  .extend(siteSettingsSchema.pick({ footerText: true, githubUsername: true }).shape);

/** Admin Banner form (Figma 69:7, step 9) — only the two fields it owns. */
export const bannerFormSchema = profileSchema.pick({ bannerUrl: true, bannerFileId: true });
