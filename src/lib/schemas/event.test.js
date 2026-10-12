import { describe, expect, it } from "vitest";
import { eventSchema, trackEventInputSchema } from "./event.js";

describe("eventSchema", () => {
  it("accepts a valid view event", () => {
    const result = eventSchema.safeParse({
      type: "view",
      path: "/",
      visitorHash: "hash123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown type", () => {
    const result = eventSchema.safeParse({
      type: "scroll",
      path: "/",
      visitorHash: "hash123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing visitorHash", () => {
    const result = eventSchema.safeParse({ type: "click", path: "/" });
    expect(result.success).toBe(false);
  });
});

describe("trackEventInputSchema (POST /api/track body)", () => {
  it("accepts a minimal view beacon", () => {
    expect(trackEventInputSchema.safeParse({ type: "view", path: "/" }).success).toBe(true);
  });

  it("defaults target/referrer to empty strings", () => {
    const result = trackEventInputSchema.safeParse({ type: "view", path: "/" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.target).toBe("");
      expect(result.data.referrer).toBe("");
    }
  });

  it("rejects a missing path", () => {
    expect(trackEventInputSchema.safeParse({ type: "view" }).success).toBe(false);
  });
});
