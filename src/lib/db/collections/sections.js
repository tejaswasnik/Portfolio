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
