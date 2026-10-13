import { describe, expect, it } from "vitest";
import { getRemixIcon, searchRemixIcons } from "./remixIcons.js";

describe("getRemixIcon", () => {
  it("resolves a known icon to its path data", () => {
    const icon = getRemixIcon("code-s-slash-line");
    expect(icon).not.toBeNull();
    expect(icon.slug).toBe("code-s-slash-line");
    expect(icon.title).toBe("Code S Slash");
    expect(icon.category).toBe("Development");
    expect(typeof icon.path).toBe("string");
    expect(icon.path.length).toBeGreaterThan(0);
  });

  it("returns null for an unknown or missing slug", () => {
    expect(getRemixIcon("not-a-real-icon")).toBeNull();
    expect(getRemixIcon("")).toBeNull();
    expect(getRemixIcon(undefined)).toBeNull();
  });
});

describe("searchRemixIcons", () => {
  it("matches by slug substring", () => {
    expect(searchRemixIcons("code-s-slash").some((r) => r.slug === "code-s-slash-line")).toBe(
      true,
    );
  });

  it("matches by category", () => {
    expect(searchRemixIcons("development").length).toBeGreaterThan(0);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchRemixIcons("")).toEqual([]);
  });

  it("caps results at the given limit", () => {
    expect(searchRemixIcons("a", 5).length).toBeLessThanOrEqual(5);
  });
});
