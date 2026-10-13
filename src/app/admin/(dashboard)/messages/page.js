import { getDb } from "@/lib/db/client.js";
import { findMessages, filterAdminMessages } from "@/lib/db/collections/messages.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import SegmentedFilter from "@/components/admin/SegmentedFilter";
import MessagesTable from "@/components/admin/MessagesTable";
import { CheckIcon } from "@/components/ui/icons.jsx";
import { markAllRead } from "./actions.js";

export const metadata = { title: "Admin — Messages" };

const filterOptions = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "archived", label: "Archived" },
];

function buildFilterHref(current) {
  return (value) => {
    const params = new URLSearchParams();
    const next = { ...current, filter: value };
    if (next.search) params.set("search", next.search);
    if (next.filter && next.filter !== "all") params.set("filter", next.filter);
    const query = params.toString();
    return query ? `/admin/messages?${query}` : "/admin/messages";
  };
}

/**
 * Admin Messages inbox (Figma 70:7). Reads every message directly from
 * the database (admin needs archived ones too, not just a public view).
 * @param {{ searchParams: Promise<Record<string, string>> }} props
 */
export default async function AdminMessagesPage({ searchParams }) {
  const resolved = (await searchParams) ?? {};
  const search = resolved.search || "";
  const filter = ["unread", "archived"].includes(resolved.filter) ? resolved.filter : "all";

  const db = await getDb();
  const allMessages = serializeDocs(await findMessages(db));
  const filtered = filterAdminMessages(allMessages, { search, filter });

  const unreadCount = allMessages.filter((m) => !m.read && !m.archived).length;

  async function handleMarkAllRead() {
    "use server";
    await markAllRead();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">
            Messages
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            {allMessages.length} {allMessages.length === 1 ? "message" : "messages"} ·{" "}
            {unreadCount} unread · saved from the contact form
          </p>
        </div>
        <form action={handleMarkAllRead}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            <CheckIcon size={12} />
            Mark all read
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchInput
          basePath="/admin/messages"
          placeholder="Search name, email or message…"
          label="Search messages"
          width="w-80"
        />
        <SegmentedFilter
          options={filterOptions}
          activeValue={filter}
          buildHref={buildFilterHref({ search, filter })}
        />
      </div>

      <MessagesTable key={`${search}:${filter}`} messages={filtered} />

      <p className="w-full font-mono text-[10px] text-text-muted">
        Unread count shows as a badge in the sidebar. Messages that failed to email are saved and
        flagged for retry.
      </p>
    </div>
  );
}
