import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function mediaCollection(db) {
  return db.collection(COLLECTIONS.media);
}

/** Most recently uploaded first (admin media library default order). */
export function findMedia(db, filter = {}) {
  return mediaCollection(db).find(filter).sort({ createdAt: -1 }).toArray();
}
