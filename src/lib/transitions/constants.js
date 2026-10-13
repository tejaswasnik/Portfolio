/**
 * Every timing value for the "drafting a new sheet" page transition, in
 * one place (task spec §"Shared requirements": "all timing values in
 * one exported constants module"). Durations in ms unless noted.
 *
 * The three beats overlap by design (spec: "three overlapping beats"),
 * so these windows aren't meant to sum to TOTAL_MS — TOTAL_MS is the
 * rough perceived budget the spec states (420-520ms), not a hard
 * ceiling every sub-animation must individually fit inside.
 */

export const TOTAL_MS = { min: 420, max: 520 };

/** Beat 1 — strike out: outgoing column lifts/fades/scales down, sections stagger top-down. */
export const LEAVE = {
  duration: 0.18, // 0-180ms
  lift: 8, // px
  scale: 0.995,
  stagger: 0.018, // 18ms between section blocks
  ease: "power2.inOut", // cubic-bezier(.4,0,.2,1)
};

/** Beat 2 — the rule sweeps: the signature moment. */
export const SWEEP = {
  start: 0.12, // 120ms
  duration: 0.26, // ends ~380ms
  ease: "power3.inOut", // cubic-bezier(.65,0,.35,1)
  hatchBandFade: 0.2, // 200ms
  crosshairFade: 0.24, // 240ms
};

/** Beat 3 — draw in: rails draw down, then content fades up, heading first. */
export const ENTER = {
  railsStart: 0.26, // 260ms
  railsDuration: 0.32, // 320ms
  contentStart: 0.34, // content fade-up begins while rails are still drawing
  contentRise: 10, // px
  contentDuration: 0.3,
  stagger: 0.018, // reversed order from leave: heading lands first
  hatchWipeDuration: 0.28, // 280ms
};

/** The bottom-left drafting-note label during Beat 2. */
export const NOTE = {
  inAt: 0.16, // 160ms
  outAt: 0.4, // 400ms
  fadeDuration: 0.12,
};

/** Reduced motion: a single opacity fade, no sweep/stagger/flight. */
export const REDUCED_MOTION = {
  duration: 0.12,
};

/** Shared-element (heading/cover) flight. */
export const FLIP = {
  duration: 0.42,
  ease: "power3.inOut",
};

export const Z_INDEX = {
  overlay: 70, // above Toaster's z-[60], below nothing (it's the topmost chrome during a transition)
};
