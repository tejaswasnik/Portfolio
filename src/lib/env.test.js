import { describe, expect, it, beforeEach, vi } from "vitest";

const validEnv = {
  MONGODB_URI: "mongodb://localhost:27017/portfolio",
  JWT_SECRET: "a-very-secret-value",
  ADMIN_EMAIL: "admin@example.com",
  IMAGEKIT_PUBLIC_KEY: "public_key",
  IMAGEKIT_PRIVATE_KEY: "private_key",
  IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/demo",
  GOOGLE_CLIENT_ID: "client-id",
  GOOGLE_CLIENT_SECRET: "client-secret",
  GOOGLE_REFRESH_TOKEN: "refresh-token",
  GMAIL_USER: "owner@gmail.com",
  GITHUB_TOKEN: "ghp_test",
  ANALYTICS_SALT: "salt-value",
};

describe("getEnv", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns parsed env when every required variable is present", async () => {
    for (const [key, value] of Object.entries(validEnv)) {
      vi.stubEnv(key, value);
    }
    const { getEnv } = await import("./env.js");
    const env = getEnv();
    expect(env.ADMIN_EMAIL).toBe("admin@example.com");
    expect(env.NODE_ENV).toBe("test");
  });

  it("throws a descriptive error when a required variable is missing", async () => {
    for (const [key, value] of Object.entries(validEnv)) {
      if (key === "MONGODB_URI") continue;
      vi.stubEnv(key, value);
    }
    vi.stubEnv("MONGODB_URI", "");
    const { getEnv } = await import("./env.js");
    expect(() => getEnv()).toThrowError(/MONGODB_URI/);
  });

  it("rejects an invalid email for ADMIN_EMAIL", async () => {
    for (const [key, value] of Object.entries(validEnv)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv("ADMIN_EMAIL", "not-an-email");
    const { getEnv } = await import("./env.js");
    expect(() => getEnv()).toThrowError(/ADMIN_EMAIL/);
  });

  it("succeeds with only the core variables set, leaving feature-specific ones empty", async () => {
    vi.stubEnv("MONGODB_URI", validEnv.MONGODB_URI);
    vi.stubEnv("JWT_SECRET", validEnv.JWT_SECRET);
    vi.stubEnv("ADMIN_EMAIL", validEnv.ADMIN_EMAIL);
    const { getEnv } = await import("./env.js");
    const env = getEnv();
    expect(env.GOOGLE_CLIENT_ID).toBe("");
    expect(env.GITHUB_TOKEN).toBe("");
    expect(env.ANALYTICS_SALT).toBe("");
  });
});
