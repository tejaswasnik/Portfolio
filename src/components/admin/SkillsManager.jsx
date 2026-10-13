"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Toggle from "@/components/ui/Toggle";
import { GripIcon, PencilIcon, TrashIcon } from "@/components/ui/icons.jsx";
import MoveButtons from "@/components/admin/MoveButtons";
import SkillIcon from "@/components/ui/SkillIcon";
import SkillIconPicker from "@/components/admin/SkillIconPicker";
import { useActionToast } from "@/lib/hooks/useActionToast.js";
import {
  createSkill,
  deleteSkill,
  reorderSkills,
  toggleSkillVisible,
  updateSkill,
} from "@/app/admin/(dashboard)/skills/actions.js";

const fieldLabel = "font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted";
const fieldInput =
  "w-full rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus-visible:border-accent";

const emptyForm = {
  name: "",
  iconLibrary: "",
  iconSlug: "",
  iconUrl: "",
  iconPreviewNode: null,
  category: "",
  visible: true,
  orderChoice: "last",
};

/**
 * Admin Skills screen (Figma 67:7): list column (search, category
 * filter, drag-to-reorder table with quick show/hide + delete) and a
 * side panel that doubles as the Add and Edit forms — clicking a row's
 * pencil loads that skill into the same panel, matching the single
 * frame Figma gives for "Add skill" (no separate Edit frame exists).
 *
 * Icon is picked via `SkillIconPicker` (design.md §20, fixes round 2
 * Fix 2) — a search-and-pick dialog across simple-icons/Lucide/Remix
 * Icon, or a custom SVG/PNG upload. `form.iconPreviewNode` is a plain
 * React node (either the skill's existing `iconNode`, already rendered
 * server-side, or a fresh `<SkillIcon>` built from the picker's search
 * result) — never re-resolved client-side, since the lookup packages
 * themselves are server-only (see `src/lib/icons/resolveSkillIcon.js`).
 *
 * @param {{
 *   skills: Array<{id: string, name: string, iconLibrary?: string, iconSlug?: string, iconUrl?: string, iconNode: React.ReactNode, category: string, visible: boolean, order: number}>,
 *   totalCount: number,
 *   categories: string[],
 *   reorderDisabled: boolean,
 * }} props
 */
export default function SkillsManager({ skills, totalCount, categories, reorderDisabled }) {
  const router = useRouter();
  const [items, setItems] = useState(skills);
  const [dragId, setDragId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const notify = useActionToast();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const orderOptions = Array.from(
    { length: (editingId ? totalCount - 1 : totalCount) + 1 },
    (_, i) => i + 1,
  );

  function startEdit(skill) {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      iconLibrary: skill.iconLibrary || "",
      iconSlug: skill.iconSlug || "",
      iconUrl: skill.iconUrl || "",
      iconPreviewNode: skill.iconNode,
      category: skill.category || "",
      visible: skill.visible,
      orderChoice: skill.order + 1,
    });
    setFieldErrors({});
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setError("");
  }

  async function handleToggle(skill, nextValue) {
    setItems((current) =>
      current.map((s) => (s.id === skill.id ? { ...s, visible: nextValue } : s)),
    );
    const result = await toggleSkillVisible({ id: skill.id, value: nextValue });
    if (!result.ok) {
      setItems((current) =>
        current.map((s) => (s.id === skill.id ? { ...s, visible: !nextValue } : s)),
      );
      setError(result.error || "Something went wrong.");
      notify(result);
    } else {
      notify(result, nextValue ? "Skill shown" : "Skill hidden");
    }
  }

  function handleDragStart(id) {
    if (reorderDisabled) return;
    setDragId(id);
  }

  function handleDragOver(event, overId) {
    if (reorderDisabled || dragId === null || dragId === overId) return;
    event.preventDefault();
  }

  function handleDrop(event, overId) {
    if (reorderDisabled || dragId === null || dragId === overId) return;
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
      const result = await reorderSkills({ orderedIds: next.map((s) => s.id) });
      applyReorderResult(result, items);
    });
  }

  /**
   * Swaps one skill with its neighbor and saves the new order — the
   * keyboard/touch-friendly alternative to dragging (design.md §23).
   * @param {string} id
   * @param {-1 | 1} direction
   */
  function moveItem(id, direction) {
    if (reorderDisabled) return;
    const index = items.findIndex((s) => s.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setItems(next);

    startTransition(async () => {
      const result = await reorderSkills({ orderedIds: next.map((s) => s.id) });
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteSkill({ id: deleteTarget.id });
    if (result.ok) {
      setItems((current) => current.filter((s) => s.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) cancelEdit();
      setDeleteTarget(null);
      notify(result, "Skill deleted");
      router.refresh();
    } else {
      setError(result.error || "Could not delete this skill.");
      notify(result);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      name: form.name,
      iconLibrary: form.iconLibrary || "simple-icons",
      iconSlug: form.iconSlug,
      iconUrl: form.iconUrl,
      category: form.category,
      visible: form.visible,
      orderChoice: form.orderChoice,
    };

    const result = editingId
      ? await updateSkill({ ...payload, id: editingId })
      : await createSkill(payload);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong. Please try again.");
      setFieldErrors(result.fieldErrors || {});
      notify(result);
      return;
    }

    notify(result, editingId ? "Changes saved" : "Skill added");
    cancelEdit();
    router.refresh();
  }

  return (
    <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
      <div className="flex w-full flex-1 flex-col gap-4">
        <div className="flex w-full flex-col items-start rounded-xl border border-border-subtle bg-surface-1 px-5 pb-2 pt-1">
          <div className="hidden w-full items-center gap-4 border-b border-border-subtle py-3 md:flex">
            <div className="w-4" />
            <div className="w-8" />
            <div className="flex-1 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
              Skill
            </div>
            <div className="w-24 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
              Category
            </div>
            <div className="w-[60px] font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
              Shown
            </div>
            <div className="w-16 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
              Order
            </div>
            <div className="w-16" />
          </div>

          {items.length === 0 ? (
            <p className="w-full py-10 text-center text-sm text-text-muted">
              No skills match these filters.
            </p>
          ) : (
            items.map((skill, index) => (
              <div key={skill.id} className="w-full">
                {/* Mobile card */}
                <div
                  className={`flex w-full flex-col gap-3 border-b border-border-subtle py-3 last:border-b-0 md:hidden ${
                    skill.visible ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-icon bg-surface-icon-alt text-text-chip">
                      {skill.iconNode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-text-primary">
                        {skill.name}
                      </p>
                      <p className="truncate font-mono text-[10px] text-text-muted">
                        {skill.category || "—"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Edit ${skill.name}`}
                      onClick={() => startEdit(skill)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary"
                    >
                      <PencilIcon size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${skill.name}`}
                      onClick={() => setDeleteTarget(skill)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-text-muted">
                      Shown
                      <Toggle
                        checked={skill.visible}
                        label={`Shown — ${skill.name}`}
                        onChange={(next) => handleToggle(skill, next)}
                      />
                    </label>
                    <MoveButtons
                      disabled={reorderDisabled}
                      atStart={index === 0}
                      atEnd={index === items.length - 1}
                      name={skill.name}
                      onMove={(direction) => moveItem(skill.id, direction)}
                      className="ml-auto"
                    />
                  </div>
                </div>

                {/* Desktop row */}
                <div
                  draggable={!reorderDisabled}
                  onDragStart={() => handleDragStart(skill.id)}
                  onDragOver={(event) => handleDragOver(event, skill.id)}
                  onDrop={(event) => handleDrop(event, skill.id)}
                  onDragEnd={() => setDragId(null)}
                  className={`hidden w-full items-center gap-4 border-b border-border-subtle py-2.5 transition-opacity last:border-b-0 md:flex ${
                    dragId === skill.id ? "opacity-60" : skill.visible ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex w-4 items-center">
                    <GripIcon
                      size={14}
                      className={
                        reorderDisabled
                          ? "cursor-not-allowed text-text-muted/50"
                          : "cursor-grab text-text-muted"
                      }
                    />
                  </div>
                  <div className="flex w-8 items-center">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-border-icon bg-surface-icon-alt text-text-chip">
                      {skill.iconNode}
                    </span>
                  </div>
                  <div className="flex-1 text-[13px] font-medium text-text-primary">
                    {skill.name}
                  </div>
                  <div className="w-24 font-mono text-[10px] text-text-muted">
                    {skill.category || "—"}
                  </div>
                  <div className="w-[60px]">
                    <Toggle
                      checked={skill.visible}
                      label={`Shown — ${skill.name}`}
                      onChange={(next) => handleToggle(skill, next)}
                    />
                  </div>
                  <div className="flex w-16 items-center gap-1 text-[11px] text-text-secondary">
                    {skill.order + 1}
                    <MoveButtons
                      disabled={reorderDisabled}
                      atStart={index === 0}
                      atEnd={index === items.length - 1}
                      name={skill.name}
                      onMove={(direction) => moveItem(skill.id, direction)}
                    />
                  </div>
                  <div className="flex w-16 items-start gap-1.5">
                    <button
                      type="button"
                      aria-label={`Edit ${skill.name}`}
                      onClick={() => startEdit(skill)}
                      className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary transition-colors hover:border-border-hover"
                    >
                      <PencilIcon size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${skill.name}`}
                      onClick={() => setDeleteTarget(skill)}
                      className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary transition-colors hover:border-border-hover"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error ? (
          <p role="alert" className="text-[11px] text-text-secondary">
            {error}
          </p>
        ) : null}

        <p className="w-full font-mono text-[10px] text-text-muted">
          Hidden skills stay in the list and project tags, but are not rendered under Tech Stack
          on the public site.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5 lg:w-[344px]"
      >
        <div className="flex w-full items-center justify-between">
          <p className="font-serif text-[22px] text-text-primary">
            {editingId ? "Edit skill" : "Add skill"}
          </p>
          <p className={fieldLabel}>{editingId ? "EDITING" : "NEW"}</p>
        </div>

        <label className="flex w-full flex-col gap-1.5">
          <span className={fieldLabel}>Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            placeholder="e.g. GraphQL"
            required
            className={fieldInput}
          />
          {fieldErrors.name ? (
            <span className="text-[11px] text-text-secondary">{fieldErrors.name[0]}</span>
          ) : null}
        </label>

        <div className="flex w-full flex-col gap-1.5">
          <span className={fieldLabel}>Icon</span>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-icon bg-surface-icon-alt text-text-chip">
              {form.iconPreviewNode ?? <SkillIcon name={form.name} size={16} />}
            </span>
            <button
              type="button"
              onClick={() => setIconPickerOpen(true)}
              className="flex-1 rounded-lg border border-dashed border-border-default px-3 py-2.5 text-left font-mono text-[11px] text-text-muted transition-colors hover:border-accent/50 hover:text-text-primary"
            >
              {form.iconUrl
                ? "Custom upload — change…"
                : form.iconSlug
                  ? `${form.iconSlug} — change…`
                  : "Choose an icon…"}
            </button>
          </div>
          {fieldErrors.iconSlug ? (
            <span className="text-[11px] text-text-secondary">{fieldErrors.iconSlug[0]}</span>
          ) : null}
        </div>

        {iconPickerOpen ? (
          <SkillIconPicker
            open={iconPickerOpen}
            onClose={() => setIconPickerOpen(false)}
            initialQuery={form.name}
            onChange={({ iconLibrary, iconSlug, iconUrl, preview }) =>
              setForm((f) => ({
                ...f,
                iconLibrary,
                iconSlug,
                iconUrl,
                iconPreviewNode: <SkillIcon {...preview} size={16} />,
              }))
            }
          />
        ) : null}

        <label className="flex w-full flex-col gap-1.5">
          <span className={fieldLabel}>Category (optional)</span>
          <input
            value={form.category}
            onChange={(event) => setForm((f) => ({ ...f, category: event.target.value }))}
            placeholder="e.g. Frontend"
            list="skill-categories"
            className={fieldInput}
          />
          <datalist id="skill-categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="flex w-full flex-col gap-1.5">
          <span className={fieldLabel}>Display order</span>
          <select
            value={form.orderChoice}
            onChange={(event) =>
              setForm((f) => ({
                ...f,
                orderChoice: event.target.value === "last" ? "last" : Number(event.target.value),
              }))
            }
            className={`${fieldInput} font-mono`}
          >
            {orderOptions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
            <option value="last">Last</option>
          </select>
        </label>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-[13px] font-medium text-text-primary">Show on portfolio</p>
            <p className="font-mono text-[10px] text-text-muted">Rendered under Tech Stack</p>
          </div>
          <Toggle
            checked={form.visible}
            label="Show on portfolio"
            onChange={(next) => setForm((f) => ({ ...f, visible: next }))}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center rounded-md border border-cta-bg bg-cta-bg px-3 py-[11px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
        >
          {submitting ? "Saving…" : editingId ? "Save changes" : "Add skill"}
        </button>

        {editingId ? (
          <Button type="button" variant="dashed" className="w-full" onClick={cancelEdit}>
            Cancel
          </Button>
        ) : null}
      </form>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete skill?"
      >
        <p className="mb-6 text-sm text-text-secondary">
          This permanently deletes <strong className="text-text-primary">{deleteTarget?.name}</strong>.
          Projects already tagged with it keep the reference but it stops rendering. This can&apos;t
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="dashed" type="button" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
