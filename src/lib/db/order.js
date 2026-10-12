/**
 * Turns a form's 1-based "Display order" choice into a full re-sequenced
 * id list, ready for a collection's bulk reorder write. Pure and
 * collection-agnostic — shared by the admin Projects and Skills screens
 * (both list + edit-form reordering), and by Sections' drag-to-reorder.
 * `existingIds` must already exclude `id` (the item being placed).
 * @param {string[]} existingIds
 * @param {string} id
 * @param {number | "last"} position
 */
export function insertIdAtPosition(existingIds, id, position) {
  const next = existingIds.filter((existingId) => existingId !== id);
  if (position === "last") {
    next.push(id);
    return next;
  }
  const index = Math.min(Math.max(position - 1, 0), next.length);
  next.splice(index, 0, id);
  return next;
}
