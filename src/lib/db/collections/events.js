import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function eventsCollection(db) {
  return db.collection(COLLECTIONS.events);
}

/** @param {import('mongodb').Db} db */
export function insertEvent(db, event) {
  return eventsCollection(db).insertOne({ ...event, createdAt: new Date() });
}
