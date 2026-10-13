/**
 * Pure route classification for the page-transition system — no DOM, no
 * GSAP, just string logic, so the "which transition applies" decisions
 * are unit-testable independent of the animation machinery.
 */

/** @param {string} pathname */
export function routeKind(pathname) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/") return "home";
  if (pathname === "/projects") return "projects-list";
  if (pathname.startsWith("/projects/")) return "project-detail";
  return "other";
}

/** Strips query string and hash, leaving just the path. */
function basePath(path) {
  return path.split("#")[0].split("?")[0];
}

/** Same base path (only the hash and/or query changed) — side-index anchor links, filters. */
export function isSameRoute(fromPath, toPath) {
  return basePath(fromPath) === basePath(toPath);
}

/**
 * Whether `fromPath -> toPath` should play the drafting-sheet transition
 * at all (task spec: side-index anchors and /admin/* are excluded).
 */
export function shouldTransition(fromPath, toPath) {
  if (isSameRoute(fromPath, toPath)) return false;
  const fromKind = routeKind(fromPath);
  const toKind = routeKind(toPath);
  if (fromKind === "admin" || toKind === "admin") return false;
  return true;
}

/**
 * Which shared-element choreography applies, if any (task spec's "Route
 * variations" — mirrored for the reverse direction too, since back
 * navigation plays the same pairing in reverse).
 * @returns {"heading" | "cover" | null}
 */
export function sharedElementVariant(fromPath, toPath) {
  const fromKind = routeKind(fromPath);
  const toKind = routeKind(toPath);

  if (
    (fromKind === "home" && toKind === "projects-list") ||
    (fromKind === "projects-list" && toKind === "home")
  ) {
    return "heading";
  }

  if (
    (fromKind === "projects-list" && toKind === "project-detail") ||
    (fromKind === "project-detail" && toKind === "projects-list")
  ) {
    return "cover";
  }

  return null;
}

/** The project slug a `/projects/<slug>` path names, or null. */
export function projectSlugFromPath(path) {
  const clean = basePath(path);
  const match = clean.match(/^\/projects\/([^/]+)$/);
  return match ? match[1] : null;
}
