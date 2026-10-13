"use client";

import { useEffect } from "react";

/**
 * Warns before a tab close/reload discards unsaved form edits (UX-02).
 * Browsers ignore any custom message and show their own generic prompt
 * — the `beforeunload` listener only needs to call `preventDefault()`.
 *
 * Deliberately doesn't intercept in-app navigation (sidebar links,
 * router.push) — that needs either a client-side router guard Next's
 * App Router doesn't expose yet, or per-link click interception across
 * every nav surface, both a materially larger change than this fix.
 */
export function useUnsavedChangesWarning(isDirty) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
