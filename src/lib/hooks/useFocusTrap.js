"use client";

import { useEffect } from "react";

/**
 * Traps Tab focus inside `containerRef` while `active`, focuses the
 * first focusable element on activation, calls `onEscape` on Esc, and
 * restores focus to whatever was focused before on deactivation.
 * Shared by `Dialog` and the admin sidebar's off-canvas drawer (fixes
 * round 2, Fix 4) — the exact same focus-trap/Esc/restore-focus pattern
 * both need, now written once.
 * @param {React.RefObject<HTMLElement>} containerRef
 * @param {boolean} active
 * @param {() => void} onEscape
 */
export function useFocusTrap(containerRef, active, onEscape) {
  useEffect(() => {
    if (!active) return;

    const panel = containerRef.current;
    const previouslyFocused = document.activeElement;
    const focusable = panel?.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onEscape();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- containerRef is a stable ref object; onEscape identity churn shouldn't re-run the trap
  }, [active]);
}
