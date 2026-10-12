import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function skillsCollection(db) {
  return db.collection(COLLECTIONS.skills);
}

/** All skills, in display order (admin view). */
export function findAllSkills(db) {
  return skillsCollection(db).find({}).sort({ order: 1 }).toArray();
}

/** Only visible skills, in display order (public Tech Stack section). */
export function findVisibleSkills(db) {
  return skillsCollection(db).find({ visible: true }).sort({ order: 1 }).toArray();
}
