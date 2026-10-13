"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion.js";

/**
 * Sun/moon icon toggle. Flips data-theme on <html> and persists to
 * localStorage, wrapped in a circular View Transition wipe from the
 * clicked point (ported from magicui's animated-theme-toggler, adapted
 * to this project's data-theme attribute instead of a "dark" class —
 * falls back to an instant flip where the View Transitions API is
 * unavailable, e.g. Safari/Firefox without the flag, or where
 * prefers-reduced-motion is on — the wipe is WAAPI-driven so it bypasses
 * the global CSS reduced-motion override (docs/motion.md §7).
 */
export default function ThemeToggle() {
  const reducedMotion = useReducedMotion();
  // Starts null (renders nothing) so server and first client render match;
  // the effect then reads the real theme the no-flash script already set.
  // Reading DOM state after mount is the correct pattern here, not state
  // that should be derived during render, so the lint rule is suppressed.
  const [theme, setTheme] = useState(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);

  function applyTheme(next) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
  }

  function toggle() {
    const next = theme === "light" ? "dark" : "light";

    if (reducedMotion || typeof document.startViewTransition !== "function" || !buttonRef.current) {
      applyTheme(next);
      return;
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
          { duration: 400, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggle}
      aria-label={
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      }
      aria-pressed={theme === "light"}
      className="relative flex size-4 items-center justify-center text-text-secondary transition-colors before:absolute before:-inset-[14px] before:content-[''] hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        {theme === "light" ? (
          <path
            d="M8 1v2M8 13v2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M1 8h2M13 8h2M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M13.5 8.7A5.5 5.5 0 0 1 7.3 2.5a5.5 5.5 0 1 0 6.2 6.2Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
