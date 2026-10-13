import { normalizeReferrer } from "./referrer.js";
import { countryName } from "./country.js";

/**
 * Every dashboard widget (Figma 53:2) is a pure function over an
 * already-fetched array of plain `events`/`messages` documents — not a
 * MongoDB aggregation pipeline. PRD §3.2 asks to "test the aggregations
 * with fixture events"; a pure JS function over a plain array is what
 * that actually means to test (no DB mocking needed, matches this
 * project's established DB-mock-free pure-helper convention). The
 * tradeoff is doing the grouping in JS instead of `$group` — perfectly
 * fine at a personal portfolio's event volume, and the one real DB call
 * (`findEventsInRange`) stays a single, simple `find()`.
 */

/** Percent change from `previous` to `current`, or `null` when undefined (0 → 0). */
function deltaPct(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function uniqueVisitorCount(events) {
  return new Set(events.map((e) => e.visitorHash)).size;
}

/**
 * The four KPI cards: page views, unique visitors, messages, contact
 * conversion (messages ÷ unique visitors), each with its delta vs. the
 * previous period of equal length.
 */
export function computeOverviewStats({
  currentEvents,
  previousEvents,
  currentMessageCount,
  previousMessageCount,
}) {
  const currentViews = currentEvents.filter((e) => e.type === "view");
  const previousViews = previousEvents.filter((e) => e.type === "view");

  const currentVisitors = uniqueVisitorCount(currentViews);
  const previousVisitors = uniqueVisitorCount(previousViews);

  const currentConversion = currentVisitors > 0 ? (currentMessageCount / currentVisitors) * 100 : 0;
  const previousConversion =
    previousVisitors > 0 ? (previousMessageCount / previousVisitors) * 100 : 0;

  return {
    pageViews: { value: currentViews.length, deltaPct: deltaPct(currentViews.length, previousViews.length) },
    uniqueVisitors: { value: currentVisitors, deltaPct: deltaPct(currentVisitors, previousVisitors) },
    messages: { value: currentMessageCount, deltaPct: deltaPct(currentMessageCount, previousMessageCount) },
    contactConversion: {
      value: Math.round(currentConversion * 10) / 10,
      deltaPct: deltaPct(currentConversion, previousConversion),
    },
  };
}

/**
 * One row per UTC day in `[startDate, endDate]`, views + unique visitors.
 *
 * Groups `events` into per-day buckets in a single pass (PERF-04): the
 * previous version re-filtered the *entire* events array once per day
 * in range, an O(days × events) cost that measured 7-8s at 50k events
 * over a 90-day range. Grouping once is O(events + days).
 */
export function computeViewsOverTime(events, startDate, endDate) {
  const byDay = new Map();
  for (const event of events) {
    if (event.type !== "view") continue;
    const dateKey = new Date(event.createdAt).toISOString().slice(0, 10);
    if (!byDay.has(dateKey)) byDay.set(dateKey, []);
    byDay.get(dateKey).push(event);
  }

  const days = [];
  const cursor = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  while (cursor <= end) {
    const dateKey = cursor.toISOString().slice(0, 10);
    const dayEvents = byDay.get(dateKey) || [];
    days.push({
      date: dateKey,
      views: dayEvents.length,
      uniqueVisitors: uniqueVisitorCount(dayEvents),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

/** Top `limit` paths by view count, with the rest bucketed as "Other pages". */
export function computeTopPages(events, limit = 4) {
  const counts = new Map();
  for (const event of events) {
    if (event.type !== "view") continue;
    counts.set(event.path, (counts.get(event.path) || 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, limit).map(([path, views]) => ({ path, views }));
  const restTotal = sorted.slice(limit).reduce((sum, [, views]) => sum + views, 0);

  if (restTotal > 0) top.push({ path: "Other pages", views: restTotal });
  return top;
}

/** Top `limit` referrer sources by visit count ("Direct" for no/same-origin referrer). */
export function computeTopReferrers(events, siteOrigin, limit = 5) {
  const counts = new Map();
  for (const event of events) {
    if (event.type !== "view") continue;
    const label = normalizeReferrer(event.referrer, siteOrigin);
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([referrer, visits]) => ({ referrer, visits }));
}

/** Top `limit` countries by unique visitor count. */
export function computeCountries(events, limit = 5) {
  const byCountry = new Map();
  for (const event of events) {
    if (event.type !== "view" || !event.country) continue;
    if (!byCountry.has(event.country)) byCountry.set(event.country, new Set());
    byCountry.get(event.country).add(event.visitorHash);
  }

  return [...byCountry.entries()]
    .map(([code, visitors]) => ({ code, country: countryName(code), visitors: visitors.size }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, limit);
}

function shareBreakdown(events, field) {
  const counts = new Map();
  let total = 0;
  for (const event of events) {
    if (event.type !== "view") continue;
    const value = event[field] || "Other";
    counts.set(value, (counts.get(value) || 0) + 1);
    total += 1;
  }

  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Device/browser/OS share breakdowns (each sums to ~100%). */
export function computeDeviceBreakdown(events) {
  return {
    devices: shareBreakdown(events, "device"),
    browsers: shareBreakdown(events, "browser"),
    os: shareBreakdown(events, "os"),
  };
}

/**
 * Buckets a click `target` into the dashboard's "TYPE" column. Every
 * tracked target is one of these literal strings (see
 * src/lib/analytics/trackEvent.js's call sites) or a project target
 * formatted as "<Project name> · live link"/"<Project name> · GitHub".
 */
export function classifyTarget(target) {
  if (target === "GitHub profile" || target === "LinkedIn" || target === "Twitter / X") {
    return "Social";
  }
  if (target === "Contact button") return "CTA";
  if (target === "Resume download") return "File";
  if (target.includes(" · ")) return "Project";
  return "Other";
}

/** Top `limit` click targets by count, each tagged with its type. */
export function computeClickTracking(events, limit = 6) {
  const counts = new Map();
  for (const event of events) {
    if (event.type !== "click" || !event.target) continue;
    counts.set(event.target, (counts.get(event.target) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([target, clicks]) => ({ target, type: classifyTarget(target), clicks }));
}

/**
 * Merges recent messages and notable click events (resume downloads,
 * contact-button clicks) into one feed, newest first. Deliberately
 * doesn't include fabricated insights like "Workspace viewed 24 times"
 * or "Banner updated" — this app has no audit log for admin actions and
 * no per-project daily-view-count feature; only real, already-tracked
 * events are shown (see docs/DECISIONS.md step 11).
 * @param {Array<{name: string, subject: string, createdAt: string | Date}>} messages
 * @param {Array<{type: string, target: string, createdAt: string | Date}>} events
 * @param {number} [limit]
 */
export function computeRecentActivity(messages, events, limit = 5) {
  const messageItems = messages.map((m) => ({
    kind: "message",
    title: `New message from ${m.name}`,
    detail: m.subject || "No subject",
    createdAt: m.createdAt,
  }));

  const clickItems = events
    .filter((e) => e.type === "click" && (e.target === "Resume download" || e.target === "Contact button"))
    .map((e) => ({
      kind: e.target === "Resume download" ? "download" : "click",
      title: e.target === "Resume download" ? "Resume downloaded" : "Contact button clicked",
      detail: e.country ? countryName(e.country) : "",
      createdAt: e.createdAt,
    }));

  return [...messageItems, ...clickItems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
