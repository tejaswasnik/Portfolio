"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRotatingIndex } from "@/hooks/useRotatingIndex.js";
import { DUR, EASE } from "@/lib/motion/tokens.js";

const swapTransition = { duration: DUR.ui * 1.5, ease: EASE.inOut };

/**
 * Hero's "5 role lines" (A6), now one rotating line (vertical slide +
 * blur swap, container width animates with `layout`). Under reduced
 * motion it's just the first role, static, forever — `useReducedMotion`
 * is checked instead of only relying on `MotionConfig`'s automatic
 * stripping, because the stripping only applies to things Motion
 * itself animates: it wouldn't stop `useRotatingIndex`'s timer from
 * still cycling the *text* underneath a now-motionless swap.
 *
 * No `aria-live` region — a role cycling every 2.6s would spam a screen
 * reader continuously. Instead the container's `aria-label` states the
 * full set once; the visibly-cycling text is `aria-hidden`.
 * @param {{ roles: string[], intervalMs?: number }} props
 */
export default function RoleRotator({ roles, intervalMs = 2600 }) {
  const reducedMotion = useReducedMotion();
  const index = useRotatingIndex(roles.length, intervalMs, { paused: reducedMotion });
  const role = roles[index] ?? roles[0] ?? "";

  if (reducedMotion) {
    return (
      <span aria-label={roles.join(", ")}>
        <span aria-hidden="true">{roles[0]}</span>
      </span>
    );
  }

  return (
    <motion.span layout className="inline-block overflow-hidden align-bottom" aria-label={roles.join(", ")}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={role}
          aria-hidden="true"
          initial={{ y: "60%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-60%", opacity: 0, filter: "blur(4px)" }}
          transition={swapTransition}
          className="inline-block"
        >
          {role}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
