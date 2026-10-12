"use client";

import { useEffect, useState } from "react";

/**
 * Desktop-only side index with scroll-spy (Figma 10:1057). Hidden on
 * < 1200px via CSS (xl: breakpoint), matching PageFrame's rails and
 * design.md §10. Entries are driven by whichever sections actually
 * rendered on the page (passed in by the page, already filtered for
 * visibility/fetch-failure) — so a hidden or failed section drops out
 * automatically, per figma-map.md.
 * @param {{ entries: Array<{ id: string, label: string }> }} props
 */
export default function SideIndex({ entries }) {
  const [activeId, setActiveId] = useState(entries[0]?.id);

  useEffect(() => {
    const elements = entries
      .map((entry) => document.getElementById(entry.id))
      .filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (observedEntries) => {
        const visible = observedEntries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Section index"
      className="fixed left-[calc(50%+412px)] top-1/2 hidden -translate-y-1/2 flex-col gap-0.5 xl:flex"
    >
      <p className="font-mono text-[9px] tracking-[1.8px] text-text-muted">
        INDEX
      </p>
      {entries.map((entry) => {
        const active = entry.id === activeId;
        return (
          <a
            key={entry.id}
            href={`#${entry.id}`}
            className="flex items-center gap-2 py-px"
            aria-current={active ? "true" : undefined}
          >
            <span
              className={`h-px w-4 ${active ? "bg-accent" : "bg-transparent"}`}
              aria-hidden="true"
            />
            <span
              className={`font-mono text-[10px] leading-[2] ${active ? "text-accent" : "text-text-muted"}`}
            >
              {entry.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
