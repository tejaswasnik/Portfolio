import { describe, expect, it } from "vitest";
import { getLucideIcon, searchLucideIcons } from "./lucideIcons.js";

describe("getLucideIcon", () => {
  it("resolves a known icon to its stroke nodes", () => {
    const icon = getLucideIcon("house");
    expect(icon).not.toBeNull();
    expect(icon.slug).toBe("house");
    expect(icon.title).toBe("House");
    expect(Array.isArray(icon.nodes)).toBe(true);
    expect(icon.nodes.length).toBeGreaterThan(0);
    // Each node is [tagName, attrs] — e.g. ["path", { d: "..." }].
    const [tag, attrs] = icon.nodes[0];
    expect(typeof tag).toBe("string");
    expect(typeof attrs).toBe("object");
  });

  it("returns null for an unknown or missing slug", () => {
    expect(getLucideIcon("not-a-real-icon")).toBeNull();
    expect(getLucideIcon("")).toBeNull();
    expect(getLucideIcon(undefined)).toBeNull();
  });
});

describe("searchLucideIcons", () => {
  it("matches by icon slug", () => {
    expect(searchLucideIcons("house").some((r) => r.slug === "house")).toBe(true);
  });

  it("matches by synonym tag, not just the literal name", () => {
    // "home" is a tag on "house", not a substring of the slug itself.
    expect(searchLucideIcons("home").some((r) => r.slug === "house")).toBe(true);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchLucideIcons("")).toEqual([]);
  });

  it("caps results at the given limit", () => {
    expect(searchLucideIcons("a", 5).length).toBeLessThanOrEqual(5);
  });
});
