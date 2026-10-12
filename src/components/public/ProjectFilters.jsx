import Link from "next/link";

/**
 * Server-rendered pill filter row (Figma 72:19 tag filter / 72:32 status
 * filter) — plain links with the active filter swapped in the URL
 * search params, no client JS needed. `buildHref` lets the caller merge
 * the new value into the other, currently-set search params.
 * @param {{
 *   label?: string,
 *   options: Array<{ value: string, label: string }>,
 *   activeValue: string,
 *   buildHref: (value: string) => string,
 * }} props
 */
export default function ProjectFilters({ label, options, activeValue, buildHref }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label ? (
        <span className="font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
          {label}
        </span>
      ) : null}
      {options.map((option) => {
        const active = option.value === activeValue;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value)}
            aria-current={active ? "true" : undefined}
            className={`rounded-pill border px-3 py-[5px] font-mono text-[10px] ${
              active
                ? "border-accent bg-surface-3 text-text-primary"
                : "border-border-default text-text-muted hover:text-text-primary"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
