import { describe, expect, it } from "vitest";
import { buildPublicProjectFilter } from "./projects.js";

describe("buildPublicProjectFilter", () => {
  it("defaults to published-only (for /projects: featured and non-featured both show)", () => {
    expect(buildPublicProjectFilter()).toEqual({ published: true });
  });

  it("featuredOnly adds featured:true, for the home page", () => {
    expect(buildPublicProjectFilter({ featuredOnly: true })).toEqual({
      published: true,
      featured: true,
    });
  });

  it("featuredOnly:false is equivalent to the default (/projects shows all published)", () => {
    expect(buildPublicProjectFilter({ featuredOnly: false })).toEqual({
      published: true,
    });
  });

  it("never omits published:true, even for the home page", () => {
    const filter = buildPublicProjectFilter({ featuredOnly: true });
    expect(filter.published).toBe(true);
  });
});
