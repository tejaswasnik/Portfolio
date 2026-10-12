import { describe, expect, it } from "vitest";
import { buildPublicProjectFilter } from "./projects.js";

/** Mimics Mongo's equality-only matching for these simple filters. */
function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => doc[key] === value);
}

describe("project visibility rules (docs/PRD.md / CLAUDE.md hard rules)", () => {
  const publishedFeatured = { published: true, featured: true };
  const publishedNotFeatured = { published: true, featured: false };
  const unpublishedFeatured = { published: false, featured: true };

  it("published + featured shows on both the home page and /projects", () => {
    expect(matches(publishedFeatured, buildPublicProjectFilter({ featuredOnly: true }))).toBe(true);
    expect(matches(publishedFeatured, buildPublicProjectFilter())).toBe(true);
  });

  it("published + not featured shows on /projects but not the home page", () => {
    expect(matches(publishedNotFeatured, buildPublicProjectFilter({ featuredOnly: true }))).toBe(false);
    expect(matches(publishedNotFeatured, buildPublicProjectFilter())).toBe(true);
  });

  it("unpublished never shows, regardless of featured", () => {
    expect(matches(unpublishedFeatured, buildPublicProjectFilter({ featuredOnly: true }))).toBe(false);
    expect(matches(unpublishedFeatured, buildPublicProjectFilter())).toBe(false);
  });
});
