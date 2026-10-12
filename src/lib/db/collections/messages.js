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

/** Unread, non-archived count for the admin sidebar badge (Figma 53:16). */
export function countUnreadMessages(db) {
  return messagesCollection(db).countDocuments({ read: false, archived: false });
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

/** @param {import('mongodb').Db} db @param {string} id */
export function findMessageById(db, id) {
  return messagesCollection(db).findOne({ _id: new ObjectId(id) });
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} id
 * @param {Record<string, unknown>} patch
 */
export function updateMessageById(db, id, patch) {
  return messagesCollection(db).updateOne({ _id: new ObjectId(id) }, { $set: patch });
}

/** @param {import('mongodb').Db} db @param {string} id */
export function deleteMessageById(db, id) {
  return messagesCollection(db).deleteOne({ _id: new ObjectId(id) });
}

/** Marks every unread message as read (admin inbox's "Mark all read"). */
export function markAllMessagesRead(db) {
  return messagesCollection(db).updateMany({ read: false }, { $set: { read: true } });
}

/**
 * Pure admin-inbox filter (step 10): narrows an already-fetched message
 * array by search text (name/email/subject/message, case-insensitive)
 * and the All/Unread/Archived segmented control.
 * @param {Array<{name: string, email: string, subject: string, message: string, read: boolean, archived: boolean}>} messages
 * @param {{search?: string, filter?: 'all'|'unread'|'archived'}} [options]
 */
export function filterAdminMessages(messages, { search, filter } = {}) {
  const needle = search?.trim().toLowerCase();
  return messages.filter((message) => {
    if (needle) {
      const haystack = `${message.name} ${message.email} ${message.subject} ${message.message}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (filter === "unread" && (message.read || message.archived)) return false;
    if (filter === "archived" && !message.archived) return false;
    return true;
  });
}
