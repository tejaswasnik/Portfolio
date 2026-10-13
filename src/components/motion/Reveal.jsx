"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { revealVariants } from "@/lib/motion/tokens.js";

/**
 * One-time section reveal (A8) — heading + body fade up 8px with blur,
 * once, at 25% in view. Replaces the generic (CSS/IntersectionObserver)
 * `src/components/ui/Reveal.jsx` for this use; that file stays for its
 * one other job, GithubHeatmap's "heatmap-wipe" clip-path signature
 * moment, which is a different, more specialized animation this
 * component doesn't cover.
 *
 * "Server-rendered HTML must be readable with JS disabled... in-view
 * reveals must not hide content before hydration": every section
 * renders fully visible by default (`shouldAnimate` starts `false`).
 * Only once a `useLayoutEffect` confirms — synchronously, before the
 * browser paints, so there's no flash — that the section is actually
 * below the fold at mount does it switch to the animated hidden->visible
 * variants. A section that's already in the initial viewport (the hero
 * area, effectively) just appears; nothing above the fold waits on
 * Motion to decide it's "in view".
 * @param {{
 *   as?: string, delay?: number, stagger?: boolean, className?: string,
 *   children: React.ReactNode,
 * }} props
 */
export default function Reveal({ as = "div", delay = 0, stagger = false, className = "", children }) {
  const ref = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      setShouldAnimate(true);
    }
  }, []);

  const MotionTag = motion[as] ?? motion.div;

  const variants = stagger
    ? { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: delay } } }
    : { ...revealVariants, visible: { ...revealVariants.visible, transition: { ...revealVariants.visible.transition, delay } } };

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={shouldAnimate ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/** A stagger child — only meaningful as a direct child of `<Reveal stagger>`. */
function Item({ as = "div", className = "", children }) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag className={className} variants={revealVariants}>
      {children}
    </MotionTag>
  );
}

Reveal.Item = Item;
