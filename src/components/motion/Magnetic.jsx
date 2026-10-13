"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { SPRING } from "@/lib/motion/tokens.js";

/**
 * Pure offset math for the magnetic pull (A12), split out from the
 * component so it's testable without mounting anything: `strength`
 * scales the cursor's distance from the element's center, `max` clamps
 * each axis independently so the pull never exceeds the plan's 6px cap
 * regardless of how far the cursor actually is.
 * @param {number} dx
 * @param {number} dy
 * @param {number} strength
 * @param {number} max
 * @returns {{ x: number, y: number }}
 */
export function magneticOffset(dx, dy, strength, max) {
  const clamp = (value) => Math.max(-max, Math.min(max, value));
  return { x: clamp(dx * strength), y: clamp(dy * strength) };
}

/**
 * Magnetic CTA wrapper (A12, "Let's Talk" footer button). Pulls its
 * children up to `max`px toward the cursor on pointermove, spring-eases
 * back to 0 on pointerleave via `SPRING.magnetic`. No listeners are
 * attached — children render completely unaffected — on touch/stylus
 * input (`pointer: fine` fails) or under reduced motion, matching the
 * plan's touch-device exclusion and the global reduced-motion rule.
 * @param {{ strength?: number, max?: number, className?: string, children: import('react').ReactNode }} props
 */
export default function Magnetic({ strength = 0.25, max = 6, className = "", children }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING.magnetic);
  const springY = useSpring(y, SPRING.magnetic);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    function handlePointerMove(event) {
      const rect = node.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const offset = magneticOffset(dx, dy, strength, max);
      x.set(offset.x);
      y.set(offset.y);
    }

    function handlePointerLeave() {
      x.set(0);
      y.set(0);
    }

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reducedMotion, strength, max, x, y]);

  return (
    <motion.span
      ref={ref}
      style={{ display: "inline-block", x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
