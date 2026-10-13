"use client";

import { useRef, useState } from "react";
import { heatLevel } from "@/lib/github/contributions";

const HEAT_CLASS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];

// Instantiated here, not passed as a prop: Intl.DateTimeFormat is a class
// instance, and only plain objects/primitives can cross the Server->Client
// component boundary (React throws on mount otherwise).
const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

// Half the tooltip's assumed max width (matches the `max-w-[180px]` below)
// — clamping the tooltip's center against this keeps it from clipping off
// the left/right edge of the grid for cells near either side, which a
// pure-CSS `left-1/2 -translate-x-1/2` per cell can't do (plain CSS has no
// way to clamp against the viewport/container edge).
const TOOLTIP_HALF_WIDTH = 90;

// Gap between the tooltip and the hovered/focused cell, in pixels.
const TOOLTIP_GAP = 6;

/**
 * The contribution grid + hover/focus tooltip (docs: GithubHeatmap). A
 * client component only because the tooltip needs to track the active
 * cell's position — one shared tooltip element, not 365 of them. Cells
 * are real buttons (not divs) so the grid is keyboard-navigable and the
 * tooltip is reachable by Tab, per docs/PRD.md's accessibility rules.
 * @param {{
 *   weeks: Array<{ days: Array<{ date: string, count: number }> }>,
 *   max: number,
 * }} props
 */
export default function HeatmapGrid({ weeks, max }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  function showTooltip(event, day) {
    const containerRect = containerRef.current.getBoundingClientRect();
    const cellRect = event.currentTarget.getBoundingClientRect();
    const rawX = cellRect.left + cellRect.width / 2 - containerRect.left;
    const x = Math.min(
      Math.max(rawX, TOOLTIP_HALF_WIDTH),
      containerRect.width - TOOLTIP_HALF_WIDTH,
    );
    // Anchored to the hovered cell's own row (via `bottom`, measured from
    // the container's bottom edge) rather than always sitting above the
    // whole grid — so the tooltip stays next to whichever row is active.
    const bottom = containerRect.bottom - cellRect.top + TOOLTIP_GAP;
    const label = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${DAY_FORMAT.format(new Date(day.date))}`;
    setTooltip({ x, bottom, label, key: day.date });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          gridTemplateRows: "repeat(7, 10px)",
          gridAutoFlow: "column",
        }}
      >
        {weeks.flatMap((week) =>
          week.days.map((day) => (
            <button
              key={day.date}
              type="button"
              aria-label={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${DAY_FORMAT.format(new Date(day.date))}`}
              onMouseEnter={(event) => showTooltip(event, day)}
              onMouseLeave={hideTooltip}
              onFocus={(event) => showTooltip(event, day)}
              onBlur={hideTooltip}
              className={`m-0 scale-100 rounded-[1px] border-0 p-0 outline-none transition-transform duration-150 ease-out hover:z-10 hover:scale-125 focus-visible:z-10 focus-visible:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${HEAT_CLASS[heatLevel(day.count, max)]}`}
            />
          )),
        )}
      </div>
      {tooltip ? (
        <span
          key={tooltip.key}
          aria-hidden="true"
          className="animate-heatmap-tooltip-in pointer-events-none absolute z-20 w-max max-w-[180px] whitespace-nowrap rounded-md border border-border-default bg-surface-1 px-2 py-1 font-mono text-[10px] text-text-primary shadow-[0_8px_24px_rgb(0_0_0_/_0.35)]"
          style={{ left: tooltip.x, bottom: tooltip.bottom }}
        >
          {tooltip.label}
        </span>
      ) : null}
    </div>
  );
}
