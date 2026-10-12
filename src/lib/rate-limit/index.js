import { COLLECTIONS } from "../db/collections/names.js";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour, per PRD 2.5 / CLAUDE.md
const MAX_PER_WINDOW = 3;

/**
 * Checks and atomically increments a Mongo-backed rate-limit counter for
 * `key` (an already-hashed identifier — see src/lib/rate-limit/hash.js).
 * The `rateLimits` collection's TTL index on `expiresAt` (see
 * scripts/ensure-indexes.js) reaps expired windows on its own; this
 * function only decides whether the *current* request is allowed.
 *
 * `findOneAndUpdate` with `$setOnInsert` makes "create a fresh window" and
 * "increment the existing one" a single atomic operation, so concurrent
 * requests from the same hashed key can't race past the limit.
 *
 * @param {import('mongodb').Db} db
 * @param {string} key hashed identifier (e.g. a hashed IP)
 * @returns {Promise<boolean>} true if this request is allowed
 */
export async function checkAndIncrementRateLimit(db, key) {
  const now = new Date();
  const collection = db.collection(COLLECTIONS.rateLimits);

  // A single atomic findOneAndUpdate: $inc creates `count: 1` on insert and
  // increments it otherwise, so concurrent requests from the same hashed
  // key can't both read "2" and both proceed past the limit.
  // mongodb v7's findOneAndUpdate returns the document directly (not
  // wrapped in `.value`) since `includeResultMetadata` now defaults to
  // false.
  const doc = await collection.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },
    {
      $inc: { count: 1 },
      $setOnInsert: { key, expiresAt: new Date(now.getTime() + WINDOW_MS) },
    },
    { upsert: true, returnDocument: "after" },
  );

  return doc.count <= MAX_PER_WINDOW;
}
