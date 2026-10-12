import { describe, expect, it } from "vitest";
import { projectSchema } from "./project.js";

const valid = {
  name: "Fieldnote",
  slug: "fieldnote",
  shortDescription: "A minimal note-taking app.",
  longDescription: "## Fieldnote\n\nDetails here.",
  coverImage: "https://ik.imagekit.io/demo/fieldnote-cover.png",
  screenshots: ["https://ik.imagekit.io/demo/shot1.png"],
  liveUrl: "https://fieldnote.example.com",
  githubUrl: "https://github.com/example/fieldnote",
  techIds: ["react", "mongodb"],
  status: "ongoing",
  featured: true,
  published: true,
  order: 1,
};

describe("projectSchema", () => {
  it("accepts a fully valid project", () => {
    const result = projectSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts minimal required fields with defaults applied", () => {
    const result = projectSchema.safeParse({
      name: "Workspace",
      slug: "workspace",
      shortDescription: "A focused workspace.",
      longDescription: "Details.",
      status: "completed",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.featured).toBe(false);
      expect(result.data.published).toBe(false);
      expect(result.data.screenshots).toEqual([]);
    }
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = projectSchema.safeParse({ ...valid, slug: "Not A Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status value", () => {
    const result = projectSchema.safeParse({ ...valid, status: "archived" });
    expect(result.success).toBe(false);
  });

  it("rejects a shortDescription over 160 characters", () => {
    const result = projectSchema.safeParse({
      ...valid,
      shortDescription: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-url liveUrl", () => {
    const result = projectSchema.safeParse({ ...valid, liveUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("allows an empty string for liveUrl/githubUrl (not set yet)", () => {
    const result = projectSchema.safeParse({
      ...valid,
      liveUrl: "",
      githubUrl: "",
    });
    expect(result.success).toBe(true);
  });
});
