import { ObjectId } from "mongodb";
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

/** All projects, in display order (admin list — includes unpublished). */
export function findAllProjects(db) {
  return projectsCollection(db).find({}).sort({ order: 1 }).toArray();
}

/** @param {import('mongodb').Db} db @param {string} id */
export function findProjectById(db, id) {
  return projectsCollection(db).findOne({ _id: new ObjectId(id) });
}

/**
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} data Parsed `projectSchema` output.
 */
export function insertProject(db, data) {
  return projectsCollection(db).insertOne(data);
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function updateProjectById(db, id, patch) {
  return projectsCollection(db).updateOne({ _id: new ObjectId(id) }, { $set: patch });
}

/** @param {import('mongodb').Db} db @param {string} id */
export function deleteProjectById(db, id) {
  return projectsCollection(db).deleteOne({ _id: new ObjectId(id) });
}

/**
 * Bulk-writes a new `order` (0-based, by array position) for every id in
 * `orderedIds` — the admin list's drag-to-reorder action.
 * @param {import('mongodb').Db} db
 * @param {string[]} orderedIds
 */
export function reorderProjects(db, orderedIds) {
  return projectsCollection(db).bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { order: index } } },
    })),
  );
}

/**
 * Pure admin-list filter (step 8): narrows an already-fetched project
 * array by search text (name/slug, case-insensitive) and the status/
 * featured/published segmented controls. "all"/"any" (or omitted) means
 * no filtering on that dimension — matches everything.
 * @param {Array<{name: string, slug: string, status: string, featured: boolean, published: boolean}>} projects
 * @param {{search?: string, status?: string, featured?: string, published?: string}} [filters]
 */
export function filterAdminProjects(projects, { search, status, featured, published } = {}) {
  const needle = search?.trim().toLowerCase();
  return projects.filter((project) => {
    if (needle && !project.name.toLowerCase().includes(needle) && !project.slug.includes(needle)) {
      return false;
    }
    if (status && status !== "all" && project.status !== status) return false;
    if (featured === "featured" && !project.featured) return false;
    if (featured === "not-featured" && project.featured) return false;
    if (published === "published" && !project.published) return false;
    if (published === "draft" && project.published) return false;
    return true;
  });
}
