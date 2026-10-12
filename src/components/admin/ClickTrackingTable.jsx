/**
 * Click tracking table (Figma 53:2): target, type (Social/CTA/File/
 * Project), click count with a proportional bar.
 * @param {{ rows: Array<{target: string, type: string, clicks: number}> }} props
 */
export default function ClickTrackingTable({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.clicks));

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div className="flex w-full items-center justify-between">
        <p className="font-serif text-[22px] text-text-primary">Click tracking</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
          Selected range
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="font-mono text-[11px] text-text-muted">No clicks tracked yet for this range.</p>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center gap-4 border-b border-border-subtle pb-2 font-mono text-[9px] uppercase tracking-[1.2px] text-text-muted">
            <div className="flex-1">Target</div>
            <div className="w-20">Type</div>
            <div className="w-40 text-right">Clicks</div>
          </div>
          {rows.map((row) => (
            <div
              key={row.target}
              className="flex items-center gap-4 border-b border-border-subtle py-3 last:border-b-0"
            >
              <p className="flex-1 truncate text-[13px] text-text-primary">{row.target}</p>
              <p className="w-20 font-mono text-[10px] uppercase text-text-muted">{row.type}</p>
              <div className="flex w-40 items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(row.clicks / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11px] text-text-secondary">
                  {row.clicks}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
