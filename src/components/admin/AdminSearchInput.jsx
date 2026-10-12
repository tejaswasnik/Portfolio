"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons.jsx";

/**
 * Debounced search box, writing `?search=` into the URL so an admin list
 * stays server-rendered/filterable by link, same pattern as its
 * segmented filters, just debounced since free text would otherwise
 * push a history entry per keystroke. Shared by the Projects (Figma
 * 65:515) and Skills (67:514) toolbars.
 * @param {{ basePath: string, placeholder: string, label: string, width?: string }} props
 */
export default function AdminSearchInput({ basePath, placeholder, label, width = "w-80" }) {
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
      router.replace(`${basePath}${params.toString() ? `?${params}` : ""}`);
    }, 300);
  }

  return (
    <label className={`flex h-[34px] ${width} items-center gap-2 rounded-lg border border-border-default bg-surface-2 px-3`}>
      <SearchIcon size={14} className="shrink-0 text-text-muted" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none"
      />
    </label>
  );
}
