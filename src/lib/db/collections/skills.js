import { ObjectId } from "mongodb";
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

/** @param {import('mongodb').Db} db @param {string} id */
export function findSkillById(db, id) {
  return skillsCollection(db).findOne({ _id: new ObjectId(id) });
}

/**
 * @param {import('mongodb').Db} db
 * @param {Record<string, unknown>} data Parsed `skillSchema` output.
 */
export function insertSkill(db, data) {
  return skillsCollection(db).insertOne(data);
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function updateSkillById(db, id, patch) {
  return skillsCollection(db).updateOne({ _id: new ObjectId(id) }, { $set: patch });
}

/** @param {import('mongodb').Db} db @param {string} id */
export function deleteSkillById(db, id) {
  return skillsCollection(db).deleteOne({ _id: new ObjectId(id) });
}

/**
 * Bulk-writes a new `order` (0-based, by array position) for every id in
 * `orderedIds` — the admin list's drag-to-reorder action.
 * @param {import('mongodb').Db} db
 * @param {string[]} orderedIds
 */
export function reorderSkills(db, orderedIds) {
  return skillsCollection(db).bulkWrite(
    orderedIds.map((id, index) => ({
      updateOne: { filter: { _id: new ObjectId(id) }, update: { $set: { order: index } } },
    })),
  );
}

/**
 * Pure admin-list filter (step 8): narrows an already-fetched skill
 * array by search text (name, case-insensitive) and the category
 * segmented control. "all" (or omitted) means no filtering.
 * @param {Array<{name: string, category: string}>} skills
 * @param {{search?: string, category?: string}} [filters]
 */
export function filterAdminSkills(skills, { search, category } = {}) {
  const needle = search?.trim().toLowerCase();
  return skills.filter((skill) => {
    if (needle && !skill.name.toLowerCase().includes(needle)) return false;
    if (category && category !== "all" && skill.category !== category) return false;
    return true;
  });
}
