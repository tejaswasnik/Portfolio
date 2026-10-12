import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function projectsCollection(db) {
  return db.collection(COLLECTIONS.projects);
}

/**
 * The Mongo filter for public project visibility (CLAUDE.md "Hard rules
 * from the PRD"): unpublished projects never appear anywhere; featured
 * controls the home page only, /projects shows every published project.
 * @param {{ featuredOnly?: boolean }} [options]
 * @returns {Record<string, unknown>}
 */
export function buildPublicProjectFilter({ featuredOnly = false } = {}) {
  const filter = { published: true };
  if (featuredOnly) {
    filter.featured = true;
  }
  return filter;
}

/**
 * @param {import('mongodb').Db} db
 * @param {{ featuredOnly?: boolean }} [options]
 */
export function findPublicProjects(db, options) {
  return projectsCollection(db)
    .find(buildPublicProjectFilter(options))
    .sort({ order: 1 })
    .toArray();
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} slug
 */
export function findPublicProjectBySlug(db, slug) {
  return projectsCollection(db).findOne({ slug, published: true });
}

/**
 * Pure /projects list filter (step 4): narrows an already-fetched,
 * already-public project array by the `?tag=<skillId>` and
 * `?status=<ongoing|completed>` URL search params. "All" (or omitted)
 * is represented by an empty/undefined value — matches everything.
 * @param {Array<{ techIds: string[], status: string }>} projects
 * @param {{ tag?: string, status?: string }} [filters]
 */
export function filterProjectsByTagAndStatus(projects, { tag, status } = {}) {
  return projects.filter((project) => {
    if (tag && !project.techIds.includes(tag)) return false;
    if (status && project.status !== status) return false;
    return true;
  });
}
