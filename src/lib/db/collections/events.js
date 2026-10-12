import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function eventsCollection(db) {
  return db.collection(COLLECTIONS.events);
}

/** @param {import('mongodb').Db} db */
export function insertEvent(db, event) {
  return eventsCollection(db).insertOne({ ...event, createdAt: new Date() });
}

/**
 * Every event between `start` and `end` (inclusive), for the admin
 * dashboard's aggregations (`src/lib/analytics/aggregations.js`) to
 * reduce over in JS — the one real DB call behind every dashboard widget.
 * @param {import('mongodb').Db} db
 * @param {Date} start
 * @param {Date} end
 */
export function findEventsInRange(db, start, end) {
  return eventsCollection(db)
    .find({ createdAt: { $gte: start, $lte: end } })
    .toArray();
}
