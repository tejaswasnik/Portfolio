import { describe, expect, it } from "vitest";
import { mediaIdSchema, mediaSchema, mediaUploadSchema } from "./media.js";

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

  it("rejects a size over the 10 MB ceiling (SEC-04)", () => {
    const result = mediaSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/huge.png",
      name: "huge.png",
      type: "image/png",
      size: 10 * 1024 * 1024 + 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a MIME type outside the app's allowlist (SEC-04)", () => {
    const result = mediaSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/script.sh",
      name: "script.sh",
      type: "application/x-sh",
      size: 1024,
    });
    expect(result.success).toBe(false);
  });
});

describe("mediaUploadSchema", () => {
  it("accepts an upload record without usedIn or createdAt", () => {
    const result = mediaUploadSchema.safeParse({
      fileId: "fk_123",
      url: "https://ik.imagekit.io/demo/cover.png",
      name: "cover.png",
      type: "image/png",
      size: 2048,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing fileId", () => {
    const result = mediaUploadSchema.safeParse({
      url: "https://ik.imagekit.io/demo/cover.png",
      name: "cover.png",
      type: "image/png",
      size: 2048,
    });
    expect(result.success).toBe(false);
  });
});

describe("mediaIdSchema", () => {
  it("accepts a 24-char hex id", () => {
    expect(mediaIdSchema.safeParse({ id: "a".repeat(24) }).success).toBe(true);
  });

  it("rejects a non-ObjectId id", () => {
    expect(mediaIdSchema.safeParse({ id: "not-an-id" }).success).toBe(false);
  });
});
