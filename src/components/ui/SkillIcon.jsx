/**
 * Renders one skill's icon from whichever library it resolved from
 * (simple-icons, lucide or remixicon — fixes round 2, Fix 2): a filled
 * `path` (brand-coloured when a `hex` came with it), a stroke-based
 * `nodes` list (lucide's shape — generic outline icons, always
 * monochrome, they carry no brand colour), a custom-uploaded `url`
 * image, or a rounded first-letter tile when none of those are
 * available — never a blank gap or raw slug text.
 *
 * Filled icons are coloured by default (each brand's real hex, per user
 * feedback — overriding design.md §20's original "monochrome by
 * default" call). Pass `monochrome` to force `currentColor` instead,
 * for a context where a wash of brand colours would be too noisy or
 * risks blending into the background (a near-black or near-white hex
 * against this app's own near-black/white surfaces).
 *
 * Deliberately a dumb, universal renderer that never imports any icon
 * package itself (simple-icons alone is ~5 MB of path data) — a server
 * component resolves `path`/`nodes`/`hex`/`url` via
 * `src/lib/icons/resolveSkillIcon.js` first, which keeps every lookup
 * entirely server-side regardless of whether this component ends up
 * rendered inside a server or a client tree. See docs/DECISIONS.md
 * "fixes round 2" for the full reasoning.
 *
 * @param {{
 *   path?: string,
 *   nodes?: Array<[string, Record<string, string>]>,
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
  nodes,
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

  if (nodes) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`inline-block shrink-0 ${className}`}
      >
        {nodes.map(([tag, attrs], index) => {
          const Tag = tag;
          return <Tag key={index} {...attrs} />;
        })}
      </svg>
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
