import { describe, expect, it } from "vitest";
import {
  skillSchema,
  skillVisibleToggleSchema,
  skillIdSchema,
  skillReorderSchema,
  skillFormSchema,
  skillUpdateFormSchema,
} from "./skill.js";

const validId = "507f1f77bcf86cd799439011";

describe("skillSchema", () => {
  it("accepts a valid skill", () => {
    const result = skillSchema.safeParse({ name: "React", icon: "react" });
    expect(result.success).toBe(true);
  });

  it("rejects a skill with no name", () => {
    const result = skillSchema.safeParse({ icon: "react" });
    expect(result.success).toBe(false);
  });

  it("rejects a skill with no icon", () => {
    const result = skillSchema.safeParse({ name: "React" });
    expect(result.success).toBe(false);
  });
});

describe("skillVisibleToggleSchema (admin list quick show/hide toggle)", () => {
  it("accepts a valid id and boolean value", () => {
    expect(skillVisibleToggleSchema.safeParse({ id: validId, value: true }).success).toBe(true);
  });

  it("rejects a malformed id", () => {
    expect(skillVisibleToggleSchema.safeParse({ id: "bad", value: true }).success).toBe(false);
  });
});

describe("skillIdSchema (admin list delete action)", () => {
  it("accepts a valid id", () => {
    expect(skillIdSchema.safeParse({ id: validId }).success).toBe(true);
  });

  it("rejects a malformed id", () => {
    expect(skillIdSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});

describe("skillReorderSchema (admin list drag-to-reorder)", () => {
  it("accepts a non-empty array of valid ids", () => {
    expect(skillReorderSchema.safeParse({ orderedIds: [validId] }).success).toBe(true);
  });

  it("rejects an empty array", () => {
    expect(skillReorderSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });
});

describe("skillFormSchema (Add/Edit skill form)", () => {
  it("accepts a valid payload with a numeric orderChoice", () => {
    const result = skillFormSchema.safeParse({
      name: "GraphQL",
      icon: "Gq",
      category: "Backend",
      visible: true,
      orderChoice: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts orderChoice: 'last'", () => {
    const result = skillFormSchema.safeParse({
      name: "GraphQL",
      icon: "Gq",
      orderChoice: "last",
    });
    expect(result.success).toBe(true);
  });

  it("rejects orderChoice: 0", () => {
    const result = skillFormSchema.safeParse({ name: "GraphQL", icon: "Gq", orderChoice: 0 });
    expect(result.success).toBe(false);
  });

  it("still enforces the underlying skill fields (e.g. a non-empty icon)", () => {
    const result = skillFormSchema.safeParse({ name: "GraphQL", icon: "", orderChoice: "last" });
    expect(result.success).toBe(false);
  });
});

describe("skillUpdateFormSchema (Edit skill form)", () => {
  it("accepts a valid payload with an id", () => {
    const result = skillUpdateFormSchema.safeParse({
      name: "GraphQL",
      icon: "Gq",
      orderChoice: "last",
      id: validId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing id", () => {
    const result = skillUpdateFormSchema.safeParse({
      name: "GraphQL",
      icon: "Gq",
      orderChoice: "last",
    });
    expect(result.success).toBe(false);
  });
});
