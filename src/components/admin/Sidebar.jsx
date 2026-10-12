"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "@/components/ui/icons.jsx";
import { NAV_GROUPS, isActiveRoute } from "./nav-items.js";

/**
 * 240px admin sidebar (Figma 53:3): logo, three nav groups, unread badge
 * on Messages, signed-in card with sign-out.
 * @param {{ unreadMessages: number }} props
 */
export default function Sidebar({ unreadMessages }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen w-60 flex-col gap-6 overflow-y-auto border-r border-dashed border-rail bg-bg px-4 py-5">
      <div className="flex items-center gap-2.5 pl-2">
        <span className="font-serif text-xl tracking-[0.5px] text-text-primary">TW.</span>
        <span className="rounded-sm border border-border-default bg-surface-3 px-1.5 py-0.5 font-mono text-[8px] font-bold text-accent">
          ADMIN
        </span>
      </div>

      {NAV_GROUPS.map((group) => (
        <nav key={group.label} aria-label={group.label} className="flex flex-col gap-1">
          <p className="font-mono text-[9px] uppercase tracking-[1.8px] text-text-muted">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            const badge = item.badgeKey === "unreadMessages" ? unreadMessages : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[34px] items-center justify-between rounded-md pl-3 pr-2.5 font-mono text-[11px] ${
                  active
                    ? "border border-border-default bg-surface-3 text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.Icon size={16} />
                  {item.label}
                </span>
                {badge ? (
                  <span className="rounded-full bg-heat-1 px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      ))}

      <div className="mt-auto flex items-center justify-between rounded-lg border border-border-subtle bg-surface-1 py-2.5 pl-2.5 pr-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full border border-border-default bg-surface-3 font-serif text-[13px] text-accent">
            TW
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-text-primary">Admin</p>
            <p className="font-mono text-[9px] text-text-muted">Signed in · owner</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <LogOutIcon size={14} />
        </button>
      </div>
    </div>
  );
}
