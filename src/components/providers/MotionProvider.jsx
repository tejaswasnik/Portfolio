"use client";

import { MotionConfig } from "motion/react";
import { DUR, EASE } from "@/lib/motion/tokens.js";

/**
 * Makes every `motion/react` animation in the public site respect the
 * OS `prefers-reduced-motion` setting (`reducedMotion="user"` — Motion
 * strips translate/scale/rotate from any animation automatically when
 * the user has it on, which is why the per-component reduced-motion
 * checks in this codebase only need to handle what Motion can't:
 * looping animations like the role rotator, and anything driven by
 * plain CSS instead of Motion).
 *
 * Outermost of the three public providers (public layout order:
 * MotionProvider > TransitionProvider > SmoothScroll) so the page
 * transition's own choreography can read the same reduced-motion
 * state Motion resolves here.
 */
export default function MotionProvider({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: DUR.ui, ease: EASE.out }}>
      {children}
    </MotionConfig>
  );
}
