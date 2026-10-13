import HeatmapGrid from "@/components/public/HeatmapGrid.jsx";
import Reveal from "@/components/ui/Reveal.jsx";
import SectionDivider from "@/components/ui/SectionDivider";
import CountUp from "@/components/motion/CountUp.jsx";

const HEAT_CLASS = [
  "bg-heat-0",
  "bg-heat-1",
  "bg-heat-2",
  "bg-heat-3",
  "bg-heat-4",
];

// Reads in UTC — the API returns plain "YYYY-MM-DD" day strings with no
// time component, and `new Date(dateString)` parses those as UTC
// midnight; formatting with the viewer's local timezone instead could
// shift a day near midnight to the wrong month label.
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

/**
 * GitHub activity heatmap (Figma 10:4 "Activity and field notes" →
 * 10:11). Presentational only — the page fetches the calendar (via
 * src/lib/github/contributions.js) and passes it in, or skips rendering
 * this component entirely on failure, so the side index can decide
 * whether "Activity" belongs in it before anything renders (per
 * ARCHITECTURE.md "hide the section on failure"). Heading text has no
 * confirmed Figma frame (the design-context response for 10:11 was
 * truncated before a heading node appeared) — using "Activity" to match
 * the side-index label; logged under "Designed by me".
 * @param {{ calendar: { weeks: Array<{ days: Array<{ date: string, count: number }> }> } }} props
 */
export default function GithubHeatmap({ calendar }) {
  const allDays = calendar.weeks.flatMap((week) => week.days);
  const max = Math.max(1, ...allDays.map((day) => day.count));
  const total = allDays.reduce((sum, day) => sum + day.count, 0);
  const lastDay = allDays[allDays.length - 1];
  const year = lastDay ? new Date(lastDay.date).getUTCFullYear() : new Date().getUTCFullYear();

  // One label per month boundary crossed, in column order.
  const monthLabels = [];
  let lastMonth = -1;
  calendar.weeks.forEach((week) => {
    const firstDay = week.days[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getUTCMonth();
    if (month !== lastMonth) {
      monthLabels.push(MONTH_FORMAT.format(new Date(firstDay.date)));
      lastMonth = month;
    }
  });

  return (
    <section id="activity" aria-labelledby="activity-heading">
      <SectionDivider />
      <div className="flex flex-col gap-6 p-6">
        <h2
          id="activity-heading"
          className="font-serif text-2xl tracking-[0.6px] text-text-primary"
        >
          Activity
        </h2>
        {/*
          HeatmapGrid's columns are fluid (1fr each) so the grid always
          fills the column width exactly, whatever the API's week count —
          never a horizontal scrollbar, on any viewport.
        */}
        <div className="flex flex-col gap-2.5">
          <div className="flex w-full justify-between gap-1 font-mono text-[9px] text-text-muted">
            {monthLabels.map((label, index) => (
              <span key={`${label}-${index}`}>{label.toUpperCase()}</span>
            ))}
          </div>
          <Reveal baseClass="heatmap-wipe">
            <HeatmapGrid weeks={calendar.weeks} max={max} />
          </Reveal>
          <div className="flex items-center justify-between font-mono text-[10px] text-text-muted">
            <p>
              <CountUp to={total} /> contribution{total === 1 ? "" : "s"} in {year}
            </p>
            <div className="flex items-center gap-1 text-[9px]">
              <span>Less</span>
              {HEAT_CLASS.map((cls) => (
                <span key={cls} className={`size-2 ${cls}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
