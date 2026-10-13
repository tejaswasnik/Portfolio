"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce`. The global CSS override
 * (src/styles/globals.css) already collapses every CSS transition/
 * animation under reduced motion automatically — this hook exists only
 * for the few effects that bypass CSS entirely (WAAPI's
 * `element.animate()`, e.g. ThemeToggle's view-transition wipe).
 * @returns {boolean}
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(query.matches);
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
