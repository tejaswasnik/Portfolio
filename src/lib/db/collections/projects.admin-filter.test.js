import { describe, expect, it } from "vitest";
import { filterAdminProjects } from "./projects.js";

describe("filterAdminProjects (admin /admin/projects toolbar filters)", () => {
  const projects = [
    { name: "Workspace", slug: "workspace", status: "ongoing", featured: true, published: true },
    { name: "Fieldnote", slug: "fieldnote", status: "completed", featured: true, published: true },
    { name: "Orbit Analytics", slug: "orbit-analytics", status: "ongoing", featured: false, published: true },
    { name: "Ledger Lite", slug: "ledger-lite", status: "ongoing", featured: false, published: false },
  ];

  it("returns every project when no filters are given", () => {
    expect(filterAdminProjects(projects)).toHaveLength(4);
    expect(filterAdminProjects(projects, {})).toHaveLength(4);
  });

  it("narrows by search text, matching name or slug case-insensitively", () => {
    expect(filterAdminProjects(projects, { search: "work" }).map((p) => p.name)).toEqual([
      "Workspace",
    ]);
    expect(filterAdminProjects(projects, { search: "ORBIT" }).map((p) => p.name)).toEqual([
      "Orbit Analytics",
    ]);
  });

  it("narrows by status, ignoring 'all'", () => {
    expect(filterAdminProjects(projects, { status: "completed" }).map((p) => p.name)).toEqual([
      "Fieldnote",
    ]);
    expect(filterAdminProjects(projects, { status: "all" })).toHaveLength(4);
  });

  it("narrows by featured/not-featured, ignoring 'any'", () => {
    expect(filterAdminProjects(projects, { featured: "featured" }).map((p) => p.name)).toEqual([
      "Workspace",
      "Fieldnote",
    ]);
    expect(filterAdminProjects(projects, { featured: "not-featured" }).map((p) => p.name)).toEqual([
      "Orbit Analytics",
      "Ledger Lite",
    ]);
    expect(filterAdminProjects(projects, { featured: "any" })).toHaveLength(4);
  });

  it("narrows by published/draft, ignoring 'any'", () => {
    expect(filterAdminProjects(projects, { published: "draft" }).map((p) => p.name)).toEqual([
      "Ledger Lite",
    ]);
    expect(filterAdminProjects(projects, { published: "published" })).toHaveLength(3);
  });

  it("combines every filter (AND, not OR)", () => {
    const result = filterAdminProjects(projects, {
      search: "o",
      status: "ongoing",
      featured: "not-featured",
      published: "published",
    });
    expect(result.map((p) => p.name)).toEqual(["Orbit Analytics"]);
  });
});
