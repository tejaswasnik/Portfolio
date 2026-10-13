"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const options = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
];

/**
 * The dashboard's date-range control (Figma 53:2: "7D 30D 90D CUSTOM").
 * 7/30/90 are plain links (URL-driven, server-rendered, no JS needed);
 * "Custom" reveals two date inputs client-side since it needs to collect
 * two values before navigating.
 * @param {{ range: string, from?: string, to?: string }} props
 */
export default function DateRangeSelector({ range, from, to }) {
  const router = useRouter();
  const [showCustom, setShowCustom] = useState(range === "custom");
  const [fromDate, setFromDate] = useState(from || "");
  const [toDate, setToDate] = useState(to || "");

  function applyCustom(event) {
    event.preventDefault();
    if (!fromDate || !toDate) return;
    router.push(`/admin?range=custom&from=${fromDate}&to=${toDate}`);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-2 p-[3px]">
        {options.map((option) => (
          <Link
            key={option.value}
            href={`/admin?range=${option.value}`}
            className={`rounded-[5px] px-2.5 py-[5px] font-mono text-[10px] uppercase transition-colors ${
              range === option.value
                ? "border border-border-default bg-surface-3 text-text-primary"
                : "border border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            {option.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={`rounded-[5px] px-2.5 py-[5px] font-mono text-[10px] uppercase transition-colors ${
            range === "custom"
              ? "border border-border-default bg-surface-3 text-text-primary"
              : "border border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          Custom
        </button>
      </div>

      {showCustom ? (
        <form onSubmit={applyCustom} className="flex items-center gap-1.5">
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-md border border-border-default bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-primary outline-none"
          />
          <span className="text-text-muted">–</span>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-md border border-border-default bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-primary outline-none"
          />
          <button
            type="submit"
            className="rounded-md border border-border-default bg-surface-3 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            Apply
          </button>
        </form>
      ) : null}
    </div>
  );
}
