"use client";

import { useRef } from "react";
import { withImageKitTransform } from "@/lib/imagekit/url.js";
import { useInterestImageReveal } from "@/hooks/useInterestImageReveal";
import { initialDriftPx, roundedRectPerimeter } from "@/lib/interestImages/reveal";
import { SETTLE } from "@/lib/transitions/interestImageReveal";

const OUTLINE_RADIUS = 8;

function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Scattered decorative images in the margins either side of the 760px
 * content column (Figma 5:5314's "Interest images (scattered)" layer,
 * node 105:2) — plain tilted photos, no card/caption/tag. Position and
 * rotation come from the database (admin-managed, not fixed), but every
 * numeric value is clamped here regardless of what's already enforced on
 * write, since this renders directly into inline `style` — defense in
 * depth against anything that bypassed the Zod schema.
 *
 * Desktop only (`hidden xl:block`, matching Rails' own breakpoint) and
 * fully inert (`pointer-events-none` on the layer; each image opts back
 * in individually just for its own hover lift, which — like every other
 * transition in this app — collapses under the global
 * `prefers-reduced-motion` override rather than needing its own check).
 *
 * Entrance ("pinned to the sheet" — outline traces, image settles, pin
 * lands): each `.interest-image-slot` wrapper keeps the ORIGINAL static
 * position + rotation (so the outline/pin never wobble), while the
 * nested `.interest-image-photo` carries the animated settle wobble
 * (scale/drift/rotation-overshoot) in its own already-rotated local
 * space — `useInterestImageReveal` drives it all via `data-reveal-*`
 * attributes (globals.css), never React state, so a batch revealing
 * together costs attribute writes, not re-renders. No `tape` variant —
 * that field doesn't exist on this schema (crosshair pin only; see the
 * PR this landed in for why).
 * @param {{ items: Array<{
 *   id: string, imageUrl: string, alt?: string,
 *   width: number, height: number, offsetX: number, topPct: number, rotation: number,
 * }> }} props
 */
export default function InterestImages({ items = [] }) {
  const containerRef = useRef(null);
  useInterestImageReveal(containerRef);

  if (items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden xl:block"
    >
      {items.map((item) => {
        if (!item.imageUrl) return null;

        const width = clamp(item.width, 40, 400, 160);
        const height = clamp(item.height, 40, 400, 160);
        const offsetX = clamp(item.offsetX, -700, 700, 0);
        const topPct = clamp(item.topPct, 0, 100, 50);
        const rotation = clamp(item.rotation, -15, 15, 0);
        const hasAlt = Boolean(item.alt?.trim());
        const perimeter = roundedRectPerimeter(width, height, OUTLINE_RADIUS);
        const driftStart = initialDriftPx(offsetX, SETTLE.driftPx);

        return (
          <div
            key={item.id}
            data-reveal-item
            className="interest-image-slot pointer-events-auto absolute"
            style={{
              left: `calc(50% + ${offsetX}px)`,
              top: `${topPct}%`,
              width,
              height,
              "--interest-rotation": `${rotation}deg`,
              "--interest-drift-start": `${driftStart}px`,
            }}
          >
            <svg
              aria-hidden="true"
              focusable="false"
              className="interest-outline absolute inset-0"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
            >
              <rect
                x={0.5}
                y={0.5}
                width={Math.max(width - 1, 0)}
                height={Math.max(height - 1, 0)}
                rx={OUTLINE_RADIUS}
                ry={OUTLINE_RADIUS}
                fill="none"
                style={{
                  strokeDasharray: "4 4",
                  "--interest-outline-length": perimeter,
                }}
              />
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, width/height/sizing already come from admin-controlled data */}
            <img
              src={withImageKitTransform(item.imageUrl, `w-${Math.round(width * 2)},q-80,f-auto`)}
              alt={hasAlt ? item.alt : ""}
              aria-hidden={hasAlt ? undefined : "true"}
              width={width}
              height={height}
              loading="lazy"
              className="interest-image-photo absolute inset-0 rounded-lg border border-border-default object-cover shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
            />
            <span aria-hidden="true" className="interest-pin" />
          </div>
        );
      })}
    </div>
  );
}
