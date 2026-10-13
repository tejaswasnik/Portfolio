"use client";

import { useEffect, useRef, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import SkillIcon from "@/components/ui/SkillIcon";
import Dropzone from "@/components/admin/Dropzone";
import { searchSkillIcons } from "@/app/admin/(dashboard)/skills/actions.js";

const LIBRARIES = [
  { value: "simple-icons", label: "Simple Icons", hint: "Brand logos" },
  { value: "lucide", label: "Lucide", hint: "Outline icons" },
  { value: "remixicon", label: "Remix Icon", hint: "Filled/outline + brands" },
];

/**
 * The admin "Add/Edit skill" icon picker (design.md §20, fixes round 2
 * Fix 2): search field + 6-column grid of matching icons (max 48, slug
 * shown on hover) across three libraries, or an upload for a custom
 * SVG/PNG. Selecting either calls `onChange` with the full field set
 * the form needs to persist and closes the dialog.
 *
 * Parent renders this only while open (`{open && <SkillIconPicker .../>}`)
 * so it mounts fresh every time — `initialQuery` seeds `query` once, via
 * `useState`'s initial value, rather than an effect re-syncing it on
 * every open (which would call `setState` directly in an effect body,
 * the thing `react-hooks/set-state-in-effect` exists to catch).
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   initialQuery?: string,
 *   onChange: (next: { iconLibrary?: string, iconSlug?: string, iconUrl?: string, preview: { path?: string, hex?: string, nodes?: Array } }) => void,
 * }} props
 */
export default function SkillIconPicker({ open, onClose, initialQuery = "", onChange }) {
  const [library, setLibrary] = useState("simple-icons");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  /** Debounced for typing; immediate for a library-tab click. */
  function runSearch(nextLibrary, nextQuery, { immediate = false } = {}) {
    clearTimeout(debounceRef.current);

    if (!nextQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    const fire = () => {
      searchSkillIcons({ library: nextLibrary, query: nextQuery }).then((result) => {
        if (requestId !== requestIdRef.current) return; // a newer search started
        setResults(result.ok ? result.results : []);
        setLoading(false);
      });
    };
    if (immediate) fire();
    else debounceRef.current = setTimeout(fire, 250);
  }

  // Seed the initial result grid once, from whatever the skill's name
  // already is — a lighter stand-in for "typing the name auto-suggests
  // a match" than live-searching on every keystroke of a field this
  // dialog doesn't own.
  useEffect(() => {
    // Deferred a tick so the state updates happen in a timer callback,
    // not synchronously in the effect body itself (same shape as the
    // debounce timer `runSearch` sets up for typed input, below).
    const id = setTimeout(() => runSearch(library, query, { immediate: true }), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: subsequent searches are triggered by the input/tab handlers below, not by re-running this effect
  }, []);

  function handleQueryChange(event) {
    const next = event.target.value;
    setQuery(next);
    runSearch(library, next);
  }

  function handleLibraryChange(value) {
    setLibrary(value);
    runSearch(value, query, { immediate: true });
  }

  function pick(icon) {
    onChange({
      iconLibrary: library,
      iconSlug: icon.slug,
      iconUrl: "",
      preview: { path: icon.path, hex: icon.hex, nodes: icon.nodes },
    });
    onClose();
  }

  function pickCustom({ url }) {
    onChange({ iconLibrary: "", iconSlug: "", iconUrl: url, preview: { url } });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Choose an icon">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {LIBRARIES.map((lib) => (
            <button
              key={lib.value}
              type="button"
              onClick={() => handleLibraryChange(lib.value)}
              title={lib.hint}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase transition-colors ${
                library === lib.value
                  ? "border-accent bg-surface-3 text-text-primary"
                  : "border-border-default text-text-muted hover:text-text-primary"
              }`}
            >
              {lib.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search icons…"
          autoFocus
          className="w-full rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus-visible:border-accent"
        />

        <div className="max-h-[320px] overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center font-mono text-[11px] text-text-muted">Searching…</p>
          ) : !query.trim() ? (
            <p className="py-6 text-center font-mono text-[11px] text-text-muted">
              Type to search {LIBRARIES.find((l) => l.value === library)?.label}.
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center font-mono text-[11px] text-text-muted">
              No icons match &quot;{query}&quot;.
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {results.map((icon) => (
                <button
                  key={icon.slug}
                  type="button"
                  title={icon.slug}
                  onClick={() => pick(icon)}
                  className="flex aspect-square items-center justify-center rounded-md border border-border-default bg-surface-2 text-text-primary transition-colors hover:border-accent/50"
                >
                  <SkillIcon {...icon} size={20} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle pt-4">
          <Dropzone
            value=""
            onChange={pickCustom}
            accept="image/svg+xml,image/png"
            maxSizeMB={0.2}
            kind="image"
            label="Custom icon"
            hint="SVG or PNG, max 200 KB"
            folder="/portfolio/skill-icons"
          />
        </div>
      </div>
    </Dialog>
  );
}
