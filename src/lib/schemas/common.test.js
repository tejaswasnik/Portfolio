import { describe, expect, it } from "vitest";
import { slugify, slugSchema } from "./common.js";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Field Notes")).toBe("field-notes");
  });

  it("collapses punctuation and repeated separators into one hyphen", () => {
    expect(slugify("Orbit — Analytics!!")).toBe("orbit-analytics");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("always produces a string that satisfies slugSchema for non-empty input", () => {
    expect(slugSchema.safeParse(slugify("Workspace 2.0")).success).toBe(true);
  });
});
