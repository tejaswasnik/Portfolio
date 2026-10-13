"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion/tokens.js";

/**
 * Contribution count-up (A10). Renders `to` directly — the exact final
 * number, server-rendered, correct with JS disabled, no hydration
 * mismatch — and only animates from 0 once it first enters view.
 * Writes each frame straight to the DOM node's `textContent` via
 * `useMotionValue`/`animate`'s `onUpdate`, not React state, so a 0.9s
 * count-up doesn't trigger ~54 re-renders at 60fps.
 * @param {{ to: number, duration?: number, className?: string }} props
 */
export default function CountUp({ to, duration = 0.9, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(to);

  useEffect(() => {
    if (!inView || reducedMotion) return;

    motionValue.set(0);
    const controls = animate(motionValue, to, {
      duration,
      ease: EASE.out,
      onUpdate: (value) => {
        if (ref.current) ref.current.textContent = String(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [inView, reducedMotion, to, duration, motionValue]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`.trim()}>
      {to}
    </span>
  );
}
