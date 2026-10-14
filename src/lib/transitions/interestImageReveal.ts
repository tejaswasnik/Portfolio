/**
 * Every timing value for the scattered interest-images' "pinned to the
 * sheet" entrance (outline trace -> settle -> pin), in one place, next
 * to `constants.js`'s page-transition timings (same "all timing values
 * in one exported constants module" requirement). Durations in ms
 * unless noted. TypeScript here is a deliberate, scoped exception to
 * the project's plain-JS convention (CLAUDE.md) for this feature only.
 *
 * `TOTAL_MS` from `constants.js` is reused (not duplicated) to size the
 * delay before this layer's reveal is allowed to start after a route
 * change, so the two systems can't ever visibly run at once without the
 * page-transition's own budget having to be imported/guessed at twice.
 */
import { TOTAL_MS as PAGE_TRANSITION_TOTAL_MS } from "./constants.js";

/** Beat 1 — the outline traces (the SVG `rect`'s `stroke-dashoffset`). */
export const TRACE = {
  duration: 320, // 0-320ms
  ease: "cubic-bezier(.65,0,.35,1)",
  strokeDasharray: "4 4",
  strokeColor: "#2E3337",
  /** The outline fades out over the image's last 180ms as it settles on top. */
  fadeOutDuration: 180,
};

/** Beat 2 — the image settles (fade + scale + drift + rotation overshoot). */
export const SETTLE = {
  startAt: 240, // ms from reveal start
  duration: 400, // ends ~640ms
  ease: "cubic-bezier(.22,1,.36,1)",
  scaleFrom: 0.94,
  driftPx: 10,
  /** Degrees beyond the item's own stored rotation, settling back to it. */
  overshootDeg: 2,
};

/** Beat 3 — the pin (crosshair) lands at the image's top-left corner. */
export const PIN = {
  startAt: 520, // ms from reveal start
  fadeDuration: 240, // ends ~760ms
  crosshairArm: 10, // px
  crosshairOffset: 6, // px outside the image's top-left corner
  crosshairColor: "#9F9FA9",
  crosshairOpacity: 0.7,
};

/** The whole per-image reveal, start to finish. */
export const TOTAL_MS = { min: 620, max: 760 };

/** Per-image stagger as several enter the viewport together. */
export const STAGGER = {
  stepMs: 70,
  /** Items beyond this position in a batch reveal immediately (delay 0), not queued further. */
  cap: 6,
};

/** Images already in the viewport on first paint wait this long so page content lands first. */
export const INITIAL_PAINT_DELAY_MS = 180;

/**
 * This layer must never animate at the same time as the page transition
 * it sits beside (`TransitionProvider`'s own choreography) — rather than
 * having this feature reach into that unrelated system to ask "are you
 * done yet", it simply waits out the page transition's own documented
 * worst case before arming its `IntersectionObserver`.
 */
export const ROUTE_CHANGE_GUARD_MS = PAGE_TRANSITION_TOTAL_MS.max;

export const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -12% 0px",
  threshold: 0.15,
};

/**
 * The plain fallback for `prefers-reduced-motion`, `saveData`, or a
 * detected low-end device — not read directly in JS; `globals.css`'s
 * `interest-simple-fade` keyframe hardcodes this same 160ms, kept here
 * so both are documented in the one timing module this task asks for.
 */
export const SIMPLE_FADE = {
  duration: 160,
};

/** The two `data-reveal-mode` values `useInterestImageReveal.ts` writes. */
export type RevealMode = "full" | "simple";
