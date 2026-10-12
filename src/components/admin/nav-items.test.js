import { describe, expect, it } from "vitest";
import { currentPageLabel, isActiveRoute } from "./nav-items.js";

describe("isActiveRoute", () => {
  it("matches /admin only exactly", () => {
    expect(isActiveRoute("/admin", "/admin")).toBe(true);
    expect(isActiveRoute("/admin/projects", "/admin")).toBe(false);
  });

  it("matches a sub-route of another nav item", () => {
    expect(isActiveRoute("/admin/projects/new", "/admin/projects")).toBe(true);
    expect(isActiveRoute("/admin/projects", "/admin/projects")).toBe(true);
  });

  it("does not match an unrelated route", () => {
    expect(isActiveRoute("/admin/skills", "/admin/projects")).toBe(false);
  });
});

describe("currentPageLabel", () => {
  it("labels the dashboard route", () => {
    expect(currentPageLabel("/admin")).toBe("Dashboard");
  });

  it("labels a nested sub-route by its parent nav item", () => {
    expect(currentPageLabel("/admin/projects/new")).toBe("Projects");
  });

  it("falls back to Dashboard for an unmatched route", () => {
    expect(currentPageLabel("/admin/something-unknown")).toBe("Dashboard");
  });
});
