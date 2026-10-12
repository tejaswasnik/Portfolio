import PageFrame from "@/components/ui/PageFrame";
import Nav from "@/components/public/Nav";
import SectionDivider from "@/components/ui/SectionDivider";

/**
 * Maintenance screen (Figma 74:2, "logo-only nav" per docs/figma-map.md
 * — the actual frame screenshot shows the full Home/Projects/theme-toggle
 * nav, which wins per CLAUDE.md's "Figma wins" rule; see
 * docs/DECISIONS.md step 6). Rendered directly at /maintenance, and
 * swapped in for every public route by (public)/layout.js whenever
 * siteSettings.maintenanceMode is true — /admin is a separate route
 * tree entirely, so it keeps working untouched.
 */
export default function MaintenanceView() {
  return (
    <PageFrame>
      <Nav />
      <section aria-labelledby="maintenance-heading">
        <SectionDivider />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 py-20 text-center">
          <span className="rounded-pill border border-dashed border-border-chip-dashed px-3 py-1.5 font-mono text-[11px] tracking-[1px] text-text-chip">
            MAINTENANCE MODE
          </span>
          <h1
            id="maintenance-heading"
            className="font-serif text-[56px] leading-[1.1] tracking-[-1px] text-text-primary sm:text-[80px]"
          >
            Back soon.
          </h1>
          <p className="max-w-[460px] text-[16px] leading-[1.63] text-text-secondary">
            I&rsquo;m making a few improvements to the site. It will be back online
            shortly.
          </p>
          <p className="font-mono text-[11px] tracking-[1px] text-text-muted">— TW.</p>
        </div>
      </section>
    </PageFrame>
  );
}
