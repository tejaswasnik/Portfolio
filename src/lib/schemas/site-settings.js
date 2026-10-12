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
