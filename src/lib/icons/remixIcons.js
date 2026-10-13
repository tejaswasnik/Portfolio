/**
 * Server-only lookup over `remixicon` (fixes round 2, Fix 2: a third
 * icon library). Same "never imported by a 'use client' file" rule as
 * `simpleIcons.js` — see its header comment.
 *
 * Unlike simple-icons/lucide-static, remixicon ships only raw SVG files
 * (no JSON index), each a single filled path, e.g.
 * `icons/Development/code-s-slash-line.svg`. `remixicon-index.json`
 * (generated once by reading that file tree and pulling each file's
 * `<path d="...">` out with a small regex, then committed — see its
 * own generation note) is imported statically here, the same shape as
 * `simple-icons`/`lucide-static`'s own bundled data files, specifically
 * so Next's serverless output tracing picks these paths up automatically
 * — a dynamic `fs.readFileSync` over `node_modules` at request time
 * isn't guaranteed to be included in a deployed function bundle.
 */
import remixIndex from "./remixicon-index.json";

/**
 * @param {string | undefined | null} slug e.g. "code-s-slash-line"
 * @returns {{ slug: string, title: string, category: string, path: string } | null}
 */
export function getRemixIcon(slug) {
  if (!slug || !remixIndex[slug]) return null;
  const { category, path } = remixIndex[slug];
  return { slug, title: titleCase(slug), category, path };
}

/**
 * @param {string} query
 * @param {number} [limit]
 * @returns {Array<{ slug: string, title: string, category: string, path: string }>}
 */
export function searchRemixIcons(query, limit = 48) {
  const needle = query?.trim().toLowerCase();
  if (!needle) return [];

  const results = [];
  for (const [slug, { category, path }] of Object.entries(remixIndex)) {
    if (slug.includes(needle) || category.toLowerCase().includes(needle)) {
      results.push({ slug, title: titleCase(slug), category, path });
      if (results.length >= limit) break;
    }
  }
  return results;
}

/** @param {string} slug e.g. "code-s-slash-line" */
function titleCase(slug) {
  return slug
    .replace(/-(line|fill)$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
