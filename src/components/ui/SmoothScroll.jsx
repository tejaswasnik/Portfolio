"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis-driven smooth scrolling for the public site (docs/motion.md's
 * "every scroll interaction gets a deliberate feel" direction). Renders
 * nothing — it only drives `window` scrolling, so SideIndex's native
 * `scroll`-event scroll-spy and Reveal's IntersectionObserver keep
 * working unchanged (Lenis moves real `window.scrollY`, it doesn't
 * virtualize scroll in a wrapper).
 *
 * Skipped entirely under `prefers-reduced-motion: reduce` per
 * CLAUDE.md's accessibility rule — native instant scrolling then applies,
 * same as before this component existed.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    // In-page anchors (e.g. SideIndex's `#about`/`#projects` links) jump
    // natively by default — route them through Lenis so the click itself
    // scrolls smoothly too, not just wheel/trackpad input.
    function handleAnchorClick(event) {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target);
    }
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
