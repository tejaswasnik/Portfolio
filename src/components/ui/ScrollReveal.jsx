"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Images (banner GIF, profile photo, project covers, etc.) finish loading
// after ScrollTrigger first measures trigger positions, which leaves
// thresholds stale against the pre-image-load layout. `load` covers that;
// module-level and guarded so repeated ScrollReveal mounts register it once.
if (typeof window !== "undefined" && !window.__scrollRevealLoadListenerAdded) {
  window.__scrollRevealLoadListenerAdded = true;
  if (document.readyState === "complete") {
    // `load` already fired before this module ran (e.g. fast dev reload).
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }
}

/**
 * Fades/slides its children in once, the first time they scroll into
 * view. Skips the animation entirely under `prefers-reduced-motion`
 * (CLAUDE.md accessibility rule) by gating the whole setup behind
 * `gsap.matchMedia()` — the reduced-motion branch just never runs, so
 * content renders in its final state immediately.
 * @param {{ children: React.ReactNode, y?: number, duration?: number, start?: string }} props
 */
export default function ScrollReveal({ children, y = 20, duration = 0.6, start = "top 85%" }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          opacity: 0,
          y,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start,
            once: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
