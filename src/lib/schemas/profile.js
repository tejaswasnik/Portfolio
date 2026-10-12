import { z } from "zod";
import { optionalUrlSchema } from "./common.js";

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
