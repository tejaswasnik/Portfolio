/**
 * The single source of every motion value used by the micro-animation
 * layer (docs/superpowers/plans/2026-10-13-portfolio-micro-animations.md
 * "Global Constraints": "no inline magic numbers in components"). CSS
 * needs the same values in a different shape — see `src/styles/motion.css`,
 * kept hand-in-sync with this file (a build step to generate one from
 * the other isn't worth it for nine constants).
 */

/** `motion/react` accepts a cubic-bezier array directly as an easing. */
export const EASE = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
};

/** Seconds — `motion/react`'s own unit, unlike CSS's `ms`. */
export const DUR = {
  press: 0.12,
  hover: 0.18,
  ui: 0.24,
  reveal: 0.5,
};

export const STAGGER = 0.04;

export const SPRING = {
  layout: { type: "spring", stiffness: 500, damping: 40, mass: 0.8 },
  magnetic: { type: "spring", stiffness: 300, damping: 20, mass: 0.5 },
};

/**
 * Shared `whileInView` variants for one-time section reveals (A8):
 * `src/components/motion/Reveal.jsx`'s default. Blur bridges the state
 * change per the spec's design principle #5 ("reads as focus pulling,
 * hides the small translate").
 * @type {import('motion/react').Variants}
 */
export const revealVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DUR.reveal, ease: EASE.out },
  },
};
