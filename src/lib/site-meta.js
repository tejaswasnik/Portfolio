const DEFAULT_TITLE = "Tejas Wasnik";
const DEFAULT_DESCRIPTION = "Portfolio";

/**
 * Resolves the public-facing title/description/OG image/favicon from
 * siteSettings, with sane defaults when the document doesn't exist yet
 * (unseeded DB) — PRD 2.1/3.9: "SEO: title, description, OG image ...
 * all editable in admin."
 * @param {{ title?: string, description?: string, ogImage?: string, favicon?: string } | null} siteSettings
 */
export function resolveSiteMeta(siteSettings) {
  return {
    title: siteSettings?.title || DEFAULT_TITLE,
    description: siteSettings?.description || DEFAULT_DESCRIPTION,
    ogImage: siteSettings?.ogImage || undefined,
    favicon: siteSettings?.favicon || undefined,
  };
}

/**
 * CLAUDE.md: "maintenance mode shows the maintenance page to the public
 * while /admin keeps working." Pure so the (public) layout's gate is
 * testable without a live DB.
 * @param {{ maintenanceMode?: boolean } | null} siteSettings
 */
export function isMaintenanceModeOn(siteSettings) {
  return Boolean(siteSettings?.maintenanceMode);
}
