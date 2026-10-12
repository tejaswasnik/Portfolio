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
