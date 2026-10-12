import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function profileCollection(db) {
  return db.collection(COLLECTIONS.profile);
}

/** profile is a singleton collection with exactly one document. */
export function getProfile(db) {
  return profileCollection(db).findOne({});
}

/**
 * Upserts the singleton profile document (Admin Profile & About, step 8).
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} patch
 */
export function updateProfile(db, patch) {
  return profileCollection(db).updateOne({}, { $set: patch }, { upsert: true });
}
