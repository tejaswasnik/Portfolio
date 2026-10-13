/**
 * Auto-placement for a new "interest image" (task spec §4.2). Pure and
 * random-source-injectable so it's actually testable: every function
 * here takes `rng` (defaulting to `Math.random`) instead of calling it
 * globally, and `pickPlacement` is deterministic given a seeded `rng`.
 */

// Margin zones only — never inside the 760px content column (±380 from
// center; the spec's "never inside |offsetX| below 400" leaves a 20px
// buffer past the column edge).
const LEFT_RANGE = [-690, -420];
const RIGHT_RANGE = [420, 690];

const TOP_PCT_RANGE = [4, 96];
// The side index sits in this band (right side only) — avoided so a
// placed image never drifts under its text.
const SIDE_INDEX_ZONE = { side: "right", from: 18, to: 27 };

// Deliberately excludes -1..1 so every auto-placed image reads as
// intentionally tilted, never "almost straight by accident".
const ROTATION_RANGE = [-5, 5];
const ROTATION_DEADZONE = [-1, 1];

const MAX_OVERLAP_RATIO = 0.1; // area-overlap ceiling for a single candidate
const PLACEMENT_RETRIES = 20;

function randomInRange([min, max], rng) {
  return min + rng() * (max - min);
}

/** Avoids the dead zone by re-rolling into whichever half of the range it landed closer to. */
function rotationInRange(rng) {
  const value = randomInRange(ROTATION_RANGE, rng);
  if (value > ROTATION_DEADZONE[0] && value < ROTATION_DEADZONE[1]) {
    return value >= 0 ? ROTATION_DEADZONE[1] : ROTATION_DEADZONE[0];
  }
  return value;
}

/** @param {"left" | "right"} side */
function topPctInRange(side, rng) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const value = randomInRange(TOP_PCT_RANGE, rng);
    const inSideIndexZone =
      side === SIDE_INDEX_ZONE.side && value >= SIDE_INDEX_ZONE.from && value <= SIDE_INDEX_ZONE.to;
    if (!inSideIndexZone) return value;
  }
  // 10 misses in a row is astronomically unlikely for an 11-wide zone in
  // a 92-wide range, but never loop forever — clamp just past the zone.
  return SIDE_INDEX_ZONE.to + 1;
}

/**
 * Axis-aligned overlap area as a fraction of the smaller item's own
 * area — rotation is ignored (a cheap, slightly conservative
 * approximation; exact rotated-rect overlap isn't worth it for a
 * decorative layer).
 * @param {{ offsetX: number, topPct: number, width: number, height: number }} a
 * @param {{ offsetX: number, topPct: number, width: number, height: number }} b
 * @param {number} pageHeight topPct -> px, so overlap area is comparable to width/height (both in px)
 */
export function overlapRatio(a, b, pageHeight) {
  const aTop = (a.topPct / 100) * pageHeight;
  const bTop = (b.topPct / 100) * pageHeight;

  const xOverlap = Math.max(
    0,
    Math.min(a.offsetX + a.width / 2, b.offsetX + b.width / 2) -
      Math.max(a.offsetX - a.width / 2, b.offsetX - b.width / 2),
  );
  const yOverlap = Math.max(0, Math.min(aTop + a.height / 2, bTop + b.height / 2) - Math.max(aTop - a.height / 2, bTop - b.height / 2));

  const overlapArea = xOverlap * yOverlap;
  const smallerArea = Math.min(a.width * a.height, b.width * b.height);
  return smallerArea > 0 ? overlapArea / smallerArea : 0;
}

/**
 * @param {{ width: number, height: number }} size
 * @param {"left" | "right"} side
 * @param {() => number} [rng]
 */
function randomCandidate(size, side, rng) {
  const offsetX = Math.round(randomInRange(side === "left" ? LEFT_RANGE : RIGHT_RANGE, rng));
  const topPct = Math.round(topPctInRange(side, rng) * 100) / 100;
  const rotation = Math.round(rotationInRange(rng) * 10) / 10;
  return { ...size, side, offsetX, topPct, rotation };
}

/**
 * Picks where a new image lands: alternates side from the previous item,
 * retries up to `PLACEMENT_RETRIES` times to find a candidate that
 * doesn't overlap any existing item by more than `MAX_OVERLAP_RATIO`,
 * and otherwise falls back to whichever candidate it tried overlapped
 * existing items the least (task spec §4.2, step 5: "accept the
 * least-overlapping candidate").
 * @param {{
 *   size: { width: number, height: number },
 *   previousSide?: "left" | "right" | null,
 *   existing: Array<{ offsetX: number, topPct: number, width: number, height: number }>,
 *   pageHeight?: number,
 *   rng?: () => number,
 * }} options
 * @returns {{ width: number, height: number, side: "left" | "right", offsetX: number, topPct: number, rotation: number }}
 */
export function pickPlacement({ size, previousSide = null, existing = [], pageHeight = 1932, rng = Math.random }) {
  const side = previousSide === "left" ? "right" : "left";

  let best = null;
  let bestOverlap = Infinity;

  for (let attempt = 0; attempt < PLACEMENT_RETRIES; attempt++) {
    const candidate = randomCandidate(size, side, rng);
    const maxOverlap = existing.reduce(
      (max, item) => Math.max(max, overlapRatio(candidate, item, pageHeight)),
      0,
    );

    if (maxOverlap <= MAX_OVERLAP_RATIO) return candidate;
    if (maxOverlap < bestOverlap) {
      best = candidate;
      bestOverlap = maxOverlap;
    }
  }

  return best ?? randomCandidate(size, side, rng);
}

/**
 * Default width/height from a natural image size: longest side 160px,
 * clamped 40-400, aspect ratio preserved (task spec §4.2).
 * @param {{ naturalWidth: number, naturalHeight: number }} dimensions
 */
export function defaultSizeFromAspectRatio({ naturalWidth, naturalHeight }) {
  if (!naturalWidth || !naturalHeight) return { width: 160, height: 160 };

  const longest = Math.max(naturalWidth, naturalHeight);
  const scale = 160 / longest;
  const width = Math.round(naturalWidth * scale);
  const height = Math.round(naturalHeight * scale);
  const clamp = (n) => Math.min(400, Math.max(40, n));
  return { width: clamp(width), height: clamp(height) };
}
