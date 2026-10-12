import { z } from "zod";

/** 24-character hex string, as produced by MongoDB ObjectId#toString(). */
export const objectIdStringSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

/** Lowercase, hyphen-separated slug (e.g. "my-project"). */
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

/** A URL, or an empty string for "not set yet" (common in optional image/link fields). */
export const optionalUrlSchema = z.union([z.string().url(), z.literal("")]);

/**
 * Derives a `slugSchema`-valid slug from free text (admin forms auto-fill
 * the slug field from the name until the admin edits it directly).
 * @param {string} text
 */
export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
