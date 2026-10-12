import { describe, expect, it } from "vitest";
import { annotateMediaUsage, computeFileUsage, filterMediaList } from "./usage.js";

describe("computeFileUsage", () => {
  const context = {
    profile: {
      bannerUrl: "https://ik/banner.gif",
      photoUrl: "https://ik/photo.jpg",
      resumeUrl: "https://ik/resume.pdf",
    },
    siteSettings: { ogImage: "https://ik/og.png", favicon: "https://ik/favicon.png" },
    projects: [
      { name: "Workspace", coverImage: "https://ik/workspace-cover.png", screenshots: ["https://ik/workspace-01.png"] },
    ],
  };

  it("returns an empty array for an unreferenced url", () => {
    expect(computeFileUsage("https://ik/old-banner.gif", context)).toEqual([]);
  });

  it("returns an empty array for a blank url", () => {
    expect(computeFileUsage("", context)).toEqual([]);
  });

  it("matches the profile banner", () => {
    expect(computeFileUsage("https://ik/banner.gif", context)).toEqual([
      { category: "banner", label: "Banner" },
    ]);
  });

  it("matches the profile photo, resume, OG image and favicon", () => {
    expect(computeFileUsage("https://ik/photo.jpg", context)).toEqual([
      { category: "profile", label: "Profile photo" },
    ]);
    expect(computeFileUsage("https://ik/resume.pdf", context)).toEqual([
      { category: "resume", label: "Resume" },
    ]);
    expect(computeFileUsage("https://ik/og.png", context)).toEqual([
      { category: "profile", label: "OG image" },
    ]);
    expect(computeFileUsage("https://ik/favicon.png", context)).toEqual([
      { category: "profile", label: "Favicon" },
    ]);
  });

  it("matches a project cover and screenshot by name", () => {
    expect(computeFileUsage("https://ik/workspace-cover.png", context)).toEqual([
      { category: "projects", label: "Workspace · Cover" },
    ]);
    expect(computeFileUsage("https://ik/workspace-01.png", context)).toEqual([
      { category: "projects", label: "Workspace · Screenshot" },
    ]);
  });

  it("returns every match when a url is reused in more than one place", () => {
    const reused = {
      profile: { bannerUrl: "https://ik/shared.png" },
      projects: [{ name: "Orbit", coverImage: "https://ik/shared.png" }],
    };
    expect(computeFileUsage("https://ik/shared.png", reused)).toEqual([
      { category: "banner", label: "Banner" },
      { category: "projects", label: "Orbit · Cover" },
    ]);
  });

  it("tolerates missing profile/siteSettings/projects", () => {
    expect(computeFileUsage("https://ik/anything.png", {})).toEqual([]);
    expect(computeFileUsage("https://ik/anything.png")).toEqual([]);
  });
});

describe("annotateMediaUsage / filterMediaList", () => {
  const context = {
    profile: { bannerUrl: "https://ik/banner.gif" },
    projects: [{ name: "Workspace", coverImage: "https://ik/cover.png" }],
  };
  const media = [
    { name: "banner.gif", url: "https://ik/banner.gif" },
    { name: "cover.png", url: "https://ik/cover.png" },
    { name: "old-banner.gif", url: "https://ik/old-banner.gif" },
  ];

  it("annotates each file with its computed usage", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(annotated.map((f) => f.usage.length)).toEqual([1, 1, 0]);
  });

  it("filters to a category", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(filterMediaList(annotated, { category: "banner" }).map((f) => f.name)).toEqual([
      "banner.gif",
    ]);
    expect(filterMediaList(annotated, { category: "projects" }).map((f) => f.name)).toEqual([
      "cover.png",
    ]);
  });

  it("filters to unused files", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(filterMediaList(annotated, { category: "unused" }).map((f) => f.name)).toEqual([
      "old-banner.gif",
    ]);
  });

  it("'all' (or no category) returns everything", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(filterMediaList(annotated)).toHaveLength(3);
    expect(filterMediaList(annotated, { category: "all" })).toHaveLength(3);
  });

  it("filters by case-insensitive search text", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(filterMediaList(annotated, { search: "BANNER" }).map((f) => f.name)).toEqual([
      "banner.gif",
      "old-banner.gif",
    ]);
  });

  it("combines category and search (AND, not OR)", () => {
    const annotated = annotateMediaUsage(media, context);
    expect(
      filterMediaList(annotated, { category: "unused", search: "banner" }).map((f) => f.name),
    ).toEqual(["old-banner.gif"]);
  });
});
