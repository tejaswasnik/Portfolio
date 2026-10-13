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

/**
 * The contribution grid + hover tooltip (docs: GithubHeatmap). A client
 * component only because the tooltip needs to track the hovered cell's
 * position — one shared tooltip element, not 365 of them.
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
    const label = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${DAY_FORMAT.format(new Date(day.date))}`;
    setTooltip({ x, label });
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
            <div
              key={day.date}
              title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${DAY_FORMAT.format(new Date(day.date))}`}
              onMouseEnter={(event) => showTooltip(event, day)}
              onMouseLeave={() => setTooltip(null)}
              className={`rounded-[1px] ${HEAT_CLASS[heatLevel(day.count, max)]}`}
            />
          )),
        )}
      </div>
      {tooltip ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full z-10 mb-1.5 w-max max-w-[180px] -translate-x-1/2 whitespace-nowrap rounded-md border border-border-default bg-surface-1 px-2 py-1 font-mono text-[10px] text-text-primary shadow-[0_8px_24px_rgb(0_0_0_/_0.35)]"
          style={{ left: tooltip.x }}
        >
          {tooltip.label}
        </span>
      ) : null}
    </div>
  );
}
