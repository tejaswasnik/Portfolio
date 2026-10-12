const BAR_COLORS = ["bg-accent", "bg-text-secondary", "bg-text-muted"];

/**
 * Devices stacked bar + Browsers/OS pill rows (Figma 53:2's Devices card).
 * @param {{ devices: Array<{label: string, pct: number}>, browsers: Array<{label: string, pct: number}>, os: Array<{label: string, pct: number}> }} props
 */
export default function DeviceBreakdown({ devices, browsers, os }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div className="flex w-full items-center justify-between">
        <p className="font-serif text-[22px] text-text-primary">Devices</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">Share</p>
      </div>

      {devices.length === 0 ? (
        <p className="font-mono text-[11px] text-text-muted">No data yet for this range.</p>
      ) : (
        <>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
            {devices.map((device, index) => (
              <div
                key={device.label}
                className={BAR_COLORS[index % BAR_COLORS.length]}
                style={{ width: `${device.pct}%` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            {devices.map((device, index) => (
              <div key={device.label} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-text-primary">
                  <span className={`size-2 rounded-[2px] ${BAR_COLORS[index % BAR_COLORS.length]}`} />
                  {device.label}
                </span>
                <span className="font-mono text-text-secondary">{device.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">Browsers</p>
        <div className="flex flex-wrap gap-1.5">
          {browsers.map((b) => (
            <span
              key={b.label}
              className="rounded-pill border border-border-default bg-surface-3 px-2.5 py-1 font-mono text-[10px] text-text-primary"
            >
              {b.label} {b.pct}%
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
          Operating systems
        </p>
        <div className="flex flex-wrap gap-1.5">
          {os.map((o) => (
            <span
              key={o.label}
              className="rounded-pill border border-border-default bg-surface-3 px-2.5 py-1 font-mono text-[10px] text-text-primary"
            >
              {o.label} {o.pct}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
