import { describe, expect, it } from "vitest";
import { rateLimitSchema } from "./rate-limit.js";

describe("rateLimitSchema", () => {
  it("accepts a valid rate limit document", () => {
    const result = rateLimitSchema.safeParse({
      key: "hashed-ip-abc",
      count: 2,
      expiresAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a negative count", () => {
    const result = rateLimitSchema.safeParse({
      key: "hashed-ip-abc",
      count: -1,
      expiresAt: new Date(),
    });
    expect(result.success).toBe(false);
  });
});
