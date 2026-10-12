"use client";

import { useToast } from "@/components/ui/Toaster";

/**
 * Wraps an already-awaited server action result in the right toast
 * (design.md §21: "no silent successes, no silent failures") — call it
 * right after `await someAction(...)`, same place every admin component
 * already checks `result.ok`. Returns whether it succeeded so callers
 * can still run their own follow-up (closing a dialog, refreshing the
 * list) without duplicating the ok/error branch.
 * @returns {(result: { ok: boolean, error?: string }, successMessage?: string) => boolean}
 */
export function useActionToast() {
  const toast = useToast();

  return function notify(result, successMessage) {
    if (result.ok) {
      if (successMessage) toast.success(successMessage);
      return true;
    }
    toast.error(result.error || "Something went wrong. Please try again.");
    return false;
  };
}
