/**
 * Pure logic for the scattered interest-images' entrance reveal, split
 * out from the hook that wires it to the DOM so the stagger/direction/
 * low-end-device math is unit-testable without mounting anything or
 * touching a real `IntersectionObserver`.
 */
import { SETTLE, STAGGER } from "@/lib/transitions/interestImageReveal";

/**
 * Left-margin images (negative `offsetX`) drift in from further left;
 * right-margin images (zero or positive `offsetX`) drift in from
 * further right — each settles back toward the page center along its
 * own horizontal axis. Returns the signed starting drift in px (the
 * value a `0%` keyframe should hold; it always animates to `0`).
 */
export function initialDriftPx(offsetX: number, driftPx: number = SETTLE.driftPx): number {
  return offsetX < 0 ? -driftPx : driftPx;
}

/**
 * Stagger delay (ms) for the Nth image revealing within the same
 * `IntersectionObserver` batch (0-indexed, already sorted top-first).
 * Caps at `STAGGER.cap` items — anything beyond that reveals with no
 * added delay rather than extending the chain indefinitely.
 */
export function staggerDelayMs(indexInBatch: number): number {
  if (indexInBatch < 0) return 0;
  return Math.min(indexInBatch, STAGGER.cap) * STAGGER.stepMs;
}

/**
 * Perimeter of a rounded rectangle — the straight edges (`width`/`height`
 * minus the two corner-radius bites each) plus the four quarter-circle
 * corners, which together sum to one full circle of that radius. Used
 * to size the outline SVG's `stroke-dasharray`/`stroke-dashoffset` trace
 * to the image's own actual dimensions rather than a guessed constant.
 */
export function roundedRectPerimeter(width: number, height: number, radius: number): number {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width - 2 * r) + 2 * (height - 2 * r) + 2 * Math.PI * r;
}

/** Minimal shape of the bits of `navigator.connection` this check reads. */
export interface NetworkInformationLike {
  saveData?: boolean;
}

/**
 * `prefers-reduced-motion`, `connection.saveData`, or a conservative
 * low-end-device heuristic (very little memory or very few cores) — any
 * of these fall back to the plain opacity fade. Takes `window` instead
 * of reading the global directly so it stays testable under jsdom
 * without monkeypatching globals the caller doesn't own.
 */
export function shouldUseSimpleReveal(win: Window): boolean {
  const prefersReduced = win.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (prefersReduced) return true;

  const nav = win.navigator as Navigator & {
    connection?: NetworkInformationLike;
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return true;

  return false;
}
