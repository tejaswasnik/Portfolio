const DAY_MS = 24 * 60 * 60 * 1000;
export const rangeOptions = ["7", "30", "90", "custom"];

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const DATE_FORMAT_WITH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Turns the dashboard's date-range param (`7`/`30`/`90`/`custom` +
 * `from`/`to`) into the four boundaries every widget needs: the current
 * period and an equal-length previous period immediately before it, for
 * the "+12.4% vs prev. 30 days" comparisons (PRD §3.2).
 * @param {{ range?: string, from?: string, to?: string }} params
 * @param {Date} [now]
 */
export function resolveDateRange(params, now = new Date()) {
  const range = rangeOptions.includes(params?.range) ? params.range : "30";

  let end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);
  let start;

  if (range === "custom" && params.from && params.to) {
    const from = new Date(`${params.from}T00:00:00.000Z`);
    const to = new Date(`${params.to}T23:59:59.999Z`);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime()) && from <= to) {
      start = from;
      end = to;
    }
  }

  if (!start) {
    const days = range === "custom" ? 30 : Number(range);
    start = new Date(end.getTime() - (days - 1) * DAY_MS);
    start.setUTCHours(0, 0, 0, 0);
  }

  const lengthMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - lengthMs);

  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const label = `${(sameYear ? DATE_FORMAT : DATE_FORMAT_WITH_YEAR).format(start)} – ${DATE_FORMAT_WITH_YEAR.format(end)}`;
  // Calendar-day count (inclusive), not a raw ms/DAY_MS division — `end`
  // carries a 23:59:59.999 time component that would otherwise round up
  // to one day too many.
  const startDateOnly = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endDateOnly = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const days = Math.round((endDateOnly - startDateOnly) / DAY_MS) + 1;

  return { range, start, end, prevStart, prevEnd, label, days };
}
