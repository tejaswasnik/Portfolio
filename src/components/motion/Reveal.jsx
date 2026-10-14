"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
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
 *
 * Reduced motion: `MotionConfig`'s `reducedMotion="user"` (MotionProvider)
 * only auto-strips *positional* keys (x/y/scale/rotate/etc, per Motion's
 * own `positionalKeys` list) to an instant jump — `filter` isn't on that
 * list, so the `blur(4px)->blur(0)` half of `revealVariants` would still
 * visibly transition over 500ms if left to that global behaviour alone.
 * The Global Constraints rule ("no translate/scale/blur" under reduced
 * motion) needs blur suppressed too, so `useReducedMotion()` is checked
 * here directly: content never leaves the "visible" variant's static
 * values at all (no hidden phase, no transition), the same way
 * `RoleRotator` bypasses Motion's animation entirely rather than relying
 * on the automatic strip.
 * @param {{
 *   as?: string, delay?: number, stagger?: boolean, className?: string,
 *   children: React.ReactNode,
 * }} props
 */
export default function Reveal({ as = "div", delay = 0, stagger = false, className = "", children }) {
  const ref = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) {
      setShouldAnimate(true);
    }
  }, [reducedMotion]);

  const MotionTag = motion[as] ?? motion.div;

  const variants = stagger
    ? { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: delay } } }
    : { ...revealVariants, visible: { ...revealVariants.visible, transition: { ...revealVariants.visible.transition, delay } } };

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={reducedMotion ? false : shouldAnimate ? "hidden" : false}
      whileInView={reducedMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/**
 * A stagger child — only meaningful as a direct child of `<Reveal stagger>`.
 *
 * Exported by name (not just as `Reveal.Item`, though that's kept too for
 * client-side callers): a server component importing this "use client"
 * module gets a client-reference *proxy* for `Reveal`, not the real
 * function object, so a static property hung off it at runtime
 * (`Reveal.Item = Item`) doesn't survive that boundary and resolves to
 * `undefined` — crashing with "Element type is invalid" the moment a
 * server component (`AboutSection`, `ProjectsSection`, `LetsTalkSection`)
 * renders `<Reveal.Item>`. Each import statement needs its own named
 * binding to get its own proxy.
 */
export function RevealItem({ as = "div", className = "", children, ...rest }) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag className={className} variants={revealVariants} {...rest}>
      {children}
    </MotionTag>
  );
}

Reveal.Item = RevealItem;
