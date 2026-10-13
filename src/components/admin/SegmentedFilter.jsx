import Link from "next/link";

/**
 * Server-rendered segmented filter group (Figma 65:520/65:527/65:534) —
 * plain links swapping one search param, same URL-driven pattern as the
 * public `/projects` filters.
 * @param {{
 *   options: Array<{ value: string, label: string }>,
 *   activeValue: string,
 *   buildHref: (value: string) => string,
 * }} props
 */
export default function SegmentedFilter({ options, activeValue, buildHref }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg border border-border-subtle bg-surface-2 p-[3px]">
      {options.map((option) => {
        const active = option.value === activeValue;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value)}
            aria-current={active ? "true" : undefined}
            className={`rounded-[5px] px-2.5 py-[5px] font-mono text-[10px] uppercase transition-colors ${
              active
                ? "border border-border-default bg-surface-3 text-text-primary"
                : "border border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
