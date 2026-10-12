"use client";

import { usePathname } from "next/navigation";
import { ArrowUpRightIcon } from "@/components/ui/icons.jsx";
import { currentPageLabel } from "./nav-items.js";

/** Topbar breadcrumb + "View site" (Figma 53:95). Date-range controls are step 11's job. */
export default function Topbar() {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center justify-between border-b border-dashed border-rail px-8">
      <p className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-text-muted">ADMIN</span>
        <span className="text-text-muted">/</span>
        <span className="uppercase text-text-primary">{currentPageLabel(pathname)}</span>
      </p>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-2.5 py-1.5 font-mono text-[10px] font-bold text-text-primary"
      >
        VIEW SITE
        <ArrowUpRightIcon size={12} />
      </a>
    </div>
  );
}
