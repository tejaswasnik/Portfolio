import { describe, expect, it } from "vitest";
import { mediaSchema } from "./media.js";

describe("mediaSchema", () => {
  it("accepts a valid media document", () => {
    const result = mediaSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/banner.gif",
      name: "banner.gif",
      type: "image/gif",
      size: 1024,
      usedIn: ["banner"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid usedIn value", () => {
    const result = mediaSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/banner.gif",
      name: "banner.gif",
      type: "image/gif",
      size: 1024,
      usedIn: ["unknown-usage"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative size", () => {
    const result = mediaSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/banner.gif",
      name: "banner.gif",
      type: "image/gif",
      size: -1,
    });
    expect(result.success).toBe(false);
  });
});
