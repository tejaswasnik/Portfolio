"use client";

import { motion, useReducedMotion } from "motion/react";
import BannerMedia from "./BannerMedia";
import { useHeroPlayed } from "@/hooks/useHeroPlayed.js";

/**
 * Banner section wrapper (Figma 5:5326) — toggleable independently of
 * Profile. Part of the hero sequence (A5): fades in over 0.6s, once per
 * session (`useHeroPlayed`).
 *
 * `MotionConfig`'s `reducedMotion="user"` does NOT shorten this on its
 * own — it only auto-strips positional keys (x/y/scale/rotate), and
 * opacity isn't one of them, so a bare `transition={{duration:0.6}}`
 * would still play the full 600ms fade under OS reduced-motion,
 * exceeding the Global Constraints' "opacity fades of <=150ms allowed"
 * allowance. Snapping the duration here (not touching `initial`, which
 * governs the server-rendered starting style) keeps this hydration-safe
 * the same way `ProfileIdentity`'s avatar fix does.
 */
export default function BannerSection({ bannerUrl }) {
  const heroPlayed = useHeroPlayed();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative px-6 pt-6"
      initial={heroPlayed ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.6 }}
    >
      <BannerMedia bannerUrl={bannerUrl} />
      {/* Orbit dot (design.md §5/§8, docs/motion.md signature moment #1) —
          a continuous, slow ambient drift; removed entirely (not slowed)
          under prefers-reduced-motion by the global CSS override. */}
      <span
        aria-hidden="true"
        className="orbit-dot pointer-events-none absolute right-10 top-7 size-1.5 rounded-full bg-accent"
      />
    </motion.div>
  );
}
