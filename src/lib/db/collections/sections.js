import { ObjectId } from "mongodb";
import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function sectionsCollection(db) {
  return db.collection(COLLECTIONS.sections);
}

/** All sections, in display order (admin view). */
export function findAllSections(db) {
  return sectionsCollection(db).find({}).sort({ order: 1 }).toArray();
}

/** Only visible sections, in display order (public home page + side index). */
export function findVisibleSections(db) {
  return sectionsCollection(db).find({ visible: true }).sort({ order: 1 }).toArray();
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function updateSectionById(db, id, patch) {
  return sectionsCollection(db).updateOne({ _id: new ObjectId(id) }, { $set: patch });
}

/**
 * Bulk-writes a new `order` (0-based, by array position) for every id in
 * `orderedIds` — the admin Sections screen's drag-to-reorder action.
 * @param {import('mongodb').Db} db
 * @param {string[]} orderedIds
 */
export function reorderSections(db, orderedIds) {
  return sectionsCollection(db).bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { order: index } } },
    })),
  );
}
