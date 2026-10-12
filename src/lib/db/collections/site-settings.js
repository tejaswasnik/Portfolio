import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function siteSettingsCollection(db) {
  return db.collection(COLLECTIONS.siteSettings);
}

/** siteSettings is a singleton collection with exactly one document. */
export function getSiteSettings(db) {
  return siteSettingsCollection(db).findOne({});
}
