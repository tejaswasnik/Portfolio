import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1),
  IMAGEKIT_URL_ENDPOINT: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GMAIL_USER: z.string().email(),
  GITHUB_TOKEN: z.string().min(1),
  ANALYTICS_SALT: z.string().min(1),
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
