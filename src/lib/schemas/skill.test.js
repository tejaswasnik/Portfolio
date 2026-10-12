import { describe, expect, it } from "vitest";
import { skillSchema } from "./skill.js";

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
