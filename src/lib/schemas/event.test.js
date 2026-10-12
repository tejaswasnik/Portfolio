import { describe, expect, it } from "vitest";
import { eventSchema } from "./event.js";

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
