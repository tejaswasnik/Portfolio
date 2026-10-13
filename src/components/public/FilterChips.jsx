"use client";

import { useOptimistic, startTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { SPRING } from "@/lib/motion/tokens.js";

/**
 * Client wrapper around ProjectFilters' pill row (A-task "project filter
 * active-pill", lightened per plan Decision D4): same server-provided
 * options/hrefs/plain `<Link>`s, just with a `layoutId` pill sliding
 * between them instead of a CSS background swap, mirroring Nav.jsx's
 * `nav-pill` pattern exactly. `groupId` namespaces the `layoutId` so the
 * tag row and the status row each animate their own pill, not each
 * other's.
 *
 * `useOptimistic` flips the active pill the instant a link is clicked,
 * before the server round-trip that actually changes `activeValue`
 * resolves — filter clicks are query-string-only navigations, which
 * `TransitionProvider` already skips (`shouldTransition` treats same-path
 * query changes as no transition), so this is the only motion the click
 * produces, and without it the pill would wait on a full navigation.
 * @param {{
 *   groupId: string,
 *   label?: string,
 *   options: Array<{ value: string, label: string }>,
 *   activeValue: string,
 *   buildHref: (value: string) => string,
 * }} props
 */
export default function FilterChips({ groupId, label, options, activeValue, buildHref }) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(activeValue);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label ? (
        <span className="font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
          {label}
        </span>
      ) : null}
      {options.map((option) => {
        const active = option.value === optimisticValue;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value)}
            aria-current={active ? "true" : undefined}
            onClick={() => startTransition(() => setOptimisticValue(option.value))}
            className={`relative rounded-pill border px-3 py-[5px] font-mono text-[10px] transition-colors ${
              active
                ? "border-accent text-text-primary"
                : "border-border-default text-text-muted hover:text-text-primary"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`filter-pill-${groupId}`}
                transition={SPRING.layout}
                className="absolute inset-0 -z-10 rounded-pill bg-surface-3"
              />
            ) : null}
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
