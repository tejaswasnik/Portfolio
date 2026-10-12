"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Accessible modal dialog. Chrome (overlay, panel radius/border, header
 * layout) follows the contact form modal (Figma 74:1105); focus trap,
 * Esc-to-close and aria wiring have no Figma frame and are built from
 * tokens (see docs/PROGRESS.md "Designed by me").
 * @param {{open: boolean, onClose: () => void, title: string, children: React.ReactNode}} props
 */
export default function Dialog({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;
    const focusable = panel?.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/80 p-6 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[520px] rounded-2xl border border-border-subtle bg-surface-1 p-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id={titleId}
            className="font-serif text-[28px] leading-[1.1] text-text-primary sm:text-[36px]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] uppercase tracking-[1px] text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ESC ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
