"use client";

/**
 * Sends one analytics beacon to `POST /api/track` (PRD §3.2). Uses
 * `navigator.sendBeacon` when available — it survives the page
 * unloading (critical for outbound link clicks, which navigate away
 * immediately) — falling back to a `keepalive` fetch. Fire-and-forget:
 * never awaited by callers, never throws, and does nothing during SSR.
 * @param {'view' | 'click'} type
 * @param {{ path?: string, target?: string }} [extra]
 */
export function trackEvent(type, extra = {}) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    type,
    path: extra.path ?? window.location.pathname,
    target: extra.target ?? "",
    referrer: document.referrer ?? "",
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
      return;
    }
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(
      () => {},
    );
  } catch {
    // Never let a tracking failure affect the page.
  }
}

/** Convenience wrapper for a tracked link's onClick — tracks, then lets the navigation proceed. */
export function trackClick(target) {
  return () => trackEvent("click", { target });
}
