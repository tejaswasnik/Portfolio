import { ObjectId } from "mongodb";
import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function mediaCollection(db) {
  return db.collection(COLLECTIONS.media);
}

/** Most recently uploaded first (admin media library default order). */
export function findMedia(db, filter = {}) {
  return mediaCollection(db).find(filter).sort({ createdAt: -1 }).toArray();
}

/**
 * Catalogs one ImageKit upload (step 12: "keep the media collection in
 * sync on every upload").
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} data Parsed `mediaUploadSchema` output.
 */
export function insertMedia(db, data) {
  return mediaCollection(db).insertOne({ ...data, createdAt: new Date() });
}

/** @param {import('mongodb').Db} db @param {string} id */
export function findMediaById(db, id) {
  return mediaCollection(db).findOne({ _id: new ObjectId(id) });
}

/** @param {import('mongodb').Db} db @param {string} id */
export function deleteMediaById(db, id) {
  return mediaCollection(db).deleteOne({ _id: new ObjectId(id) });
}

/**
 * Removes the cataloged entry for a replaced/removed ImageKit file
 * (step 12: "...and delete"). Best-effort by design — callers already
 * treat the ImageKit delete itself as best-effort.
 * @param {import('mongodb').Db} db
 * @param {string} fileId
 */
export function deleteMediaByFileId(db, fileId) {
  return mediaCollection(db).deleteOne({ fileId });
}
