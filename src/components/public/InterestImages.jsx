import { withImageKitTransform } from "@/lib/imagekit/url.js";

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
 * @param {{ items: Array<{
 *   id: string, imageUrl: string, alt?: string,
 *   width: number, height: number, offsetX: number, topPct: number, rotation: number,
 * }> }} props
 */
export default function InterestImages({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <div
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

        return (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, width/height/sizing already come from admin-controlled data
          <img
            key={item.id}
            src={withImageKitTransform(item.imageUrl, `w-${Math.round(width * 2)},q-80,f-auto`)}
            alt={hasAlt ? item.alt : ""}
            aria-hidden={hasAlt ? undefined : "true"}
            width={width}
            height={height}
            loading="lazy"
            className="interest-image pointer-events-auto absolute rounded-lg border border-border-default object-cover shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
            style={{
              left: `calc(50% + ${offsetX}px)`,
              top: `${topPct}%`,
              width,
              height,
              "--interest-rotation": `${rotation}deg`,
            }}
          />
        );
      })}
    </div>
  );
}
