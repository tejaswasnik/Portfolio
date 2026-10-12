/**
 * Server-only lookup over the `simple-icons` package (fixes round 2,
 * Fix 1). Never imported from a "use client" file — `simple-icons`'s
 * main entry is ~5 MB of path data for ~3,500 brand icons, so the only
 * way to keep it off the browser bundle is to make sure it's loaded
 * exclusively by server code (page.js server components and server
 * actions) and to hand already-resolved `{ path, hex }` data down to
 * the client-safe `SkillIcon` component instead of a slug it would
 * have to look up itself. See docs/DECISIONS.md "fixes round 2".
 */
import * as simpleIcons from "simple-icons";

/** @type {Map<string, { slug: string, title: string, hex: string, path: string }> | null} */
let slugIndex = null;

function getIndex() {
  if (slugIndex) return slugIndex;
  slugIndex = new Map();
  for (const icon of Object.values(simpleIcons)) {
    if (icon && typeof icon === "object" && icon.slug) {
      slugIndex.set(icon.slug, { slug: icon.slug, title: icon.title, hex: icon.hex, path: icon.path });
    }
  }
  return slugIndex;
}

/**
 * @param {string | undefined | null} slug
 * @returns {{ slug: string, title: string, hex: string, path: string } | null}
 */
export function getIconBySlug(slug) {
  if (!slug) return null;
  return getIndex().get(slug) ?? null;
}

/**
 * Case-insensitive match over every icon's title or slug, for the admin
 * icon picker's search box (Fix 2). Bounded by `limit` since the full
 * catalog is ~3,500 icons.
 * @param {string} query
 * @param {number} [limit]
 * @returns {Array<{ slug: string, title: string, hex: string, path: string }>}
 */
export function searchIcons(query, limit = 48) {
  const needle = query?.trim().toLowerCase();
  if (!needle) return [];

  const results = [];
  for (const icon of getIndex().values()) {
    if (icon.slug.includes(needle) || icon.title.toLowerCase().includes(needle)) {
      results.push(icon);
      if (results.length >= limit) break;
    }
  }
  return results;
}
