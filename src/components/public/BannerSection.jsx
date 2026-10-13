"use client";

import { motion } from "motion/react";
import BannerMedia from "./BannerMedia";
import { useHeroPlayed } from "@/hooks/useHeroPlayed.js";

/**
 * Banner section wrapper (Figma 5:5326) — toggleable independently of
 * Profile. Part of the hero sequence (A5): fades in over 0.6s, once per
 * session (`useHeroPlayed`) — `MotionConfig`'s `reducedMotion="user"`
 * (set in MotionProvider) already drops this to an instant appearance
 * under `prefers-reduced-motion`.
 */
export default function BannerSection({ bannerUrl }) {
  const heroPlayed = useHeroPlayed();

  return (
    <motion.div
      className="relative px-6 pt-6"
      initial={heroPlayed ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
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
