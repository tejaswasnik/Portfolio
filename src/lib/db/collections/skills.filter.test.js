import { describe, expect, it } from "vitest";
import { filterAdminSkills } from "./skills.js";

describe("filterAdminSkills (admin /admin/skills toolbar filters)", () => {
  const skills = [
    { name: "TypeScript", category: "Languages" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
  ];

  it("returns every skill when no filters are given", () => {
    expect(filterAdminSkills(skills)).toHaveLength(4);
    expect(filterAdminSkills(skills, {})).toHaveLength(4);
  });

  it("narrows by search text, case-insensitively", () => {
    expect(filterAdminSkills(skills, { search: "type" }).map((s) => s.name)).toEqual([
      "TypeScript",
    ]);
    expect(filterAdminSkills(skills, { search: "NEXT" }).map((s) => s.name)).toEqual(["Next.js"]);
  });

  it("narrows by category, ignoring 'all'", () => {
    expect(filterAdminSkills(skills, { category: "Frontend" }).map((s) => s.name)).toEqual([
      "React",
      "Next.js",
    ]);
    expect(filterAdminSkills(skills, { category: "all" })).toHaveLength(4);
  });

  it("combines search and category (AND, not OR)", () => {
    const result = filterAdminSkills(skills, { search: "next", category: "Frontend" });
    expect(result.map((s) => s.name)).toEqual(["Next.js"]);
  });

  it("an unknown category yields an empty list rather than ignoring the filter", () => {
    expect(filterAdminSkills(skills, { category: "Database" })).toHaveLength(0);
  });
});
