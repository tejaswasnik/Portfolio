import ContactModalProvider from "@/components/public/ContactModalProvider";
import AnalyticsBeacon from "@/components/public/AnalyticsBeacon";

/**
 * The "drafting table" page chrome (docs/design.md §5): two full-height
 * dashed rails flanking the 760px content column, with small crosshair
 * marks where a rail meets a section divider. Rails are desktop-only
 * (≥1200px per docs/design.md §10); content stays centered below that.
 *
 * Also mounts the single contact modal (step 5) for the whole page via
 * ContactModalProvider, so every public page gets "Message me"/"Let's
 * Talk" wiring for free without each page managing its own modal state,
 * and the page-view analytics beacon (step 11) for the same reason —
 * only public pages use `PageFrame`, so admin pages never beacon.
 */
export default function PageFrame({ children, className = "" }) {
  return (
    <main className={`relative mx-auto max-w-column ${className}`.trim()}>
      <Rails />
      <AnalyticsBeacon />
      <ContactModalProvider>{children}</ContactModalProvider>
    </main>
  );
}

/** The two full-height dashed verticals at the column edges. */
export function Rails() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden xl:block"
    >
      <div className="absolute inset-y-0 left-0 w-px border-l border-dashed border-rail" />
      <div className="absolute inset-y-0 right-0 w-px border-l border-dashed border-rail" />
    </div>
  );
}

/**
 * A `+` mark where a rail meets a section divider.
 * @param {{side: 'left'|'right'}} props
 */
export function Crosshair({ side = "left" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-0 hidden size-3.5 -translate-y-1/2 items-center justify-center bg-bg xl:flex ${
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      }`}
    >
      <span className="absolute h-px w-2.5 bg-rail-node" />
      <span className="absolute h-2.5 w-px bg-rail-node" />
    </span>
  );
}
