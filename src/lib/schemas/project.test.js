import { describe, expect, it } from "vitest";
import {
  projectSchema,
  projectToggleSchema,
  projectIdSchema,
  projectReorderSchema,
  projectFormSchema,
  projectUpdateFormSchema,
} from "./project.js";

const validId = "507f1f77bcf86cd799439011";

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

describe("projectToggleSchema (admin list quick featured/published toggles)", () => {
  it("accepts a valid id and boolean value", () => {
    expect(projectToggleSchema.safeParse({ id: validId, value: true }).success).toBe(true);
  });

  it("rejects a malformed id", () => {
    expect(projectToggleSchema.safeParse({ id: "not-an-id", value: true }).success).toBe(false);
  });

  it("rejects a non-boolean value", () => {
    expect(projectToggleSchema.safeParse({ id: validId, value: "true" }).success).toBe(false);
  });
});

describe("projectIdSchema (admin list delete action)", () => {
  it("accepts a valid id", () => {
    expect(projectIdSchema.safeParse({ id: validId }).success).toBe(true);
  });

  it("rejects a malformed id", () => {
    expect(projectIdSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});

describe("projectReorderSchema (admin list drag-to-reorder)", () => {
  it("accepts a non-empty array of valid ids", () => {
    expect(
      projectReorderSchema.safeParse({ orderedIds: [validId, validId] }).success,
    ).toBe(true);
  });

  it("rejects an empty array", () => {
    expect(projectReorderSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });

  it("rejects an array containing a malformed id", () => {
    expect(
      projectReorderSchema.safeParse({ orderedIds: [validId, "bad-id"] }).success,
    ).toBe(false);
  });
});

describe("projectFormSchema (New/Edit project form)", () => {
  const { order: _order, ...validWithoutOrder } = valid;

  it("accepts a valid form payload with a numeric orderChoice", () => {
    const result = projectFormSchema.safeParse({ ...validWithoutOrder, orderChoice: 2 });
    expect(result.success).toBe(true);
  });

  it("accepts orderChoice: 'last'", () => {
    const result = projectFormSchema.safeParse({ ...validWithoutOrder, orderChoice: "last" });
    expect(result.success).toBe(true);
  });

  it("rejects orderChoice: 0 (positions are 1-based)", () => {
    const result = projectFormSchema.safeParse({ ...validWithoutOrder, orderChoice: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects an arbitrary orderChoice string", () => {
    const result = projectFormSchema.safeParse({ ...validWithoutOrder, orderChoice: "first" });
    expect(result.success).toBe(false);
  });

  it("still enforces the underlying project fields (e.g. a valid slug)", () => {
    const result = projectFormSchema.safeParse({
      ...validWithoutOrder,
      slug: "Not A Slug",
      orderChoice: "last",
    });
    expect(result.success).toBe(false);
  });
});

describe("projectUpdateFormSchema (Edit project form)", () => {
  const { order: _order, ...validWithoutOrder } = valid;

  it("accepts a valid payload with an id", () => {
    const result = projectUpdateFormSchema.safeParse({
      ...validWithoutOrder,
      orderChoice: "last",
      id: validId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing id", () => {
    const result = projectUpdateFormSchema.safeParse({
      ...validWithoutOrder,
      orderChoice: "last",
    });
    expect(result.success).toBe(false);
  });
});
