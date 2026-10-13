import { describe, expect, it } from "vitest";
import { getIconBySlug, searchIcons } from "./simpleIcons.js";

describe("getIconBySlug", () => {
  it("resolves a known slug to its path and hex", () => {
    const icon = getIconBySlug("javascript");
    expect(icon).not.toBeNull();
    expect(icon.slug).toBe("javascript");
    expect(icon.title).toBe("JavaScript");
    expect(typeof icon.path).toBe("string");
    expect(icon.path.length).toBeGreaterThan(0);
    expect(icon.hex).toMatch(/^[0-9A-F]{6}$/);
  });

  it("resolves every slug this project's migration maps to", () => {
    for (const slug of [
      "react",
      "nextdotjs",
      "nodedotjs",
      "mongodb",
      "tailwindcss",
      "html5",
      "css",
      "typescript",
      "postgresql",
      "git",
      "figma",
      "python",
    ]) {
      expect(getIconBySlug(slug), `expected a match for "${slug}"`).not.toBeNull();
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getIconBySlug("definitely-not-a-real-icon-slug")).toBeNull();
  });

  it("returns null for a missing/empty slug", () => {
    expect(getIconBySlug("")).toBeNull();
    expect(getIconBySlug(undefined)).toBeNull();
    expect(getIconBySlug(null)).toBeNull();
  });
});

describe("searchIcons", () => {
  it("matches by slug substring", () => {
    const results = searchIcons("react");
    expect(results.some((r) => r.slug === "react")).toBe(true);
  });

  it("matches by title substring, case-insensitively", () => {
    const results = searchIcons("JAVASCRIPT");
    expect(results.some((r) => r.slug === "javascript")).toBe(true);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchIcons("")).toEqual([]);
    expect(searchIcons("   ")).toEqual([]);
  });

  it("caps results at the given limit", () => {
    const results = searchIcons("a", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
});
