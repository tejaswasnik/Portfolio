import { describe, expect, it } from "vitest";
import { isMaintenanceModeOn, resolveSiteMeta } from "./site-meta.js";

describe("resolveSiteMeta", () => {
  it("falls back to defaults when siteSettings is null (unseeded DB)", () => {
    expect(resolveSiteMeta(null)).toEqual({
      title: "Tejas Wasnik",
      description: "Portfolio",
      ogImage: undefined,
      favicon: undefined,
    });
  });

  it("uses siteSettings fields when present", () => {
    expect(
      resolveSiteMeta({
        title: "Custom title",
        description: "Custom description",
        ogImage: "https://ik.imagekit.io/demo/og.png",
        favicon: "https://ik.imagekit.io/demo/favicon.png",
      }),
    ).toEqual({
      title: "Custom title",
      description: "Custom description",
      ogImage: "https://ik.imagekit.io/demo/og.png",
      favicon: "https://ik.imagekit.io/demo/favicon.png",
    });
  });

  it("treats blank strings as unset", () => {
    expect(
      resolveSiteMeta({ title: "", description: "", ogImage: "", favicon: "" }),
    ).toEqual({
      title: "Tejas Wasnik",
      description: "Portfolio",
      ogImage: undefined,
      favicon: undefined,
    });
  });
});

describe("isMaintenanceModeOn", () => {
  it("is false when siteSettings is null", () => {
    expect(isMaintenanceModeOn(null)).toBe(false);
  });

  it("is false when maintenanceMode is false or unset", () => {
    expect(isMaintenanceModeOn({})).toBe(false);
    expect(isMaintenanceModeOn({ maintenanceMode: false })).toBe(false);
  });

  it("is true when maintenanceMode is true", () => {
    expect(isMaintenanceModeOn({ maintenanceMode: true })).toBe(true);
  });
});
