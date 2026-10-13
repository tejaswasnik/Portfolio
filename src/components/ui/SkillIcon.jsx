/**
 * Renders one skill's icon: the simple-icons path data when a slug
 * resolved, a custom-uploaded image when the skill has an `iconUrl`, or
 * a rounded first-letter tile when neither is available — never a blank
 * gap or raw slug text.
 *
 * Colored by default (each brand's real hex, per user feedback —
 * overriding design.md §20's original "monochrome by default" call).
 * Pass `monochrome` to force `currentColor` instead, for a context where
 * a wash of brand colors would be too noisy or risks blending into the
 * background (a near-black or near-white hex against this app's own
 * near-black/white surfaces).
 *
 * Deliberately a dumb, universal renderer that never imports
 * `simple-icons` itself (that package is ~5 MB of path data for every
 * brand icon) — a server component resolves `path`/`hex`/`url` via
 * `src/lib/icons/resolveSkillIcon.js` first, which keeps the lookup
 * entirely server-side regardless of whether this component ends up
 * rendered inside a server or a client tree. See docs/DECISIONS.md
 * "fixes round 2" for the full reasoning.
 *
 * @param {{
 *   path?: string,
 *   hex?: string,
 *   url?: string,
 *   name?: string,
 *   size?: number,
 *   className?: string,
 *   monochrome?: boolean,
 * }} props
 */
export default function SkillIcon({
  path,
  hex,
  url,
  name,
  size = 14,
  className = "",
  monochrome = false,
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import.
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className={`inline-block shrink-0 rounded-[2px] object-contain ${className}`}
      />
    );
  }

  if (path) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={!monochrome && hex ? `#${hex}` : "currentColor"}
        className={`inline-block shrink-0 ${className}`}
      >
        <path d={path} />
      </svg>
    );
  }

  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-surface-3 font-mono text-[9px] leading-none text-text-chip ${className}`}
    >
      {letter}
    </span>
  );
}
