import { ObjectId } from "mongodb";
import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function interestImagesCollection(db) {
  return db.collection(COLLECTIONS.interestImages);
}

/** All items, in insertion order (admin gallery). */
export function findAllInterestImages(db) {
  return interestImagesCollection(db).find({}).sort({ order: 1 }).toArray();
}

/** Only visible items with an image, in order (public decorative layer). */
export function findVisibleInterestImages(db) {
  return interestImagesCollection(db)
    .find({ visible: true, imageUrl: { $exists: true, $ne: "" } })
    .sort({ order: 1 })
    .toArray();
}

/** @param {import('mongodb').Db} db @param {string} id */
export function findInterestImageById(db, id) {
  return interestImagesCollection(db).findOne({ _id: new ObjectId(id) });
}

export function countInterestImages(db) {
  return interestImagesCollection(db).countDocuments({});
}

/** How many *other* items reference this ImageKit file (replace/delete's "still in use?" check). */
export function countInterestImagesByFileId(db, fileId, excludeId) {
  const filter = { fileId };
  if (excludeId) filter._id = { $ne: new ObjectId(excludeId) };
  return interestImagesCollection(db).countDocuments(filter);
}

/** Highest `order` currently in the collection, or -1 if empty — callers add 1 for a new item. */
export async function findMaxInterestImageOrder(db) {
  const [top] = await interestImagesCollection(db).find({}).sort({ order: -1 }).limit(1).toArray();
  return top ? top.order : -1;
}

/**
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} data Parsed `interestImageSchema` output, plus `order`.
 */
export function insertInterestImage(db, data) {
  const now = new Date();
  return interestImagesCollection(db).insertOne({ ...data, createdAt: now, updatedAt: now });
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function updateInterestImageById(db, id, patch) {
  return interestImagesCollection(db).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...patch, updatedAt: new Date() } },
  );
}

/** @param {import('mongodb').Db} db @param {string} id */
export function deleteInterestImageById(db, id) {
  return interestImagesCollection(db).deleteOne({ _id: new ObjectId(id) });
}

/** @param {import('mongodb').Db} db @param {string[]} ids */
export function deleteInterestImagesByIds(db, ids) {
  return interestImagesCollection(db).deleteMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
}

/** @param {import('mongodb').Db} db @param {string[]} ids @param {boolean} visible */
export function setInterestImagesVisibility(db, ids, visible) {
  return interestImagesCollection(db).updateMany(
    { _id: { $in: ids.map((id) => new ObjectId(id)) } },
    { $set: { visible, updatedAt: new Date() } },
  );
}

/**
 * Bulk-writes new layout fields (position/size/rotation/alt) for several
 * items at once — the layout editor's "Save"/"Shuffle positions".
 * @param {import('mongodb').Db} db
 * @param {Array<{ id: string, patch: Record<string, unknown> }>} updates
 */
export function bulkUpdateInterestImageLayout(db, updates) {
  if (updates.length === 0) return Promise.resolve({ matchedCount: 0 });
  const now = new Date();
  return interestImagesCollection(db).bulkWrite(
    updates.map(({ id, patch }) => ({
      updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { ...patch, updatedAt: now } } },
    })),
  );
}
