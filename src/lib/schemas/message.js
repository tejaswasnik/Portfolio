import { z } from "zod";
import { objectIdStringSchema } from "./common.js";

/** Hidden form field name; a real submission must leave it empty. */
export const honeypotFieldName = "company";

/** Shared by the public contact form (client) and POST /api/contact (server). */
export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().max(160).default(""),
  message: z.string().trim().min(1).max(5000),
  [honeypotFieldName]: z.string().max(0).default(""),
});

/** The full stored message document; server-managed fields are not user input. */
export const messageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  subject: z.string().trim().default(""),
  message: z.string().trim().min(1),
  read: z.boolean().default(false),
  archived: z.boolean().default(false),
  emailFailed: z.boolean().default(false),
  ipHash: z.string().min(1),
  createdAt: z.date().optional(),
});

/** Admin inbox's id-only actions: delete, retry email. */
export const messageIdSchema = z.object({ id: objectIdStringSchema });

/** Admin inbox's read/archived quick toggles. */
export const messageToggleSchema = z.object({ id: objectIdStringSchema, value: z.boolean() });
