import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function rateLimitsCollection(db) {
  return db.collection(COLLECTIONS.rateLimits);
}
