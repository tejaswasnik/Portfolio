import { describe, expect, it, beforeEach, vi } from "vitest";

const CORE_ENV = {
  MONGODB_URI: "mongodb://localhost:27017/portfolio",
  JWT_SECRET: "a-very-secret-value-for-tests",
  ADMIN_EMAIL: "admin@example.com",
};

async function freshJwtModule() {
  vi.resetModules();
  for (const [key, value] of Object.entries(CORE_ENV)) vi.stubEnv(key, value);
  return import("./jwt.js");
}

describe("signSessionToken / verifySessionToken", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips sub and ver through a valid token", async () => {
    const { signSessionToken, verifySessionToken } = await freshJwtModule();
    const token = await signSessionToken({ sub: "user-1", ver: 3 });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ sub: "user-1", ver: 3 });
  });

  it("rejects a tampered token", async () => {
    const { signSessionToken, verifySessionToken } = await freshJwtModule();
    const token = await signSessionToken({ sub: "user-1", ver: 0 });
    const tampered = `${token.slice(0, -2)}xx`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const { signSessionToken } = await freshJwtModule();
    const token = await signSessionToken({ sub: "user-1", ver: 0 });

    vi.resetModules();
    for (const [key, value] of Object.entries(CORE_ENV)) vi.stubEnv(key, value);
    vi.stubEnv("JWT_SECRET", "a-completely-different-secret");
    const { verifySessionToken } = await import("./jwt.js");

    expect(await verifySessionToken(token)).toBeNull();
  });

  it("rejects an expired token", async () => {
    vi.resetModules();
    for (const [key, value] of Object.entries(CORE_ENV)) vi.stubEnv(key, value);
    const { SignJWT } = await import("jose");
    const { verifySessionToken } = await import("./jwt.js");

    const secret = new TextEncoder().encode(CORE_ENV.JWT_SECRET);
    const expired = await new SignJWT({ ver: 0 })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-1")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(secret);

    expect(await verifySessionToken(expired)).toBeNull();
  });

  it("rejects malformed input", async () => {
    const { verifySessionToken } = await freshJwtModule();
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
  });
});
