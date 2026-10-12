/**
 * Pure logic behind `Toaster`/`useToast` (fixes round 2, Fix 5), kept
 * dependency-free so it can be unit tested without a DOM — this
 * project's Vitest config runs with `environment: "node"` (no jsdom),
 * the same "pure, DOM/DB-mock-free helper" pattern used throughout
 * (`filterAdminProjects`, the analytics aggregations, etc.). The
 * component itself (timers, hover/focus pause, actual rendering) isn't
 * unit tested for the same reason — see docs/DECISIONS.md "Fix 5".
 */

/** design.md §21: 4s for success/info, 8s (or until closed) for errors. */
export const DEFAULT_TOAST_DURATION = { success: 4000, info: 4000, error: 8000 };

/** design.md §21: "max 3 visible", newest at the bottom of the stack. */
export const MAX_VISIBLE_TOASTS = 3;

/**
 * Appends a toast and trims the stack to the most recent
 * `MAX_VISIBLE_TOASTS`, oldest-first-out.
 * @param {Array<{ id: number }>} toasts
 * @param {{ id: number }} toast
 */
export function pushToast(toasts, toast) {
  const next = [...toasts, toast];
  return next.length > MAX_VISIBLE_TOASTS ? next.slice(next.length - MAX_VISIBLE_TOASTS) : next;
}

/** @param {Array<{ id: number }>} toasts @param {number} id */
export function dismissToast(toasts, id) {
  return toasts.filter((t) => t.id !== id);
}

/**
 * design.md §21's type -> ARIA role rule: error toasts are `role="alert"`
 * (assertive), everything else relies on the shared viewport's
 * `aria-live="polite"` container.
 * @param {"success" | "error" | "info"} type
 */
export function toastRole(type) {
  return type === "error" ? "alert" : undefined;
}
