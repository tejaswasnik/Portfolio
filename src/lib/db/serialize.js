/**
 * Converts a Mongo document's `_id` (an ObjectId) to a plain string `id`
 * field so the result can cross the server/client boundary and survive
 * Next's cache serialization. Dates aren't special-cased here — none of
 * the current public-page reads expose one; revisit if a cached read
 * starts returning a raw Date.
 * @param {Record<string, unknown> | null | undefined} doc
 */
export function serializeDoc(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id ? String(_id) : undefined, ...rest };
}

/** @param {Array<Record<string, unknown>>} docs */
export function serializeDocs(docs) {
  return docs.map(serializeDoc);
}
