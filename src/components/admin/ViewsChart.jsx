const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 10, right: 10, bottom: 24, left: 36 };

function buildPath(values, max, plotWidth, plotHeight) {
  if (values.length < 2) return "";
  const stepX = plotWidth / (values.length - 1);
  return values
    .map((value, index) => {
      const x = PADDING.left + index * stepX;
      const y = PADDING.top + plotHeight - (max > 0 ? (value / max) * plotHeight : 0);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * "Views over time" (Figma 53:2): two series — views (solid) and unique
 * visitors (dashed) — over the selected date range, with gridlines and
 * a handful of x-axis date labels.
 * @param {{ data: Array<{ date: string, views: number, uniqueVisitors: number }> }} props
 */
export default function ViewsChart({ data }) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const max = Math.max(1, ...data.map((d) => d.views), ...data.map((d) => d.uniqueVisitors));
  // Round the axis max up to a "nice" number so gridline labels read cleanly.
  const axisMax = Math.max(10, Math.ceil(max / 10) * 10);

  const viewsPath = buildPath(
    data.map((d) => d.views),
    axisMax,
    plotWidth,
    plotHeight,
  );
  const visitorsPath = buildPath(
    data.map((d) => d.uniqueVisitors),
    axisMax,
    plotWidth,
    plotHeight,
  );

  const labelIndices = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter(
    (value, index, arr) => arr.indexOf(value) === index,
  );

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[1.2px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-accent" /> Views
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-3 border-t border-dashed border-text-muted" /> Unique visitors
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Views over time">
        {[0, 0.5, 1].map((fraction) => (
          <line
            key={fraction}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight * fraction}
            y2={PADDING.top + plotHeight * fraction}
            className="stroke-border-subtle"
            strokeWidth="1"
          />
        ))}
        {[0, 0.5, 1].map((fraction) => (
          <text
            key={fraction}
            x={PADDING.left - 8}
            y={PADDING.top + plotHeight * (1 - fraction) + 3}
            textAnchor="end"
            className="fill-text-muted font-mono text-[9px]"
          >
            {Math.round(axisMax * fraction)}
          </text>
        ))}
        <path d={visitorsPath} fill="none" className="stroke-text-muted" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={viewsPath} fill="none" className="stroke-accent" strokeWidth="2" />
        {labelIndices.map((index) => (
          <text
            key={index}
            x={PADDING.left + (plotWidth / Math.max(1, data.length - 1)) * index}
            y={HEIGHT - 6}
            textAnchor="middle"
            className="fill-text-muted font-mono text-[9px]"
          >
            {data[index]
              ? new Date(`${data[index].date}T00:00:00Z`).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })
              : ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
