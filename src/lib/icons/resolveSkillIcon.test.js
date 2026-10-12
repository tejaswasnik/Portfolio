import { describe, expect, it } from "vitest";
import { resolveSkillIcon } from "./resolveSkillIcon.js";

describe("resolveSkillIcon", () => {
  it("prefers a custom iconUrl over a slug", () => {
    const result = resolveSkillIcon({
      name: "Custom",
      iconSlug: "react",
      iconUrl: "https://ik.imagekit.io/demo/icon.svg",
    });
    expect(result).toEqual({ url: "https://ik.imagekit.io/demo/icon.svg", name: "Custom" });
  });

  it("resolves a known slug to path+hex", () => {
    const result = resolveSkillIcon({ name: "JavaScript", iconSlug: "javascript" });
    expect(result.name).toBe("JavaScript");
    expect(typeof result.path).toBe("string");
    expect(result.hex).toMatch(/^[0-9A-F]{6}$/);
    expect(result.url).toBeUndefined();
  });

  it("falls back to just the name for an unknown/missing slug", () => {
    expect(resolveSkillIcon({ name: "Mystery Tech", iconSlug: "" })).toEqual({ name: "Mystery Tech" });
    expect(resolveSkillIcon({ name: "Mystery Tech", iconSlug: "not-a-real-slug" })).toEqual({
      name: "Mystery Tech",
    });
    expect(resolveSkillIcon({ name: "Mystery Tech" })).toEqual({ name: "Mystery Tech" });
  });
});
