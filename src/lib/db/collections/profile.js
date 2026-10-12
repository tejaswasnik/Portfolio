import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function profileCollection(db) {
  return db.collection(COLLECTIONS.profile);
}

/** profile is a singleton collection with exactly one document. */
export function getProfile(db) {
  return profileCollection(db).findOne({});
}
