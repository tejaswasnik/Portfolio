import { z } from "zod";
import { objectIdStringSchema } from "./common.js";

/** Soft cap enforced by the create action — protects public-page perf, not a hard DB limit. */
export const MAX_INTEREST_IMAGES = 24;

/** Both ends scaled 40-400 CSS px (longest side clamped at upload time). */
const dimensionSchema = z.number().int().min(40).max(400);

export const interestImageSchema = z.object({
  imageUrl: z.string().url(),
  fileId: z.string().min(1),
  alt: z.string().trim().max(140).default(""),
  width: dimensionSchema,
  height: dimensionSchema,
  // Margin-only in practice (auto-placement never picks |offsetX| < 400),
  // but not enforced here — the layout editor lets an admin drag an item
  // anywhere, including deliberately close to the column edge.
  offsetX: z.number().int().min(-700).max(700),
  topPct: z.number().min(0).max(100),
  rotation: z.number().min(-15).max(15),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});

/** Admin list quick show/hide toggle. */
export const interestImageVisibleToggleSchema = z.object({
  id: objectIdStringSchema,
  value: z.boolean(),
});

export const interestImageIdSchema = z.object({
  id: objectIdStringSchema,
});

export const interestImageBulkIdsSchema = z.object({
  ids: z.array(objectIdStringSchema).min(1),
});

/**
 * One upload's worth of data for the create action — `offsetX`/`topPct`/
 * `rotation`/`order` are computed server-side by the auto-placement
 * utility, not supplied by the client.
 */
export const interestImageCreateSchema = interestImageSchema.pick({
  imageUrl: true,
  fileId: true,
  width: true,
  height: true,
});

/** Replacing an item's image keeps its position/size/rotation/alt as-is. */
export const interestImageReplaceSchema = z.object({
  id: objectIdStringSchema,
  imageUrl: z.string().url(),
  fileId: z.string().min(1),
});

/** The layout editor's per-item fields — everything the canvas/number inputs can change. */
export const interestImageLayoutSchema = z.object({
  id: objectIdStringSchema,
  width: dimensionSchema,
  height: dimensionSchema,
  offsetX: z.number().int().min(-700).max(700),
  topPct: z.number().min(0).max(100),
  rotation: z.number().min(-15).max(15),
  alt: z.string().trim().max(140).default(""),
});

/** Batched save for the layout editor — one or more items changed at once. */
export const interestImageLayoutBatchSchema = z.object({
  items: z.array(interestImageLayoutSchema).min(1),
});
