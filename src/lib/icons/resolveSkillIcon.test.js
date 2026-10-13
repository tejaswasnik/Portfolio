import { describe, expect, it } from "vitest";
import { ICON_LIBRARIES, resolveSkillIcon, searchIconLibrary } from "./resolveSkillIcon.js";

describe("resolveSkillIcon", () => {
  it("prefers a custom iconUrl over a slug", () => {
    const result = resolveSkillIcon({
      name: "Custom",
      iconSlug: "react",
      iconUrl: "https://ik.imagekit.io/demo/icon.svg",
    });
    expect(result).toEqual({ url: "https://ik.imagekit.io/demo/icon.svg", name: "Custom" });
  });

  it("defaults to simple-icons when iconLibrary is omitted (pre-fix-2 data)", () => {
    const result = resolveSkillIcon({ name: "JavaScript", iconSlug: "javascript" });
    expect(result.name).toBe("JavaScript");
    expect(typeof result.path).toBe("string");
    expect(result.hex).toMatch(/^[0-9A-F]{6}$/);
    expect(result.url).toBeUndefined();
    expect(result.nodes).toBeUndefined();
  });

  it("resolves a simple-icons slug explicitly", () => {
    const result = resolveSkillIcon({ name: "React", iconLibrary: "simple-icons", iconSlug: "react" });
    expect(typeof result.path).toBe("string");
    expect(typeof result.hex).toBe("string");
  });

  it("resolves a lucide slug to stroke nodes, not a filled path", () => {
    const result = resolveSkillIcon({ name: "Home", iconLibrary: "lucide", iconSlug: "house" });
    expect(result.name).toBe("Home");
    expect(Array.isArray(result.nodes)).toBe(true);
    expect(result.path).toBeUndefined();
  });

  it("resolves a remixicon slug to a filled path with no brand hex", () => {
    const result = resolveSkillIcon({
      name: "Code",
      iconLibrary: "remixicon",
      iconSlug: "code-s-slash-line",
    });
    expect(typeof result.path).toBe("string");
    expect(result.hex).toBeUndefined();
  });

  it("falls back to just the name for an unknown/missing slug", () => {
    expect(resolveSkillIcon({ name: "Mystery Tech", iconSlug: "" })).toEqual({ name: "Mystery Tech" });
    expect(resolveSkillIcon({ name: "Mystery Tech", iconSlug: "not-a-real-slug" })).toEqual({
      name: "Mystery Tech",
    });
    expect(resolveSkillIcon({ name: "Mystery Tech" })).toEqual({ name: "Mystery Tech" });
    expect(
      resolveSkillIcon({ name: "Mystery Tech", iconLibrary: "lucide", iconSlug: "not-a-real-icon" }),
    ).toEqual({ name: "Mystery Tech" });
  });
});

describe("searchIconLibrary", () => {
  it("routes to the right library's search function", () => {
    expect(searchIconLibrary("simple-icons", "react").some((r) => r.slug === "react")).toBe(true);
    expect(searchIconLibrary("lucide", "house").some((r) => r.slug === "house")).toBe(true);
    expect(
      searchIconLibrary("remixicon", "code-s-slash").some((r) => r.slug === "code-s-slash-line"),
    ).toBe(true);
  });

  it("defaults to simple-icons for an unrecognized library value", () => {
    expect(searchIconLibrary("not-a-library", "react").some((r) => r.slug === "react")).toBe(true);
  });
});

describe("ICON_LIBRARIES", () => {
  it("lists exactly the three libraries resolveSkillIcon/searchIconLibrary support", () => {
    expect(ICON_LIBRARIES.map((l) => l.value)).toEqual(["simple-icons", "lucide", "remixicon"]);
  });
});
