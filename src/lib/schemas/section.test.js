import { describe, expect, it } from "vitest";
import { sectionSchema } from "./section.js";

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
