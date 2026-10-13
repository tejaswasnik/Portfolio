import { getIconBySlug } from "./simpleIcons.js";

/**
 * Resolves one skill's stored `iconSlug`/`iconUrl` into the plain,
 * serializable props `SkillIcon` needs to render — a custom-uploaded
 * icon wins over a simple-icons slug, an unknown/missing slug falls
 * back to the first-letter tile (never a blank gap). Server-only (see
 * simpleIcons.js); call this in a server component or server action
 * and pass the result straight to `<SkillIcon {...result} />`, or hand
 * the result (or a pre-rendered `<SkillIcon>`) down to a client
 * component as a prop.
 * @param {{ iconSlug?: string, iconUrl?: string, name: string }} skill
 * @returns {{ path?: string, hex?: string, url?: string, name: string }}
 */
export function resolveSkillIcon(skill) {
  if (skill.iconUrl) return { url: skill.iconUrl, name: skill.name };

  const icon = getIconBySlug(skill.iconSlug);
  if (icon) return { path: icon.path, hex: icon.hex, name: skill.name };

  return { name: skill.name };
}
