import Sparkline from "@/components/admin/Sparkline";

/**
 * One dashboard KPI card (Figma 53:2): label, icon, big number, a
 * sparkline, and the delta vs. the previous period of equal length.
 * @param {{ label: string, value: string, icon: React.ReactNode, sparkline: number[], deltaPct: number | null }} props
 */
export default function KpiCard({ label, value, icon, sparkline, deltaPct }) {
  const positive = deltaPct !== null && deltaPct >= 0;

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">{label}</p>
        <span className="text-text-muted">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="font-serif text-[32px] leading-none text-text-primary">{value}</p>
        <span className={positive ? "text-accent" : "text-text-muted"}>
          <Sparkline values={sparkline} />
        </span>
      </div>
      <p className="font-mono text-[11px] text-text-muted">
        <span className={positive ? "text-accent" : "text-text-secondary"}>
          {deltaPct === null ? "—" : `${positive ? "+" : ""}${deltaPct.toFixed(1)}%`}
        </span>{" "}
        vs prev. period
      </p>
    </div>
  );
}
