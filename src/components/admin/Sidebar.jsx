"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "@/components/ui/icons.jsx";
import { NAV_GROUPS, isActiveRoute } from "./nav-items.js";
import { useAdminDrawer } from "./AdminShellProvider";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap.js";

/**
 * 240px admin sidebar (Figma 53:3): logo, three nav groups, unread badge
 * on Messages, signed-in card with sign-out.
 *
 * Below `lg` (1024px, design.md §23) this becomes an off-canvas drawer
 * instead of a static column: the same content renders twice (a
 * `hidden lg:flex` static copy, and a `lg:hidden` overlay copy gated on
 * `drawerOpen`) rather than one copy whose container classes change,
 * since the overlay needs its own focus trap/backdrop/Esc handling that
 * the static sidebar must never have.
 * @param {{ unreadMessages: number }} props
 */
export default function Sidebar({ unreadMessages }) {
  const pathname = usePathname();
  const router = useRouter();
  const { drawerOpen, closeDrawer } = useAdminDrawer();
  const panelRef = useRef(null);

  useFocusTrap(panelRef, drawerOpen, closeDrawer);

  // Close the drawer on navigation (design.md §23: "closes on route change").
  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only pathname should re-trigger this
  }, [pathname]);

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const content = (
    <>
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
                className={`flex h-[44px] items-center justify-between rounded-md pl-3 pr-2.5 font-mono text-[11px] lg:h-[34px] ${
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
    </>
  );

  return (
    <>
      <div className="hidden h-screen w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-dashed border-rail bg-bg px-4 py-5 lg:flex">
        {content}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-bg/60"
            onClick={closeDrawer}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="relative z-10 flex h-screen w-[280px] flex-col gap-6 overflow-y-auto border-r border-border-subtle bg-bg px-4 py-5"
          >
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
