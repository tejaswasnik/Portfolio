"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRotatingIndex } from "@/hooks/useRotatingIndex.js";
import { DUR, EASE } from "@/lib/motion/tokens.js";

// DUR.ui (240ms) is the token table's own value for "pills, rotator
// swap" — using it directly, not a synthesized `DUR.ui * 1.5` (360ms),
// keeps this on-token and under the "UI feedback <= 240ms" cap.
const swapTransition = { duration: DUR.ui, ease: EASE.inOut };

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
 *
 * `useReducedMotion()`'s `useState` initializer reads `window.matchMedia`
 * synchronously on the client's very first render — the hydration pass
 * itself — while the server (no `window`) always renders the
 * non-reduced branch. With OS reduced-motion on, that made the client's
 * hydration-pass render branch into completely different markup (no
 * classNames/transition props) than what the server sent, which React
 * flags as a hydration mismatch (confirmed live via Playwright's
 * `reducedMotion: "reduce"` emulation). `mounted` only flips `true` in
 * an effect, so the hydration pass always matches SSR (non-reduced);
 * the real reduced-motion value only takes effect on the render after
 * that, same pattern as `Reveal.jsx`'s `shouldAnimate`/`useHeroPlayed`.
 * @param {{ roles: string[], intervalMs?: number }} props
 */
export default function RoleRotator({ roles, intervalMs = 2600 }) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- marks "past the hydration pass", see comment above
  useEffect(() => setMounted(true), []);
  const reducedMotion = mounted && prefersReducedMotion;
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
