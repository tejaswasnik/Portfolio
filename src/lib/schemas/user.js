import { z } from "zod";

/** The admin login form, shared by client and POST /admin/login. */
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

/** The stored admin user document. Not exposed to any form directly. */
export const userSchema = z.object({
  email: z.string().trim().email(),
  passwordHash: z.string().min(1),
  failedAttempts: z.number().int().nonnegative().default(0),
  lockedUntil: z.date().nullable().default(null),
  tokenVersion: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
});

/**
 * Admin Settings' "Update password" form (step 10, Figma 71:7's "At
 * least 12 characters" copy, taken literally). `currentPassword` is
 * verified against the session user's real hash server-side, not by
 * this schema — it only checks shape and that the two new-password
 * fields match.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(12),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
