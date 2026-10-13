"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { CACHE_TAGS } from "@/lib/db/cache.js";
import { getProfile } from "@/lib/db/collections/profile.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { findAllProjects } from "@/lib/db/collections/projects.js";
import { deleteMediaByFileId } from "@/lib/db/collections/media.js";
import {
  bulkUpdateInterestImageLayout,
  countInterestImagesByFileId,
  deleteInterestImageById,
  deleteInterestImagesByIds,
  findAllInterestImages,
  findInterestImageById,
  findMaxInterestImageOrder,
  insertInterestImage,
  setInterestImagesVisibility,
  updateInterestImageById,
} from "@/lib/db/collections/interestImages.js";
import { deleteImageKitFile } from "@/lib/imagekit/client.js";
import { computeFileUsage } from "@/lib/media/usage.js";
import { pickPlacement } from "@/lib/interestImages/placement.js";
import {
  MAX_INTEREST_IMAGES,
  interestImageBulkIdsSchema,
  interestImageCreateSchema,
  interestImageIdSchema,
  interestImageLayoutBatchSchema,
  interestImageReplaceSchema,
  interestImageVisibleToggleSchema,
} from "@/lib/schemas/interestImage.js";

/** Revalidates every page an interest-images mutation can affect. */
function revalidateInterestImages() {
  revalidateTag(CACHE_TAGS.interestImages);
  revalidatePath("/admin/interest-images");
  revalidatePath("/");
}

/** Plain `{offsetX, topPct, width, height}` objects for the overlap check — placement.js doesn't need the rest of the document. */
function asPlacementRects(docs) {
  return docs.map((doc) => ({
    offsetX: doc.offsetX,
    topPct: doc.topPct,
    width: doc.width,
    height: doc.height,
  }));
}

/**
 * Deletes an ImageKit file only if nothing else still references it —
 * another interestImage with the same `fileId` (e.g. a duplicate that
 * shares the original upload) or any live profile/siteSettings/project
 * field (the file could have been picked from the shared media library).
 * Best-effort, like every other ImageKit cleanup in this app.
 * @param {import('mongodb').Db} db
 * @param {string} fileId
 * @param {string} excludeInterestImageId the item being replaced/deleted, so it doesn't count itself
 */
async function deleteFileIfUnused(db, fileId, excludeInterestImageId) {
  if (!fileId) return;

  const [otherInterestImageCount, profile, siteSettings, projects, allInterestImages] = await Promise.all([
    countInterestImagesByFileId(db, fileId, excludeInterestImageId),
    getProfile(db),
    getSiteSettings(db),
    findAllProjects(db),
    findAllInterestImages(db),
  ]);
  if (otherInterestImageCount > 0) return;

  // `computeFileUsage` matches by url, not fileId — find this file's own
  // interestImage doc (if any) for its url, falling back to nothing
  // (an already-removed doc has no url to check, which is fine: this
  // function only runs right before/after that doc stops existing).
  const ownDoc = allInterestImages.find((img) => img.fileId === fileId && img._id.toString() !== excludeInterestImageId);
  const url = ownDoc?.imageUrl;
  const usage = url ? computeFileUsage(url, { profile, siteSettings, projects }) : [];
  if (usage.length > 0) return;

  await deleteImageKitFile(fileId);
  deleteMediaByFileId(db, fileId).catch(() => {});
}

/**
 * Creates one item from an already-uploaded file, auto-placing it per
 * the task spec's §4.2 algorithm. `width`/`height` are the image's
 * default size (derived client-side via `defaultSizeFromAspectRatio`).
 * @param {unknown} input `{ imageUrl, fileId, width, height }`
 */
export async function createInterestImage(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageCreateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid image." };

  const existing = await findAllInterestImages(session.db);
  if (existing.length >= MAX_INTEREST_IMAGES) {
    return { ok: false, error: `${MAX_INTEREST_IMAGES} images is the limit — remove one first.` };
  }

  const last = existing[existing.length - 1];
  const placement = pickPlacement({
    size: { width: parsed.data.width, height: parsed.data.height },
    previousSide: last ? (last.offsetX < 0 ? "left" : "right") : null,
    existing: asPlacementRects(existing),
  });

  const order = (await findMaxInterestImageOrder(session.db)) + 1;
  const result = await insertInterestImage(session.db, {
    imageUrl: parsed.data.imageUrl,
    fileId: parsed.data.fileId,
    alt: "",
    width: parsed.data.width,
    height: parsed.data.height,
    offsetX: placement.offsetX,
    topPct: placement.topPct,
    rotation: placement.rotation,
    visible: true,
    order,
  });

  revalidateInterestImages();
  return {
    ok: true,
    id: result.insertedId.toString(),
    offsetX: placement.offsetX,
    topPct: placement.topPct,
    rotation: placement.rotation,
    order,
  };
}

/**
 * Same auto-placement, but for an existing item re-rolling its spot
 * (editor's "Shuffle positions"/"Reset this item's position"). Shared so
 * both actions place consistently.
 */
function placeAgainst(size, previousSide, others) {
  return pickPlacement({ size, previousSide, existing: asPlacementRects(others) });
}

/** Re-places every item from scratch, in their current list order. */
export async function shuffleInterestImagePositions() {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const items = await findAllInterestImages(session.db);
  const placed = [];
  const results = [];
  let previousSide = null;

  for (const item of items) {
    const placement = placeAgainst({ width: item.width, height: item.height }, previousSide, placed);
    placed.push({ offsetX: placement.offsetX, topPct: placement.topPct, width: item.width, height: item.height });
    previousSide = placement.side;
    const id = item._id.toString();
    await updateInterestImageById(session.db, id, {
      offsetX: placement.offsetX,
      topPct: placement.topPct,
      rotation: placement.rotation,
    });
    results.push({ id, offsetX: placement.offsetX, topPct: placement.topPct, rotation: placement.rotation });
  }

  revalidateInterestImages();
  return { ok: true, items: results };
}

/** @param {unknown} input `{ id }` */
export async function resetInterestImagePosition(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const target = await findInterestImageById(session.db, parsed.data.id);
  if (!target) return { ok: false, error: "This image no longer exists." };

  const others = (await findAllInterestImages(session.db)).filter((img) => img._id.toString() !== parsed.data.id);
  const previous = others[others.length - 1];
  const placement = placeAgainst(
    { width: target.width, height: target.height },
    previous ? (previous.offsetX < 0 ? "left" : "right") : null,
    others,
  );

  await updateInterestImageById(session.db, parsed.data.id, {
    offsetX: placement.offsetX,
    topPct: placement.topPct,
    rotation: placement.rotation,
  });

  revalidateInterestImages();
  return { ok: true, offsetX: placement.offsetX, topPct: placement.topPct, rotation: placement.rotation };
}

/** @param {unknown} input `{ id, imageUrl, fileId }` — position/size/rotation/alt stay as-is. */
export async function replaceInterestImage(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageReplaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const existing = await findInterestImageById(session.db, parsed.data.id);
  if (!existing) return { ok: false, error: "This image no longer exists." };

  await updateInterestImageById(session.db, parsed.data.id, {
    imageUrl: parsed.data.imageUrl,
    fileId: parsed.data.fileId,
  });

  if (existing.fileId && existing.fileId !== parsed.data.fileId) {
    deleteFileIfUnused(session.db, existing.fileId, parsed.data.id).catch(() => {});
  }

  revalidateInterestImages();
  return { ok: true };
}

/**
 * Duplicates an item (same image, size and alt text) at a freshly
 * auto-placed position — an exact-position copy would just sit invisibly
 * on top of the original.
 * @param {unknown} input `{ id }`
 */
export async function duplicateInterestImage(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const source = await findInterestImageById(session.db, parsed.data.id);
  if (!source) return { ok: false, error: "This image no longer exists." };

  const existing = await findAllInterestImages(session.db);
  if (existing.length >= MAX_INTEREST_IMAGES) {
    return { ok: false, error: `${MAX_INTEREST_IMAGES} images is the limit — remove one first.` };
  }

  const placement = placeAgainst(
    { width: source.width, height: source.height },
    source.offsetX < 0 ? "left" : "right",
    existing,
  );
  const order = (await findMaxInterestImageOrder(session.db)) + 1;

  const result = await insertInterestImage(session.db, {
    imageUrl: source.imageUrl,
    fileId: source.fileId,
    alt: source.alt,
    width: source.width,
    height: source.height,
    offsetX: placement.offsetX,
    topPct: placement.topPct,
    rotation: placement.rotation,
    visible: source.visible,
    order,
  });

  revalidateInterestImages();
  return {
    ok: true,
    id: result.insertedId.toString(),
    imageUrl: source.imageUrl,
    fileId: source.fileId,
    alt: source.alt,
    width: source.width,
    height: source.height,
    offsetX: placement.offsetX,
    topPct: placement.topPct,
    rotation: placement.rotation,
    visible: source.visible,
    order,
  };
}

/** @param {unknown} input `{ id, value }` */
export async function toggleInterestImageVisible(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageVisibleToggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await updateInterestImageById(session.db, parsed.data.id, { visible: parsed.data.value });
  revalidateInterestImages();
  return { ok: true };
}

/** The layout editor's numeric fields (width/height/offsetX/topPct/rotation/alt) for one item. */
export async function updateInterestImageLayout(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageLayoutBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the values and try again.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await bulkUpdateInterestImageLayout(
    session.db,
    parsed.data.items.map(({ id, ...patch }) => ({ id, patch })),
  );

  revalidateInterestImages();
  return { ok: true };
}

/** @param {unknown} input `{ id }` — hard-deletes; the 8s undo window is client-side (see InterestImagesManager). */
export async function deleteInterestImage(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const existing = await findInterestImageById(session.db, parsed.data.id);
  if (!existing) return { ok: true }; // already gone — the undo window may have raced a page refresh

  await deleteInterestImageById(session.db, parsed.data.id);
  if (existing.fileId) deleteFileIfUnused(session.db, existing.fileId, parsed.data.id).catch(() => {});

  revalidateInterestImages();
  return { ok: true };
}

/** @param {unknown} input `{ ids, value }` */
export async function bulkSetInterestImagesVisible(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageBulkIdsSchema.extend({ value: interestImageVisibleToggleSchema.shape.value }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  await setInterestImagesVisibility(session.db, parsed.data.ids, parsed.data.value);
  revalidateInterestImages();
  return { ok: true };
}

/** @param {unknown} input `{ ids }` — immediate, no undo window (bulk actions are already an explicit multi-select gesture). */
export async function bulkDeleteInterestImages(input) {
  const session = await requireAdmin({ redirectOnFail: false });
  if (!session) return { ok: false, error: "Not authenticated." };

  const parsed = interestImageBulkIdsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const items = await Promise.all(parsed.data.ids.map((id) => findInterestImageById(session.db, id)));
  await deleteInterestImagesByIds(session.db, parsed.data.ids);

  await Promise.all(
    items
      .filter(Boolean)
      .map((item) => deleteFileIfUnused(session.db, item.fileId, item._id.toString()).catch(() => {})),
  );

  revalidateInterestImages();
  return { ok: true };
}
