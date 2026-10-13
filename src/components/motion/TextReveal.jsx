"use client";

import { motion } from "motion/react";
import { DUR, EASE, STAGGER } from "@/lib/motion/tokens.js";

const containerVariants = (delay) => ({
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER, delayChildren: delay } },
});

const wordVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: DUR.reveal, ease: EASE.out } },
};

/**
 * Hero name reveal (A5): each word slides up from behind a mask,
 * word-by-word. The real text stays in the DOM as the heading's
 * `aria-label` (and as plain text with JS disabled / before hydration,
 * since `as` renders a real `<h1>`/`<h2>`/`<span>` around it) — the
 * per-word `motion.span`s are `aria-hidden`, so a screen reader reads
 * the heading once, not word-by-word.
 * @param {{ text: string, as?: "h1"|"h2"|"span", delay?: number, className?: string }} props
 */
export default function TextReveal({ text, as: As = "span", delay = 0, className = "" }) {
  const words = text.split(" ");

  return (
    <As aria-label={text} className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={containerVariants(delay)}
        className="inline"
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            aria-hidden="true"
            className="inline-block overflow-hidden align-bottom"
          >
            <motion.span variants={wordVariants} className="inline-block">
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </As>
  );
}
