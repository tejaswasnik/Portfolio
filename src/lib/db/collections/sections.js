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

/**
 * Idempotent self-heal for a DB seeded before the Interest images
 * section existed (`scripts/seed.js` only covers a fresh install) — a
 * missing row would otherwise be indistinguishable from "deliberately
 * hidden" to the public page's plain `visibleKeys.has(...)` check, since
 * `findVisibleSections` only ever returns `visible: true` docs either
 * way. Called once from the admin Interest images page load; a no-op if
 * the row already exists.
 * @param {import('mongodb').Db} db
 */
export async function ensureInterestImagesSection(db) {
  const maxOrder = await sectionsCollection(db).find({}).sort({ order: -1 }).limit(1).toArray();
  const nextOrder = maxOrder.length > 0 ? maxOrder[0].order + 1 : 0;
  await sectionsCollection(db).updateOne(
    { key: "interest-images" },
    { $setOnInsert: { key: "interest-images", label: "Interest images", visible: true, order: nextOrder } },
    { upsert: true },
  );
}
