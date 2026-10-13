import MaintenanceView from "@/components/public/MaintenanceView";
import SmoothScroll from "@/components/ui/SmoothScroll.jsx";
import { getPublicSiteSettings } from "@/lib/db/cache";
import { getSiteUrl } from "@/lib/site-url.js";
import { isMaintenanceModeOn, resolveSiteMeta } from "@/lib/site-meta.js";

/**
 * PRD 2.1 SEO (title/description/OG image, all editable in admin) and
 * 3.9 maintenance mode, both driven by siteSettings — scoped to the
 * (public) route group so /admin (step 7+) keeps its own metadata and
 * is never affected by maintenanceMode. Each page's own `metadata`/
 * `generateMetadata` export still overrides these per-field (Next
 * merges child metadata over the parent's).
 */
export async function generateMetadata() {
  const siteSettings = await getPublicSiteSettings();
  const { title, description, ogImage, favicon } = resolveSiteMeta(siteSettings);

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default async function PublicLayout({ children }) {
  const siteSettings = await getPublicSiteSettings();

  // CLAUDE.md: "maintenance mode shows the maintenance page to the
  // public while /admin keeps working" — /admin lives outside this
  // route group entirely, so it's unaffected by this gate. No
  // middleware.js exists yet; this is the whole maintenance-mode
  // implementation (docs/DECISIONS.md step 6).
  if (isMaintenanceModeOn(siteSettings)) {
    return <MaintenanceView />;
  }

  return (
    <>
      <SmoothScroll />
      {children}
    </>
  );
}
