/**
 * Where each media file is currently referenced, computed live by
 * matching its `url` against the real profile/siteSettings/projects
 * documents — not a stored `usedIn` tag. Project covers/screenshots and
 * the profile photo never persist a fileId back onto their owning
 * document (docs/DECISIONS.md step 9), so the url is the only reliable
 * join key, and a live join can't go stale the way a tag written once at
 * upload time would.
 */

export const MEDIA_CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "banner", label: "Banner" },
  { value: "profile", label: "Profile" },
  { value: "projects", label: "Projects" },
  { value: "resume", label: "Resume" },
  { value: "unused", label: "Unused" },
];

/**
 * @param {string} url
 * @param {{
 *   profile?: { bannerUrl?: string, photoUrl?: string, resumeUrl?: string } | null,
 *   siteSettings?: { ogImage?: string, favicon?: string } | null,
 *   projects?: Array<{ name: string, coverImage?: string, screenshots?: string[] }>,
 * }} context
 * @returns {Array<{ category: string, label: string }>}
 */
export function computeFileUsage(url, { profile, siteSettings, projects = [] } = {}) {
  const usage = [];
  if (!url) return usage;

  if (profile?.bannerUrl === url) usage.push({ category: "banner", label: "Banner" });
  if (profile?.photoUrl === url) usage.push({ category: "profile", label: "Profile photo" });
  if (profile?.resumeUrl === url) usage.push({ category: "resume", label: "Resume" });
  if (siteSettings?.ogImage === url) usage.push({ category: "profile", label: "OG image" });
  if (siteSettings?.favicon === url) usage.push({ category: "profile", label: "Favicon" });

  for (const project of projects) {
    if (project.coverImage === url) {
      usage.push({ category: "projects", label: `${project.name} · Cover` });
    }
    for (const screenshot of project.screenshots ?? []) {
      if (screenshot === url) {
        usage.push({ category: "projects", label: `${project.name} · Screenshot` });
      }
    }
  }

  return usage;
}

/**
 * Attaches a computed `usage` array to every media document.
 * @param {Array<{ url: string }>} media
 * @param {Parameters<typeof computeFileUsage>[1]} context
 */
export function annotateMediaUsage(media, context) {
  return media.map((file) => ({ ...file, usage: computeFileUsage(file.url, context) }));
}

/**
 * Narrows an already-annotated media list (see `annotateMediaUsage`) by
 * the toolbar's category segment and search text.
 * @param {Array<{ name: string, usage: Array<{ category: string }> }>} media
 * @param {{ category?: string, search?: string }} [filters]
 */
export function filterMediaList(media, { category, search } = {}) {
  let result = media;

  if (category && category !== "all") {
    result =
      category === "unused"
        ? result.filter((file) => file.usage.length === 0)
        : result.filter((file) => file.usage.some((u) => u.category === category));
  }

  const query = search?.trim().toLowerCase();
  if (query) {
    result = result.filter((file) => file.name.toLowerCase().includes(query));
  }

  return result;
}
