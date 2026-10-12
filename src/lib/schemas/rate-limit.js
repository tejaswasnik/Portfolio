import { z } from "zod";

/** A hashed-key rate-limit counter; expiresAt drives the TTL index. */
export const rateLimitSchema = z.object({
  key: z.string().min(1),
  count: z.number().int().nonnegative(),
  expiresAt: z.date(),
});
