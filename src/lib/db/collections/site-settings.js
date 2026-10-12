import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function siteSettingsCollection(db) {
  return db.collection(COLLECTIONS.siteSettings);
}

/** siteSettings is a singleton collection with exactly one document. */
export function getSiteSettings(db) {
  return siteSettingsCollection(db).findOne({});
}

/**
 * Upserts (partially — callers may patch a subset of fields) the
 * singleton siteSettings document. Used by the admin Profile & About
 * form (footerText, githubUsername) and, later, Settings (step 10).
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} patch
 */
export function updateSiteSettings(db, patch) {
  return siteSettingsCollection(db).updateOne({}, { $set: patch }, { upsert: true });
}
