import ContactModalProvider from "@/components/public/ContactModalProvider";
import AnalyticsBeacon from "@/components/public/AnalyticsBeacon";
import InterestImages from "@/components/public/InterestImages";

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
 *
 * `interestImages` (default `[]`, so every call site that doesn't pass
 * it renders exactly as before) is the scattered margin decoration: an
 * `absolute inset-0 z-0` layer sized to a full-viewport-width wrapper —
 * not to `<main>` itself, which is only the 760px column and would clip
 * anything positioned in its margins. `<main>` sits inside that wrapper
 * at `relative z-10` so it (and everything in it) always paints above.
 * @param {{ children: React.ReactNode, className?: string, interestImages?: Array }} props
 */
export default function PageFrame({ children, className = "", interestImages = [] }) {
  return (
    <div className="relative overflow-x-clip">
      <InterestImages items={interestImages} />
      <main className={`relative z-10 mx-auto max-w-column ${className}`.trim()}>
        <Rails />
        <AnalyticsBeacon />
        <ContactModalProvider>{children}</ContactModalProvider>
      </main>
      <BottomBlur />
    </div>
  );
}

/**
 * Progressive frosted-glass blur pinned to the viewport's bottom edge —
 * full strength at the very bottom, fading to none ~120px up via a mask
 * (not a flat fade-to-color, so it blurs whatever scrolls underneath
 * rather than hiding behind a background tint). Decorative only.
 */
export function BottomBlur() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-32 backdrop-blur-md [mask-image:linear-gradient(to_top,black,transparent)]"
    />
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
