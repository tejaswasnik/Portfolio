import { getIconBySlug, searchIcons as searchSimpleIcons } from "./simpleIcons.js";
import { getLucideIcon, searchLucideIcons } from "./lucideIcons.js";
import { getRemixIcon, searchRemixIcons } from "./remixIcons.js";

/** Every icon source the admin picker (Fix 2) can search — design.md §20 plus user feedback asking for more than one library. */
export const ICON_LIBRARIES = [
  { value: "simple-icons", label: "Simple Icons", hint: "Brand logos (React, MongoDB…)" },
  { value: "lucide", label: "Lucide", hint: "Generic outline icons" },
  { value: "remixicon", label: "Remix Icon", hint: "Generic filled/outline icons + some brands" },
];

const DEFAULT_LIBRARY = "simple-icons";

/**
 * Resolves one skill's stored `iconLibrary`/`iconSlug`/`iconUrl` into
 * the plain, serializable props `SkillIcon` needs to render — a
 * custom-uploaded icon wins over a library slug, an unknown/missing
 * slug falls back to the first-letter tile (never a blank gap).
 * Server-only (see simpleIcons.js/lucideIcons.js/remixIcons.js); call
 * this in a server component or server action and pass the result
 * straight to `<SkillIcon {...result} />`, or hand the result (or a
 * pre-rendered `<SkillIcon>`) down to a client component as a prop.
 * @param {{ iconLibrary?: string, iconSlug?: string, iconUrl?: string, name: string }} skill
 * @returns {{ path?: string, nodes?: Array<[string, Record<string, string>]>, hex?: string, url?: string, name: string }}
 */
export function resolveSkillIcon(skill) {
  if (skill.iconUrl) return { url: skill.iconUrl, name: skill.name };

  const icon = getIconFromLibrary(skill.iconLibrary || DEFAULT_LIBRARY, skill.iconSlug);
  if (!icon) return { name: skill.name };

  if (icon.nodes) return { nodes: icon.nodes, name: skill.name };
  return { path: icon.path, hex: icon.hex, name: skill.name };
}

/**
 * @param {string} library one of `ICON_LIBRARIES`' values
 * @param {string | undefined | null} slug
 */
function getIconFromLibrary(library, slug) {
  if (library === "lucide") return getLucideIcon(slug);
  if (library === "remixicon") return getRemixIcon(slug);
  return getIconBySlug(slug);
}

/**
 * Searches one library for the admin icon picker (Fix 2).
 * @param {string} library one of `ICON_LIBRARIES`' values
 * @param {string} query
 * @param {number} [limit]
 * @returns {Array<{ slug: string, title: string, path?: string, hex?: string, nodes?: Array<[string, Record<string, string>]> }>}
 */
export function searchIconLibrary(library, query, limit = 48) {
  if (library === "lucide") return searchLucideIcons(query, limit);
  if (library === "remixicon") return searchRemixIcons(query, limit);
  return searchSimpleIcons(query, limit);
}
