import { describe, expect, it } from "vitest";
import {
  isSameRoute,
  projectSlugFromPath,
  routeKind,
  sharedElementVariant,
  shouldTransition,
} from "./route.js";

describe("routeKind", () => {
  it("classifies every route the transition system cares about", () => {
    expect(routeKind("/")).toBe("home");
    expect(routeKind("/projects")).toBe("projects-list");
    expect(routeKind("/projects/learndeck")).toBe("project-detail");
    expect(routeKind("/admin")).toBe("admin");
    expect(routeKind("/admin/projects")).toBe("admin");
    expect(routeKind("/something-else")).toBe("other");
  });
});

describe("isSameRoute", () => {
  it("is true when only the hash changes (side-index anchor links)", () => {
    expect(isSameRoute("/", "/#projects")).toBe(true);
    expect(isSameRoute("/#about", "/#stack")).toBe(true);
  });

  it("is true when only the query string changes (project filters)", () => {
    expect(isSameRoute("/projects", "/projects?tag=react")).toBe(true);
  });

  it("is false across different paths", () => {
    expect(isSameRoute("/", "/projects")).toBe(false);
  });
});

describe("shouldTransition", () => {
  it("is false for a hash-only navigation", () => {
    expect(shouldTransition("/", "/#projects")).toBe(false);
  });

  it("is false to or from any /admin route", () => {
    expect(shouldTransition("/", "/admin")).toBe(false);
    expect(shouldTransition("/admin/projects", "/admin/skills")).toBe(false);
  });

  it("is false for a no-op navigation to the same path", () => {
    expect(shouldTransition("/projects", "/projects")).toBe(false);
  });

  it("is true for a real public-route change", () => {
    expect(shouldTransition("/", "/projects")).toBe(true);
    expect(shouldTransition("/projects", "/projects/learndeck")).toBe(true);
  });
});

describe("sharedElementVariant", () => {
  it("is 'heading' between home and the projects list, either direction", () => {
    expect(sharedElementVariant("/", "/projects")).toBe("heading");
    expect(sharedElementVariant("/projects", "/")).toBe("heading");
  });

  it("is 'cover' between the projects list and a project detail, either direction", () => {
    expect(sharedElementVariant("/projects", "/projects/learndeck")).toBe("cover");
    expect(sharedElementVariant("/projects/learndeck", "/projects")).toBe("cover");
  });

  it("is null for a detail-to-detail (prev/next) navigation", () => {
    expect(sharedElementVariant("/projects/learndeck", "/projects/plantwise")).toBeNull();
  });

  it("is null for home-to-detail (not a direct route pair in the spec)", () => {
    expect(sharedElementVariant("/", "/projects/learndeck")).toBeNull();
  });
});

describe("projectSlugFromPath", () => {
  it("extracts the slug from a detail path", () => {
    expect(projectSlugFromPath("/projects/learndeck")).toBe("learndeck");
  });

  it("ignores query/hash", () => {
    expect(projectSlugFromPath("/projects/learndeck?ref=x#top")).toBe("learndeck");
  });

  it("is null for non-detail paths", () => {
    expect(projectSlugFromPath("/projects")).toBeNull();
    expect(projectSlugFromPath("/")).toBeNull();
  });
});
