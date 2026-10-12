"use client";

import { useEffect, useState } from "react";

/** Sun/moon icon toggle. Flips data-theme on <html> and persists to localStorage. */
export default function ThemeToggle() {
  // Starts null (renders nothing) so server and first client render match;
  // the effect then reads the real theme the no-flash script already set.
  // Reading DOM state after mount is the correct pattern here, not state
  // that should be derived during render, so the lint rule is suppressed.
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      }
      aria-pressed={theme === "light"}
      className="flex size-4 items-center justify-center text-text-secondary transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
