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
