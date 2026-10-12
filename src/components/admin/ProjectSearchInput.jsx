"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons.jsx";

/**
 * Debounced search box (Figma 65:515) — writes `?search=` into the URL so
 * the admin projects list stays server-rendered/filterable by link, same
 * pattern as the status/featured/published segments, just debounced
 * since free text would otherwise push a history entry per keystroke.
 */
export default function ProjectSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleChange(event) {
    const next = event.target.value;
    setValue(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (next.trim()) params.set("search", next);
      else params.delete("search");
      router.replace(`/admin/projects${params.toString() ? `?${params}` : ""}`);
    }, 300);
  }

  return (
    <label className="flex h-[34px] w-80 items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3">
      <SearchIcon size={14} className="shrink-0 text-text-muted" />
      <span className="sr-only">Search projects</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search projects…"
        className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
      />
    </label>
  );
}
