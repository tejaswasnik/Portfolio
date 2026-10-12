import Link from "next/link";
import { MailIcon, UploadIcon, ArrowRightIcon } from "@/components/ui/icons.jsx";

const ICONS = { message: MailIcon, download: UploadIcon, click: ArrowRightIcon };

/** "2m" / "3h" / "5d" relative time, matching Figma's recent-activity timestamps. */
function relativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

/**
 * Recent activity feed (Figma 53:2) — real messages and notable click
 * events only; see docs/DECISIONS.md step 11 for why fabricated
 * insights ("Workspace viewed 24 times") aren't reproduced here.
 * @param {{ items: Array<{kind: string, title: string, detail: string, createdAt: string}>, unreadCount: number }} props
 */
export default function RecentActivity({ items, unreadCount }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
      <div className="flex w-full items-center justify-between">
        <p className="font-serif text-[22px] text-text-primary">Recent activity</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
          {unreadCount} unread
        </p>
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-[11px] text-text-muted">Nothing yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            const Icon = ICONS[item.kind] || MailIcon;
            return (
              <div key={index} className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-secondary">
                  <Icon size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{item.title}</p>
                  {item.detail ? (
                    <p className="truncate font-mono text-[10px] text-text-muted">{item.detail}</p>
                  ) : null}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-text-muted">
                  {relativeTime(item.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/admin/messages"
        className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-default px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-text-primary"
      >
        Open inbox
        <ArrowRightIcon size={12} />
      </Link>
    </div>
  );
}
