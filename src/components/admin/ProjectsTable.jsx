"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Toggle from "@/components/ui/Toggle";
import { GripIcon, PencilIcon, TrashIcon } from "@/components/ui/icons.jsx";
import {
  deleteProject,
  reorderProjects,
  toggleProjectFeatured,
  toggleProjectPublished,
} from "@/app/admin/projects/actions.js";

const statusLabel = { ongoing: "Ongoing", completed: "Completed" };

/**
 * Admin projects table (Figma 65:543): drag-to-reorder, quick
 * featured/published toggles, edit/delete row actions.
 * @param {{
 *   projects: Array<{id: string, name: string, slug: string, status: string, featured: boolean, published: boolean, order: number, coverImage?: string}>,
 *   reorderDisabled: boolean,
 * }} props
 */
export default function ProjectsTable({ projects, reorderDisabled }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [dragId, setDragId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  async function handleToggle(action, project, field, nextValue) {
    setItems((current) =>
      current.map((p) => (p.id === project.id ? { ...p, [field]: nextValue } : p)),
    );
    const result = await action({ id: project.id, value: nextValue });
    if (!result.ok) {
      setItems((current) =>
        current.map((p) => (p.id === project.id ? { ...p, [field]: !nextValue } : p)),
      );
      setError(result.error || "Something went wrong.");
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

    const fromIndex = items.findIndex((p) => p.id === dragId);
    const toIndex = items.findIndex((p) => p.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
    setDragId(null);

    startTransition(async () => {
      const result = await reorderProjects({ orderedIds: next.map((p) => p.id) });
      if (!result.ok) {
        setItems(items);
        setError(result.error || "Could not save the new order.");
      } else {
        router.refresh();
      }
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteProject({ id: deleteTarget.id });
    if (result.ok) {
      setItems((current) => current.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } else {
      setError(result.error || "Could not delete this project.");
    }
  }

  return (
    <>
      {error ? (
        <p role="alert" className="w-full text-[11px] text-text-secondary">
          {error}
        </p>
      ) : null}

      <div className="flex w-full flex-col items-start rounded-xl border border-border-subtle bg-surface-1 px-5 pb-2 pt-1">
        <div className="flex w-full items-center gap-4 border-b border-border-subtle py-3">
          <div className="w-4" />
          <div className="w-14" />
          <div className="flex-1 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Project
          </div>
          <div className="w-[100px] font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Status
          </div>
          <div className="w-20 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Featured
          </div>
          <div className="w-[84px] font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Published
          </div>
          <div className="w-10 font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
            Order
          </div>
          <div className="w-16" />
        </div>

        {items.length === 0 ? (
          <p className="w-full py-10 text-center text-sm text-text-muted">
            No projects match these filters.
          </p>
        ) : (
          items.map((project) => (
            <div
              key={project.id}
              draggable={!reorderDisabled}
              onDragStart={() => handleDragStart(project.id)}
              onDragOver={(event) => handleDragOver(event, project.id)}
              onDrop={(event) => handleDrop(event, project.id)}
              className={`flex w-full items-center gap-4 border-b border-border-subtle py-3 last:border-b-0 ${
                project.published ? "" : "opacity-65"
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
              <div className="w-14">
                <div className="h-9 w-14 overflow-hidden rounded-md bg-gradient-to-br from-surface-3 to-surface-2">
                  {project.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                    <img src={project.coverImage} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-[13px] font-medium text-text-primary">{project.name}</p>
                <p className="font-mono text-[10px] text-text-muted">/projects/{project.slug}</p>
              </div>
              <div className="w-[100px]">
                <span
                  className={`inline-flex items-center rounded-[3px] border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase ${
                    project.status === "ongoing" ? "text-accent" : "text-text-primary"
                  }`}
                >
                  {statusLabel[project.status] ?? project.status}
                </span>
              </div>
              <div className="w-20">
                <Toggle
                  checked={project.featured}
                  label={`Featured — ${project.name}`}
                  onChange={(next) => handleToggle(toggleProjectFeatured, project, "featured", next)}
                />
              </div>
              <div className="w-[84px]">
                <Toggle
                  checked={project.published}
                  label={`Published — ${project.name}`}
                  onChange={(next) =>
                    handleToggle(toggleProjectPublished, project, "published", next)
                  }
                />
              </div>
              <div className="w-10 text-[11px] text-text-secondary">{project.order + 1}</div>
              <div className="flex w-16 items-start gap-1.5">
                <Link
                  href={`/admin/projects/${project.id}`}
                  aria-label={`Edit ${project.name}`}
                  className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
                >
                  <PencilIcon size={14} />
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${project.name}`}
                  onClick={() => setDeleteTarget(project)}
                  className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete project?"
      >
        <p className="mb-6 text-sm text-text-secondary">
          This permanently deletes <strong className="text-text-primary">{deleteTarget?.name}</strong>{" "}
          and removes it from the public site. This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="dashed" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
