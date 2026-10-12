import { z } from "zod";
import { optionalUrlSchema } from "./common.js";

export const siteSettingsSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  ogImage: optionalUrlSchema.default(""),
  favicon: optionalUrlSchema.default(""),
  notificationEmail: z.string().trim().email(),
  maintenanceMode: z.boolean().default(false),
  footerText: z.string().trim().min(1),
  githubUsername: z.string().trim().default(""),
});

/**
 * Admin Settings form (step 10, Figma 71:7). Only the fields this
 * screen's "Save settings" actually owns: `footerText`/`githubUsername`
 * belong to the Profile & About screen (step 8/9) and `maintenanceMode`
 * is its own instant-apply toggle here, same as the Profile & About
 * form omitting `bannerUrl`/`bannerFileId` — see docs/DECISIONS.md step
 * 10 for why each field has exactly one writer. `adminEmail` isn't a
 * `siteSettings` field at all; it's `users.email`, picked up by the same
 * bundled save since Figma draws it in this screen.
 */
export const settingsFormSchema = siteSettingsSchema
  .pick({ title: true, description: true, ogImage: true, favicon: true, notificationEmail: true })
  .extend({ adminEmail: z.string().trim().email() });

/** Admin Settings' maintenance-mode toggle (its own instant action). */
export const maintenanceToggleSchema = z.object({ value: z.boolean() });
