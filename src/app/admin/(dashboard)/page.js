import { getDb } from "@/lib/db/client.js";
import { findEventsInRange } from "@/lib/db/collections/events.js";
import { findMessages, findMessagesInRange, countUnreadMessages } from "@/lib/db/collections/messages.js";
import { getSiteUrl } from "@/lib/site-url.js";
import { resolveDateRange } from "@/lib/analytics/dateRange.js";
import {
  computeOverviewStats,
  computeViewsOverTime,
  computeTopPages,
  computeTopReferrers,
  computeCountries,
  computeDeviceBreakdown,
  computeClickTracking,
  computeRecentActivity,
} from "@/lib/analytics/aggregations.js";
import DateRangeSelector from "@/components/admin/DateRangeSelector";
import KpiCard from "@/components/admin/KpiCard";
import ViewsChart from "@/components/admin/ViewsChart";
import RankedList from "@/components/admin/RankedList";
import DeviceBreakdown from "@/components/admin/DeviceBreakdown";
import ClickTrackingTable from "@/components/admin/ClickTrackingTable";
import RecentActivity from "@/components/admin/RecentActivity";
import { EyeIcon, UserIcon, MailIcon, CheckIcon } from "@/components/ui/icons.jsx";

export const metadata = { title: "Admin — Dashboard" };

/**
 * Admin Dashboard (Figma 53:2, step 11). Every widget is driven by
 * `src/lib/analytics/aggregations.js`'s pure functions over one
 * `findEventsInRange` fetch spanning the previous period through today
 * — see that file's header comment for why this is plain JS reduction
 * instead of a MongoDB `$group` pipeline.
 * @param {{ searchParams: Promise<{ range?: string, from?: string, to?: string }> }} props
 */
export default async function AdminDashboardPage({ searchParams }) {
  const resolved = (await searchParams) ?? {};
  const { range, start, end, prevStart, prevEnd, label, days } = resolveDateRange(resolved);

  const db = await getDb();
  const [allRangeEvents, allRangeMessages, recentMessages, unreadCount] = await Promise.all([
    findEventsInRange(db, prevStart, end),
    findMessagesInRange(db, prevStart, end),
    findMessages(db),
    countUnreadMessages(db),
  ]);

  const currentEvents = allRangeEvents.filter((e) => new Date(e.createdAt) >= start);
  const previousEvents = allRangeEvents.filter((e) => new Date(e.createdAt) < start);
  const currentMessages = allRangeMessages.filter((m) => new Date(m.createdAt) >= start);
  const previousMessages = allRangeMessages.filter((m) => new Date(m.createdAt) < start);

  const overview = computeOverviewStats({
    currentEvents,
    previousEvents,
    currentMessageCount: currentMessages.length,
    previousMessageCount: previousMessages.length,
  });

  const startKey = start.toISOString().slice(0, 10);
  const endKey = end.toISOString().slice(0, 10);
  const viewsOverTime = computeViewsOverTime(currentEvents, startKey, endKey);

  const messagesByDay = new Map();
  for (const message of currentMessages) {
    const key = new Date(message.createdAt).toISOString().slice(0, 10);
    messagesByDay.set(key, (messagesByDay.get(key) || 0) + 1);
  }

  const siteOrigin = getSiteUrl();
  const topPages = computeTopPages(currentEvents);
  const topReferrers = computeTopReferrers(currentEvents, siteOrigin);
  const countries = computeCountries(currentEvents);
  const deviceBreakdown = computeDeviceBreakdown(currentEvents);
  const clickTracking = computeClickTracking(currentEvents);
  const recentActivity = computeRecentActivity(recentMessages, currentEvents);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">Dashboard</h1>
          <p className="font-mono text-[11px] text-text-muted">
            {label} · compared with the previous {days} days
          </p>
        </div>
        <DateRangeSelector range={range} from={resolved.from} to={resolved.to} />
      </div>

      <div className="flex w-full gap-4">
        <KpiCard
          label="Page views"
          value={overview.pageViews.value.toLocaleString()}
          icon={<EyeIcon size={14} />}
          sparkline={viewsOverTime.map((d) => d.views)}
          deltaPct={overview.pageViews.deltaPct}
        />
        <KpiCard
          label="Unique visitors"
          value={overview.uniqueVisitors.value.toLocaleString()}
          icon={<UserIcon size={14} />}
          sparkline={viewsOverTime.map((d) => d.uniqueVisitors)}
          deltaPct={overview.uniqueVisitors.deltaPct}
        />
        <KpiCard
          label="Messages"
          value={overview.messages.value.toLocaleString()}
          icon={<MailIcon size={14} />}
          sparkline={viewsOverTime.map((d) => messagesByDay.get(d.date) || 0)}
          deltaPct={overview.messages.deltaPct}
        />
        <KpiCard
          label="Contact conversion"
          value={`${overview.contactConversion.value}%`}
          icon={<CheckIcon size={14} />}
          sparkline={viewsOverTime.map((d) =>
            d.uniqueVisitors > 0 ? ((messagesByDay.get(d.date) || 0) / d.uniqueVisitors) * 100 : 0,
          )}
          deltaPct={overview.contactConversion.deltaPct}
        />
      </div>

      <div className="flex w-full items-start gap-4">
        <div className="flex-1 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="mb-4 flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Views over time</p>
          </div>
          <ViewsChart data={viewsOverTime} />
        </div>
        <div className="w-[344px]">
          <RankedList
            title="Top pages"
            columnLabel="Views"
            rows={topPages.map((p) => ({ label: p.path, value: p.views }))}
          />
        </div>
      </div>

      <div className="flex w-full items-start gap-4">
        <div className="flex-1">
          <RankedList
            title="Top referrers"
            columnLabel="Visits"
            rows={topReferrers.map((r) => ({ label: r.referrer, value: r.visits }))}
          />
        </div>
        <div className="flex-1">
          <RankedList
            title="Countries"
            columnLabel="Visitors"
            rows={countries.map((c) => ({ label: c.country, value: c.visitors }))}
          />
        </div>
        <div className="w-[344px]">
          <DeviceBreakdown {...deviceBreakdown} />
        </div>
      </div>

      <div className="flex w-full items-start gap-4">
        <div className="flex-1">
          <ClickTrackingTable rows={clickTracking} />
        </div>
        <div className="w-[344px]">
          <RecentActivity items={recentActivity} unreadCount={unreadCount} />
        </div>
      </div>

      <p className="w-full text-center font-mono text-[10px] text-text-muted">
        First-party analytics · no cookies · visitor IDs rotate daily · raw events expire after 24
        months
      </p>
    </div>
  );
}
