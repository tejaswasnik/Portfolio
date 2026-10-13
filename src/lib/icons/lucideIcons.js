/**
 * Server-only lookup over `lucide-static` (fixes round 2, Fix 2: a
 * second icon library alongside simple-icons). Same "never imported by
 * a 'use client' file" rule as `simpleIcons.js` — see its header comment
 * and docs/DECISIONS.md "fixes round 2" for why.
 *
 * Lucide icons are generic outline glyphs (stroke-based, no brand
 * colour), not brand logos — useful for a skill simple-icons doesn't
 * have a logo for.
 */
import iconNodes from "lucide-static/icon-nodes.json";
import tags from "lucide-static/tags.json";

/**
 * @param {string | undefined | null} slug e.g. "house"
 * @returns {{ slug: string, title: string, nodes: Array<[string, Record<string, string>]> } | null}
 */
export function getLucideIcon(slug) {
  if (!slug || !iconNodes[slug]) return null;
  return { slug, title: titleCase(slug), nodes: iconNodes[slug] };
}

/**
 * Matches by icon name or any of its synonym tags (e.g. "home" finds
 * "house").
 * @param {string} query
 * @param {number} [limit]
 * @returns {Array<{ slug: string, title: string, nodes: Array<[string, Record<string, string>]> }>}
 */
export function searchLucideIcons(query, limit = 48) {
  const needle = query?.trim().toLowerCase();
  if (!needle) return [];

  const results = [];
  for (const slug of Object.keys(iconNodes)) {
    const matchesName = slug.includes(needle);
    const matchesTag = (tags[slug] || []).some((tag) => tag.includes(needle));
    if (matchesName || matchesTag) {
      results.push({ slug, title: titleCase(slug), nodes: iconNodes[slug] });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/** @param {string} slug e.g. "arrow-up-right" */
function titleCase(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
