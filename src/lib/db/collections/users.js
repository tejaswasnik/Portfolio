import { ObjectId } from "mongodb";
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

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 */
export function findUserById(db, id) {
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }
  return usersCollection(db).findOne({ _id: objectId });
}

/**
 * Persists the login-failure/lockout state computed by
 * src/lib/auth/lockout.js's `computeAfterFailedLogin()`.
 * @param {import('mongodb').Db} db
 * @param {string} email
 * @param {{ failedAttempts: number, lockedUntil: Date | null }} state
 */
export function recordLoginFailure(db, email, state) {
  return usersCollection(db).updateOne({ email }, { $set: state });
}

/** Resets lockout state on a successful login. */
export function resetLoginFailures(db, email) {
  return usersCollection(db).updateOne(
    { email },
    { $set: { failedAttempts: 0, lockedUntil: null } },
  );
}

/**
 * Bumps `tokenVersion`, invalidating every previously issued JWT (plain
 * JWTs can't be revoked otherwise) — called on logout and on password/
 * email changes.
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').ObjectId | string} id
 */
export function bumpTokenVersion(db, id) {
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  return usersCollection(db).updateOne({ _id: objectId }, { $inc: { tokenVersion: 1 } });
}

/**
 * Updates the admin's email (admin Settings, step 10). Callers must
 * also call `bumpTokenVersion` — per docs/ARCHITECTURE.md, an email
 * change invalidates every existing token.
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').ObjectId | string} id
 * @param {string} email
 */
export function updateUserEmail(db, id, email) {
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  return usersCollection(db).updateOne({ _id: objectId }, { $set: { email } });
}

/**
 * Updates the admin's password hash (admin Settings, step 10). Callers
 * must also call `bumpTokenVersion`, same reasoning as `updateUserEmail`.
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').ObjectId | string} id
 * @param {string} passwordHash
 */
export function updateUserPassword(db, id, passwordHash) {
  const objectId = typeof id === "string" ? new ObjectId(id) : id;
  return usersCollection(db).updateOne({ _id: objectId }, { $set: { passwordHash } });
}

/**
 * Creates or updates the single admin user (scripts/seed-admin.js).
 * @param {import('mongodb').Db} db
 * @param {{ email: string, passwordHash: string }} fields
 */
export function upsertAdminUser(db, fields) {
  return usersCollection(db).updateOne(
    { email: fields.email },
    {
      $set: { passwordHash: fields.passwordHash },
      $setOnInsert: {
        email: fields.email,
        failedAttempts: 0,
        lockedUntil: null,
        tokenVersion: 0,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
}
