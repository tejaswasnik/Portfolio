import { ObjectId } from "mongodb";
import { COLLECTIONS } from "./names.js";

/** @param {import('mongodb').Db} db */
export function messagesCollection(db) {
  return db.collection(COLLECTIONS.messages);
}

/** Most recent messages first (admin inbox default order). */
export function findMessages(db, filter = {}) {
  return messagesCollection(db).find(filter).sort({ createdAt: -1 }).toArray();
}

/**
 * Saves a new contact-form submission. Callers pass the already-Zod-
 * validated fields plus `ipHash`; `read`/`archived`/`emailFailed`
 * default per `messageSchema` and `createdAt` is server-set here so it
 * can't be spoofed by the client.
 * @param {import('mongodb').Db} db
 * @param {{ name: string, email: string, subject?: string, message: string, ipHash: string }} fields
 * @returns {Promise<import('mongodb').InsertOneResult>}
 */
export function insertMessage(db, fields) {
  return messagesCollection(db).insertOne({
    name: fields.name,
    email: fields.email,
    subject: fields.subject ?? "",
    message: fields.message,
    read: false,
    archived: false,
    emailFailed: false,
    ipHash: fields.ipHash,
    createdAt: new Date(),
  });
}

/**
 * Flags a saved message as having failed to email the admin, so step 10's
 * inbox can offer a retry (CLAUDE.md: "if the email fails set emailFailed").
 * @param {import('mongodb').Db} db
 * @param {import('mongodb').ObjectId | string} id
 */
export function markMessageEmailFailed(db, id) {
  return messagesCollection(db).updateOne(
    { _id: typeof id === "string" ? new ObjectId(id) : id },
    { $set: { emailFailed: true } },
  );
}
