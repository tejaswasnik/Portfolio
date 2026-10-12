import { describe, expect, it } from "vitest";
import { sectionSchema, sectionVisibleToggleSchema, sectionReorderSchema } from "./section.js";

const validId = "507f1f77bcf86cd799439011";

describe("sectionSchema", () => {
  it("accepts a valid section", () => {
    const result = sectionSchema.safeParse({
      key: "about",
      label: "About",
      visible: true,
      order: 2,
    });
    expect(result.success).toBe(true);
  });

  it("defaults visible to true when omitted", () => {
    const result = sectionSchema.safeParse({
      key: "projects",
      label: "Projects",
      order: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.visible).toBe(true);
  });

  it("rejects an unknown section key", () => {
    const result = sectionSchema.safeParse({
      key: "testimonials",
      label: "Testimonials",
      order: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("sectionVisibleToggleSchema (admin Sections quick toggle)", () => {
  it("accepts a valid id and boolean value", () => {
    expect(sectionVisibleToggleSchema.safeParse({ id: validId, value: false }).success).toBe(
      true,
    );
  });

  it("rejects a malformed id", () => {
    expect(sectionVisibleToggleSchema.safeParse({ id: "bad", value: true }).success).toBe(false);
  });
});

describe("sectionReorderSchema (admin Sections drag-to-reorder)", () => {
  it("accepts a non-empty array of valid ids", () => {
    expect(sectionReorderSchema.safeParse({ orderedIds: [validId] }).success).toBe(true);
  });

  it("rejects an empty array", () => {
    expect(sectionReorderSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });
});
