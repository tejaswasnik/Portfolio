import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function messagesCollection(db) {
  return db.collection(COLLECTIONS.messages);
}

/** Most recent messages first (admin inbox default order). */
export function findMessages(db, filter = {}) {
  return messagesCollection(db).find(filter).sort({ createdAt: -1 }).toArray();
}
