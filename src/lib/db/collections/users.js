import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function usersCollection(db) {
  return db.collection(COLLECTIONS.users);
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} email
 */
export function findUserByEmail(db, email) {
  return usersCollection(db).findOne({ email });
}
