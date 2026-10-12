import { describe, expect, it } from "vitest";
import { filterProjectsByTagAndStatus } from "./projects.js";

describe("filterProjectsByTagAndStatus (/projects ?tag=&status= filters)", () => {
  const projects = [
    { name: "Workspace", techIds: ["skill-a", "skill-b"], status: "ongoing" },
    { name: "Fieldnote", techIds: ["skill-b"], status: "completed" },
    { name: "Orbit", techIds: ["skill-c"], status: "ongoing" },
  ];

  it("returns every project when no filters are given", () => {
    expect(filterProjectsByTagAndStatus(projects)).toHaveLength(3);
    expect(filterProjectsByTagAndStatus(projects, {})).toHaveLength(3);
  });

  it("narrows by tag (skill id)", () => {
    const result = filterProjectsByTagAndStatus(projects, { tag: "skill-b" });
    expect(result.map((p) => p.name)).toEqual(["Workspace", "Fieldnote"]);
  });

  it("narrows by status", () => {
    const result = filterProjectsByTagAndStatus(projects, { status: "completed" });
    expect(result.map((p) => p.name)).toEqual(["Fieldnote"]);
  });

  it("combines tag and status (AND, not OR)", () => {
    const result = filterProjectsByTagAndStatus(projects, {
      tag: "skill-b",
      status: "ongoing",
    });
    expect(result.map((p) => p.name)).toEqual(["Workspace"]);
  });

  it("an unknown tag or status yields an empty list rather than ignoring the filter", () => {
    expect(filterProjectsByTagAndStatus(projects, { tag: "nope" })).toHaveLength(0);
    expect(filterProjectsByTagAndStatus(projects, { status: "nope" })).toHaveLength(0);
  });
});
