import Link from "next/link";
import PageFrame from "@/components/ui/PageFrame";
import Nav from "@/components/public/Nav";
import SectionDivider from "@/components/ui/SectionDivider";
import LetsTalkSection from "@/components/public/LetsTalkSection";
import { getPublicProfile, getPublicSiteSettings } from "@/lib/db/cache";

// Matches Button's primary/dashed-pill variants as links (Button only
// renders a <button> — docs/DECISIONS.md step 3/4 duplicate these for
// the same reason; "VIEW PROJECTS" here is a dashed *pill*, not the
// rounded-lg dashed Button.jsx normally uses — Figma 74:740).
const goHomeClass =
  "inline-flex h-11 items-center justify-center rounded-pill bg-cta-bg border border-cta-bg px-6 text-sm font-medium text-cta-text transition-colors hover:bg-text-primary";
const viewProjectsClass =
  "inline-flex h-11 items-center justify-center rounded-pill border border-dashed border-border-default px-6 font-mono text-xs uppercase tracking-[1px] text-text-primary hover:border-accent/50";

/**
 * 404 screen (Figma 74:370). Used by the root src/app/not-found.js —
 * Next only guarantees catching a genuinely unmatched URL (no segment
 * matched at all) via a *root* not-found.js, not one nested inside the
 * (public) route group, so the real implementation lives here instead
 * of src/app/(public)/not-found.js per docs/ARCHITECTURE.md's diagram
 * (docs/DECISIONS.md step 6). The explicit notFound() call in
 * /projects/[slug] (step 4) already bubbles up to this same boundary.
 */
export default async function NotFoundView() {
  const [profile, siteSettings] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);

  return (
    <PageFrame>
      <Nav />

      <section aria-labelledby="not-found-heading">
        <SectionDivider />
        <div className="flex flex-col items-center gap-5 px-6 py-20 text-center">
          <p className="font-mono text-[11px] tracking-[1px] text-text-chip">
            ERROR 404
          </p>
          <p className="font-serif text-[88px] leading-[1] tracking-[-2px] text-text-muted sm:text-[140px]">
            404
          </p>
          <h1
            id="not-found-heading"
            className="font-serif text-[32px] leading-[1.2] text-text-primary sm:text-[40px]"
          >
            This page wandered off.
          </h1>
          <p className="max-w-[460px] text-[16px] leading-[1.63] text-text-secondary">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link href="/" className={goHomeClass}>
              Go home
            </Link>
            <Link href="/projects" className={viewProjectsClass}>
              View projects
            </Link>
          </div>
        </div>
      </section>

      <LetsTalkSection
        heading={profile?.letsTalkHeading}
        subtext={profile?.letsTalkSubtext}
        footerText={siteSettings?.footerText}
      />
    </PageFrame>
  );
}
