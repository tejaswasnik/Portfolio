"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades/slides its children in once, the first time they scroll into
 * view (docs/motion.md §3/§6, signature moment #3). Plain CSS transition
 * (the `.reveal`/`.reveal.is-visible` classes in globals.css) driven by
 * one IntersectionObserver — no GSAP/ScrollTrigger, since nothing here
 * needs timeline sequencing or scroll-scrubbing (see motion.md §6's GSAP
 * decision). The global `prefers-reduced-motion` CSS override already
 * collapses the transition to near-instant, so content just appears.
 *
 * `baseClass` swaps the CSS driving the reveal — e.g. GithubHeatmap uses
 * `"heatmap-wipe"` for its left-to-right clip-path sweep (signature
 * moment #2) instead of the default fade+slide, reusing this same
 * observer rather than duplicating it.
 * @param {{ children: React.ReactNode, baseClass?: string }} props
 */
export default function Reveal({ children, baseClass = "reveal" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${baseClass}${visible ? " is-visible" : ""}`}>
      {children}
    </div>
  );
}
