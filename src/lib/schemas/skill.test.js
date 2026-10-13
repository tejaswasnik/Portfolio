import { describe, expect, it } from "vitest";
import {
  iconLibraryValues,
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
    const result = skillSchema.safeParse({ name: "React", iconSlug: "react" });
    expect(result.success).toBe(true);
  });

  it("rejects a skill with no name", () => {
    const result = skillSchema.safeParse({ iconSlug: "react" });
    expect(result.success).toBe(false);
  });

  it("accepts a skill with no icon at all (falls back to a letter tile)", () => {
    const result = skillSchema.safeParse({ name: "React" });
    expect(result.success).toBe(true);
    expect(result.data.iconSlug).toBe("");
  });

  it("accepts a long slug like 'nextdotjs' or 'html5' — never capped at 3 characters", () => {
    expect(skillSchema.safeParse({ name: "Next.js", iconSlug: "nextdotjs" }).success).toBe(true);
    expect(skillSchema.safeParse({ name: "HTML", iconSlug: "html5" }).success).toBe(true);
  });

  it("accepts a slug up to 40 characters", () => {
    const slug = "a".repeat(40);
    expect(skillSchema.safeParse({ name: "X", iconSlug: slug }).success).toBe(true);
  });

  it("rejects a slug over 40 characters", () => {
    const slug = "a".repeat(41);
    expect(skillSchema.safeParse({ name: "X", iconSlug: slug }).success).toBe(false);
  });

  it("rejects uppercase letters and spaces in the slug", () => {
    expect(skillSchema.safeParse({ name: "X", iconSlug: "React" }).success).toBe(false);
    expect(skillSchema.safeParse({ name: "X", iconSlug: "re act" }).success).toBe(false);
  });

  it("accepts an optional iconUrl for a custom-uploaded icon", () => {
    const result = skillSchema.safeParse({
      name: "Custom",
      iconUrl: "https://ik.imagekit.io/demo/icon.svg",
    });
    expect(result.success).toBe(true);
  });

  it("defaults iconLibrary to simple-icons when omitted (pre-fix-2 data)", () => {
    const result = skillSchema.safeParse({ name: "React", iconSlug: "react" });
    expect(result.success).toBe(true);
    expect(result.data.iconLibrary).toBe("simple-icons");
  });

  it("accepts every supported icon library", () => {
    for (const library of iconLibraryValues) {
      const result = skillSchema.safeParse({ name: "X", iconLibrary: library, iconSlug: "x" });
      expect(result.success, `expected ${library} to be accepted`).toBe(true);
    }
  });

  it("rejects an unsupported icon library", () => {
    const result = skillSchema.safeParse({ name: "X", iconLibrary: "font-awesome" });
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
      iconSlug: "graphql",
      category: "Backend",
      visible: true,
      orderChoice: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts orderChoice: 'last'", () => {
    const result = skillFormSchema.safeParse({
      name: "GraphQL",
      iconSlug: "graphql",
      orderChoice: "last",
    });
    expect(result.success).toBe(true);
  });

  it("rejects orderChoice: 0", () => {
    const result = skillFormSchema.safeParse({ name: "GraphQL", iconSlug: "graphql", orderChoice: 0 });
    expect(result.success).toBe(false);
  });

  it("still requires a name", () => {
    const result = skillFormSchema.safeParse({ name: "", iconSlug: "graphql", orderChoice: "last" });
    expect(result.success).toBe(false);
  });
});

describe("skillUpdateFormSchema (Edit skill form)", () => {
  it("accepts a valid payload with an id", () => {
    const result = skillUpdateFormSchema.safeParse({
      name: "GraphQL",
      iconSlug: "graphql",
      orderChoice: "last",
      id: validId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing id", () => {
    const result = skillUpdateFormSchema.safeParse({
      name: "GraphQL",
      iconSlug: "graphql",
      orderChoice: "last",
    });
    expect(result.success).toBe(false);
  });
});
