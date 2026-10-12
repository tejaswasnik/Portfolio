/**
 * A ranked list with a proportional bar per row (Figma 53:2's Top
 * pages/Top referrers/Countries cards — same shape, different data).
 * @param {{ title: string, columnLabel: string, rows: Array<{ label: string, value: number }> }} props
 */
export default function RankedList({ title, columnLabel, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div className="flex w-full items-center justify-between">
        <p className="font-serif text-[22px] text-text-primary">{title}</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
          {columnLabel}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="font-mono text-[11px] text-text-muted">No data yet for this range.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-text-primary">{row.label}</span>
                <span className="font-mono text-text-secondary">{row.value.toLocaleString()}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
