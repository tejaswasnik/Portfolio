"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Toggle from "@/components/ui/Toggle";
import MoveButtons from "@/components/admin/MoveButtons";
import { useActionToast } from "@/lib/hooks/useActionToast.js";
import { CheckIcon, GripIcon } from "@/components/ui/icons.jsx";
import { SECTION_DESCRIPTIONS, SECTION_INDEX_META } from "@/lib/sections.js";
import {
  reorderSections,
  toggleSectionVisible,
} from "@/app/admin/(dashboard)/sections/actions.js";

/**
 * Admin Sections screen (Figma 67:836): drag-to-reorder list of the 8
 * fixed home sections with a visibility toggle per row, plus a live
 * "Index preview" of the resulting side index. Sections are a fixed set
 * (`sectionKeyValues`) — unlike Projects/Skills there's no add/delete,
 * only reorder and show/hide, matching the step 8 prompt's scope exactly
 * ("Sections 67:836 with toggles and drag-to-reorder").
 * @param {{ sections: Array<{id: string, key: string, label: string, visible: boolean, order: number}> }} props
 */
export default function SectionsManager({ sections }) {
  const router = useRouter();
  const [items, setItems] = useState(sections);
  const [dragId, setDragId] = useState(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const notify = useActionToast();

  const indexEntries = items
    .filter((section) => section.visible && SECTION_INDEX_META[section.key])
    .map((section) => SECTION_INDEX_META[section.key]);

  async function handleToggle(section, nextValue) {
    setItems((current) =>
      current.map((s) => (s.id === section.id ? { ...s, visible: nextValue } : s)),
    );
    const result = await toggleSectionVisible({ id: section.id, value: nextValue });
    if (!result.ok) {
      setItems((current) =>
        current.map((s) => (s.id === section.id ? { ...s, visible: !nextValue } : s)),
      );
      setError(result.error || "Something went wrong.");
      notify(result);
    } else {
      notify(result, nextValue ? "Section shown" : "Section hidden");
      router.refresh();
    }
  }

  function handleDragStart(id) {
    setDragId(id);
  }

  function handleDragOver(event, overId) {
    if (dragId === null || dragId === overId) return;
    event.preventDefault();
  }

  function handleDrop(event, overId) {
    if (dragId === null || dragId === overId) return;
    event.preventDefault();

    const fromIndex = items.findIndex((s) => s.id === dragId);
    const toIndex = items.findIndex((s) => s.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
    setDragId(null);

    startTransition(async () => {
      const result = await reorderSections({ orderedIds: next.map((s) => s.id) });
      applyReorderResult(result, items);
    });
  }

  /**
   * Swaps one section with its neighbor and saves the new order — the
   * keyboard/touch-friendly alternative to dragging (design.md §23).
   * @param {string} id
   * @param {-1 | 1} direction
   */
  function moveItem(id, direction) {
    const index = items.findIndex((s) => s.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setItems(next);

    startTransition(async () => {
      const result = await reorderSections({ orderedIds: next.map((s) => s.id) });
      applyReorderResult(result, items);
    });
  }

  /** Shared by `handleDrop` and `moveItem`: rolls back on failure, toasts either way. */
  function applyReorderResult(result, previousItems) {
    if (!result.ok) {
      setItems(previousItems);
      setError(result.error || "Could not save the new order.");
      notify(result);
    } else {
      notify(result, "Order saved");
      router.refresh();
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex w-full flex-col items-start rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Home page order</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
              Drag to reorder
            </p>
          </div>

          {items.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onDragOver={(event) => handleDragOver(event, section.id)}
              onDrop={(event) => handleDrop(event, section.id)}
              onDragEnd={() => setDragId(null)}
              className={`flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtle py-3 transition-opacity ${
                dragId === section.id ? "opacity-60" : section.visible ? "" : "opacity-65"
              }`}
            >
              <div className="hidden w-4 items-center sm:flex">
                <GripIcon size={14} className="cursor-grab text-text-muted" />
              </div>
              <div className="w-6 text-[11px] text-text-muted">
                {String(section.order + 1).padStart(2, "0")}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-sm font-medium text-text-primary">{section.label}</p>
                <p className="truncate font-mono text-[10px] text-text-muted">
                  {SECTION_DESCRIPTIONS[section.key]}
                </p>
              </div>
              <p
                className={`font-mono text-[9px] font-bold uppercase ${
                  section.visible ? "text-accent" : "text-text-muted"
                }`}
              >
                {section.visible ? "Visible" : "Hidden"}
              </p>
              <div className="w-8">
                <Toggle
                  checked={section.visible}
                  label={`${section.label} — visible on home page`}
                  onChange={(next) => handleToggle(section, next)}
                />
              </div>
              <MoveButtons
                disabled={false}
                atStart={index === 0}
                atEnd={index === items.length - 1}
                name={section.label}
                onMove={(direction) => moveItem(section.id, direction)}
                className="w-full justify-end sm:w-auto"
              />
            </div>
          ))}

          <div className="flex w-full items-center gap-4 pt-3">
            <div className="flex w-4 items-center text-accent">
              <CheckIcon size={14} />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-text-secondary">Footer</p>
              <p className="font-mono text-[10px] text-text-muted">
                Always shown · text is edited under Profile &amp; About
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-[11px] text-text-secondary">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-[344px]">
        <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Index preview</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
              Live
            </p>
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
            Index
          </p>
          <div className="flex flex-col gap-0.5">
            {indexEntries.length === 0 ? (
              <p className="font-mono text-[10px] text-text-muted">No index entries yet.</p>
            ) : (
              indexEntries.map((entry) => (
                <div key={entry.id} className="flex h-5 items-center gap-2">
                  <span className="h-px w-4 bg-rail" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-text-muted">{entry.label}</span>
                </div>
              ))
            )}
          </div>
          <p className="font-mono text-[10px] text-text-muted">
            Hidden sections disappear from the right-side index automatically. The index is
            desktop only.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <p className="font-serif text-[22px] text-text-primary">Save state</p>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-[11px] text-text-secondary">Saved · live on the public site</p>
          </div>
          <p className="font-mono text-[10px] text-text-muted">
            Order and visibility apply to the home page and the side index immediately (cache
            revalidated).
          </p>
        </div>
      </div>
    </div>
  );
}
