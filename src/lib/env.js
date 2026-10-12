import { z } from "zod";

const envSchema = z.object({
  // Core: the app cannot run at all without these (DB + admin auth).
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),

  // Feature-specific: each gates one integration (ImageKit uploads,
  // Gmail OAuth2 notifications, the GitHub heatmap, analytics hashing).
  // CLAUDE.md requires graceful fallbacks for GitHub, ImageKit and email
  // failures, so these default to "" instead of failing validation —
  // every consumer must check for a non-empty value itself before using
  // one (see src/lib/mail, src/lib/github, src/lib/rate-limit).
  IMAGEKIT_PUBLIC_KEY: z.string().default(""),
  IMAGEKIT_PRIVATE_KEY: z.string().default(""),
  IMAGEKIT_URL_ENDPOINT: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GOOGLE_REFRESH_TOKEN: z.string().default(""),
  GMAIL_USER: z.string().default(""),
  GITHUB_TOKEN: z.string().default(""),
  ANALYTICS_SALT: z.string().default(""),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

let cached;

/**
 * Validates and returns process.env against the app's required shape.
 * Lazy and cached so importing this module doesn't fail builds/tests
 * before .env.local is filled in — call getEnv() only where a value
 * is actually needed (e.g. inside the Mongo client or mail transport).
 * @returns {z.infer<typeof envSchema>}
 */
export function getEnv() {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${message}`);
  }

  cached = parsed.data;
  return cached;
}
