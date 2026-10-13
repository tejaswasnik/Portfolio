"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, MenuIcon } from "@/components/ui/icons.jsx";
import { currentPageLabel } from "./nav-items.js";
import { useAdminDrawer } from "./AdminShellProvider";

/**
 * Topbar breadcrumb + "View site" (Figma 53:95). Below `lg` (1024px) a
 * hamburger opens the off-canvas sidebar drawer (design.md §23); below
 * `md` (768px) the breadcrumb drops its "ADMIN /" prefix (truncated to
 * just the current page) and "View site" collapses to an icon-only
 * button, per §23's topbar rule for that width.
 */
export default function Topbar() {
  const pathname = usePathname();
  const { toggleDrawer } = useAdminDrawer();
  const label = currentPageLabel(pathname);

  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b border-dashed border-rail px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleDrawer}
          aria-label="Open navigation menu"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary lg:hidden"
        >
          <MenuIcon size={16} />
        </button>
        <p className="flex items-center gap-2 font-mono text-[11px]">
          <span className="hidden text-text-muted md:inline">ADMIN</span>
          <span className="hidden text-text-muted md:inline">/</span>
          <span className="uppercase text-text-primary">{label}</span>
        </p>
      </div>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View site"
        className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-2.5 py-1.5 font-mono text-[10px] font-bold text-text-primary"
      >
        <span className="hidden md:inline">VIEW SITE</span>
        <ArrowUpRightIcon size={12} />
      </a>
    </div>
  );
}
