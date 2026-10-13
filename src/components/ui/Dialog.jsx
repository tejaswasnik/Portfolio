"use client";

import { useId, useRef } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap.js";

/**
 * Accessible modal dialog. Chrome (overlay, panel radius/border, header
 * layout) follows the contact form modal (Figma 74:1105); focus trap,
 * Esc-to-close and aria wiring have no Figma frame and are built from
 * tokens (see docs/PROGRESS.md "Designed by me").
 *
 * Below `sm` (640px) every dialog becomes a full-width bottom sheet
 * (design.md §22 "< 520... becomes a full-width bottom sheet" for the
 * contact modal, §23 "Dialogs and the icon picker become bottom sheets"
 * for admin — consolidated on one breakpoint rather than building two
 * slightly different responsive behaviours for the same primitive).
 * @param {{open: boolean, onClose: () => void, title: string, children: React.ReactNode}} props
 */
export default function Dialog({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return (
    <div className="animate-overlay-in fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-bg/80 sm:items-center sm:p-6">
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
        className="animate-panel-in relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border-subtle bg-surface-1 p-6 sm:max-w-[520px] sm:rounded-2xl sm:p-8"
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
            className="font-mono text-[11px] uppercase tracking-[1px] text-text-muted transition-colors hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ESC ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
