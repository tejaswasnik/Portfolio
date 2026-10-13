"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import Dialog from "@/components/ui/Dialog";
import MediaPickerDialog from "@/components/admin/MediaPickerDialog";
import { CopyIcon, PencilIcon, TrashIcon, UploadIcon } from "@/components/ui/icons.jsx";
import { useImageKitUpload } from "@/lib/imagekit/useImageKitUpload.js";
import { readImageDimensions } from "@/lib/imagekit/readImageDimensions.js";
import { recordMediaUpload } from "@/app/admin/(dashboard)/media/actions.js";
import { useActionToast } from "@/lib/hooks/useActionToast.js";
import { useToast } from "@/components/ui/Toaster";
import { defaultSizeFromAspectRatio } from "@/lib/interestImages/placement.js";
import {
  bulkDeleteInterestImages,
  bulkSetInterestImagesVisible,
  createInterestImage,
  deleteInterestImage,
  duplicateInterestImage,
  replaceInterestImage,
  resetInterestImagePosition,
  shuffleInterestImagePositions,
  toggleInterestImageVisible,
  updateInterestImageLayout,
} from "@/app/admin/(dashboard)/interest-images/actions.js";

const UNDO_WINDOW_MS = 8000;
const MAX_SIZE_MB = 5;

/**
 * Admin Interest images gallery manager (task spec §4.1-4.3). No canvas
 * drag/resize/rotate editor — each item's position/size/rotation are
 * numeric fields in an expandable panel instead, with "Preview on site"
 * (the page header's link) as the way to see the real result. Everything
 * else in the spec (add via drag-drop of one or many files, replace,
 * remove with an 8s undo, duplicate, visible toggle, alt text, pick from
 * the media library, bulk hide/show/delete, shuffle positions, the n/max
 * counter) is implemented.
 * @param {{ items: Array, max: number }} props
 */
export default function InterestImagesManager({ items: initialItems, max }) {
  const router = useRouter();
  const notify = useActionToast();
  const toast = useToast();

  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const pendingRemovalsRef = useRef(new Map()); // id -> timeout handle

  const addInputId = useId();
  const addInputRef = useRef(null);
  const { upload } = useImageKitUpload({ folder: "/portfolio/interest-images" });

  const atCap = items.length >= max;

  function toggleSelected(id) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // --- Add (one or many files) -------------------------------------

  async function addFiles(fileList) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    setAdding(true);
    let added = 0;
    let skipped = 0;

    for (const file of files) {
      if (items.length + added >= max) {
        skipped++;
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_SIZE_MB} MB — skipped.`);
        continue;
      }

      const dimensions = await readImageDimensions(file);
      const uploadResult = await upload(file);
      if (!uploadResult.ok) {
        toast.error(`${file.name} failed to upload.`);
        continue;
      }

      recordMediaUpload({
        fileId: uploadResult.fileId,
        url: uploadResult.url,
        name: uploadResult.name || file.name,
        type: file.type,
        size: uploadResult.size ?? file.size,
      }).catch(() => {});

      const size = defaultSizeFromAspectRatio({
        naturalWidth: dimensions?.width ?? 160,
        naturalHeight: dimensions?.height ?? 160,
      });

      if (Math.max(dimensions?.width ?? 0, dimensions?.height ?? 0) < 240) {
        toast.info(`${file.name} is under 240px on its longest side — it may look soft.`);
      }

      const result = await createInterestImage({
        imageUrl: uploadResult.url,
        fileId: uploadResult.fileId,
        width: size.width,
        height: size.height,
      });

      if (!result.ok) {
        notify(result);
        continue;
      }

      setItems((current) => [
        ...current,
        {
          id: result.id,
          imageUrl: uploadResult.url,
          fileId: uploadResult.fileId,
          alt: "",
          width: size.width,
          height: size.height,
          offsetX: result.offsetX,
          topPct: result.topPct,
          rotation: result.rotation,
          visible: true,
          order: result.order,
        },
      ]);
      added++;
    }

    setAdding(false);
    if (added > 0) toast.success(added === 1 ? "Image added" : `${added} images added`);
    if (skipped > 0) toast.error(`${max} images is the limit — ${skipped} file${skipped === 1 ? "" : "s"} skipped.`);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    addFiles(event.dataTransfer.files);
  }

  // --- Per-item mutations --------------------------------------------

  async function handleToggleVisible(item, nextValue) {
    setItems((current) => current.map((i) => (i.id === item.id ? { ...i, visible: nextValue } : i)));
    const result = await toggleInterestImageVisible({ id: item.id, value: nextValue });
    if (!result.ok) {
      setItems((current) => current.map((i) => (i.id === item.id ? { ...i, visible: !nextValue } : i)));
      notify(result);
    }
  }

  async function handleReplace(item, file) {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File is over ${MAX_SIZE_MB} MB.`);
      return;
    }
    const result = await upload(file);
    if (!result.ok) {
      toast.error("Upload failed.");
      return;
    }
    recordMediaUpload({
      fileId: result.fileId,
      url: result.url,
      name: result.name || file.name,
      type: file.type,
      size: result.size ?? file.size,
    }).catch(() => {});

    const saved = await replaceInterestImage({ id: item.id, imageUrl: result.url, fileId: result.fileId });
    if (!saved.ok) {
      notify(saved);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, imageUrl: result.url, fileId: result.fileId } : i)),
    );
    toast.success("Image replaced");
  }

  async function handlePickFromLibrary(item, picked) {
    const saved = await replaceInterestImage({ id: item.id, imageUrl: picked.url, fileId: picked.fileId });
    if (!saved.ok) {
      notify(saved);
      return;
    }
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, imageUrl: picked.url, fileId: picked.fileId } : i)),
    );
    toast.success("Image replaced");
  }

  async function handleDuplicate(item) {
    if (atCap) {
      toast.error(`${max} images is the limit — remove one first.`);
      return;
    }
    const result = await duplicateInterestImage({ id: item.id });
    if (!result.ok) {
      notify(result);
      return;
    }
    setItems((current) => [...current, { ...result }]);
    toast.success("Image duplicated");
  }

  /** Removes it from the grid immediately; the real delete only fires after the undo window. */
  function handleRemove(item) {
    setItems((current) => current.filter((i) => i.id !== item.id));
    setSelected((current) => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });

    const timer = setTimeout(async () => {
      pendingRemovalsRef.current.delete(item.id);
      const result = await deleteInterestImage({ id: item.id });
      if (!result.ok) notify(result);
    }, UNDO_WINDOW_MS);
    pendingRemovalsRef.current.set(item.id, timer);

    toast.info("Image removed", {
      actionLabel: "Undo",
      duration: UNDO_WINDOW_MS,
      onAction: () => {
        const pending = pendingRemovalsRef.current.get(item.id);
        if (pending) {
          clearTimeout(pending);
          pendingRemovalsRef.current.delete(item.id);
        }
        setItems((current) => [...current, item].sort((a, b) => a.order - b.order));
      },
    });
  }

  async function handleResetPosition(item) {
    const result = await resetInterestImagePosition({ id: item.id });
    if (!result.ok) {
      notify(result);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.id === item.id
          ? { ...i, offsetX: result.offsetX, topPct: result.topPct, rotation: result.rotation }
          : i,
      ),
    );
    toast.success("Position reset");
  }

  async function handleSaveLayout(item, layout) {
    const result = await updateInterestImageLayout({ items: [{ id: item.id, ...layout }] });
    if (!result.ok) {
      notify(result);
      return;
    }
    setItems((current) => current.map((i) => (i.id === item.id ? { ...i, ...layout } : i)));
    toast.success("Saved");
    setExpandedId(null);
  }

  // --- Bulk + shuffle --------------------------------------------------

  async function handleBulkVisibility(value) {
    const ids = [...selected];
    setItems((current) => current.map((i) => (ids.includes(i.id) ? { ...i, visible: value } : i)));
    const result = await bulkSetInterestImagesVisible({ ids, value });
    notify(result, value ? "Images shown" : "Images hidden");
    clearSelection();
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    const result = await bulkDeleteInterestImages({ ids });
    if (!result.ok) {
      notify(result);
      return;
    }
    setItems((current) => current.filter((i) => !ids.includes(i.id)));
    toast.success(`${ids.length} image${ids.length === 1 ? "" : "s"} deleted`);
    clearSelection();
  }

  async function handleShuffle() {
    setShuffling(true);
    const result = await shuffleInterestImagePositions();
    setShuffling(false);
    if (!result.ok) {
      notify(result);
      return;
    }
    const byId = new Map(result.items.map((p) => [p.id, p]));
    setItems((current) => current.map((i) => (byId.has(i.id) ? { ...i, ...byId.get(i.id) } : i)));
    toast.success("Positions shuffled");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center ${
          dragOver ? "border-accent bg-surface-3" : "border-border-default bg-surface-1"
        }`}
      >
        <span className="flex size-9 items-center justify-center rounded-2xl bg-bg">
          <UploadIcon size={18} className="text-text-primary" />
        </span>
        <p className="font-mono text-[11px] text-text-primary">
          {adding ? "Uploading…" : "Drop one or more images here, or choose files"}
        </p>
        <p className="font-mono text-[10px] text-text-muted">JPG, PNG, WebP or AVIF · 5 MB max each</p>
        <label
          htmlFor={addInputId}
          className="mt-1 cursor-pointer rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
        >
          Add images
        </label>
        <input
          ref={addInputRef}
          id={addInputId}
          type="file"
          accept="image/*"
          multiple
          disabled={adding || atCap}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
          className="sr-only"
        />
        {atCap ? (
          <p className="font-mono text-[10px] text-text-secondary">
            {max} / {max} — remove an image to add another.
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[1.2px] text-text-muted">
          {items.length} / {max}
        </p>
        <Button variant="dashed" onClick={handleShuffle} disabled={shuffling || items.length === 0}>
          {shuffling ? "Shuffling…" : "Shuffle positions"}
        </Button>
      </div>

      {selected.size > 0 ? (
        <div className="flex w-full items-center justify-between rounded-lg border border-border-default bg-surface-2 px-3.5 py-2.5">
          <p className="font-mono text-[11px] text-text-primary">{selected.size} selected</p>
          <div className="flex items-center gap-2">
            <Button variant="dashed" onClick={() => handleBulkVisibility(true)}>
              Show
            </Button>
            <Button variant="dashed" onClick={() => handleBulkVisibility(false)}>
              Hide
            </Button>
            <Button variant="dashed" onClick={handleBulkDelete}>
              Delete
            </Button>
            <Button variant="dashed" onClick={clearSelection}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-border-subtle bg-surface-1 p-8 text-center font-mono text-[11px] text-text-muted">
          No images yet. Add one to decorate the page margins.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <InterestImageCard
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              expanded={expandedId === item.id}
              onToggleSelected={() => toggleSelected(item.id)}
              onToggleExpanded={() => setExpandedId((current) => (current === item.id ? null : item.id))}
              onToggleVisible={(value) => handleToggleVisible(item, value)}
              onReplace={(file) => handleReplace(item, file)}
              onPickFromLibrary={(picked) => handlePickFromLibrary(item, picked)}
              onDuplicate={() => handleDuplicate(item)}
              onRemove={() => handleRemove(item)}
              onResetPosition={() => handleResetPosition(item)}
              onSaveLayout={(layout) => handleSaveLayout(item, layout)}
              atCap={atCap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** @param {{ item: object, selected: boolean, expanded: boolean, atCap: boolean }} props */
function InterestImageCard({
  item,
  selected,
  expanded,
  onToggleSelected,
  onToggleExpanded,
  onToggleVisible,
  onReplace,
  onPickFromLibrary,
  onDuplicate,
  onRemove,
  onResetPosition,
  onSaveLayout,
  atCap,
}) {
  const replaceInputId = useId();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [layout, setLayout] = useState({
    width: item.width,
    height: item.height,
    offsetX: item.offsetX,
    topPct: item.topPct,
    rotation: item.rotation,
    alt: item.alt ?? "",
  });

  function setField(field, raw) {
    const value = field === "alt" ? raw : Number(raw);
    setLayout((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border-default bg-surface-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, admin preview thumbnail */}
        <img src={item.imageUrl} alt="" className="size-full object-cover" />
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label="Select this image"
          className="absolute left-2 top-2 size-4 accent-accent"
        />
        <span className="absolute right-2 top-2 rounded-[3px] border border-border-default bg-bg/80 px-1.5 py-0.5 font-mono text-[9px] text-text-primary">
          {item.rotation > 0 ? "+" : ""}
          {item.rotation}°
        </span>
      </div>

      <div className="flex items-center justify-between">
        <Toggle checked={item.visible} onChange={onToggleVisible} label={item.visible ? "Hide image" : "Show image"} />
        <div className="flex items-center gap-1">
          <label
            htmlFor={replaceInputId}
            aria-label="Replace image"
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
          >
            <UploadIcon size={13} />
          </label>
          <input
            id={replaceInputId}
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onReplace(file);
              event.target.value = "";
            }}
            className="sr-only"
          />
          <button
            type="button"
            aria-label="Duplicate image"
            disabled={atCap}
            onClick={onDuplicate}
            className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover disabled:opacity-40"
          >
            <CopyIcon size={13} />
          </button>
          <button
            type="button"
            aria-label="Edit layout and alt text"
            onClick={onToggleExpanded}
            className={`flex size-7 items-center justify-center rounded-md border bg-surface-3 text-text-primary hover:border-border-hover ${
              expanded ? "border-accent" : "border-border-default"
            }`}
          >
            <PencilIcon size={13} />
          </button>
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => setConfirmingDelete(true)}
            className="flex size-7 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
          >
            <TrashIcon size={13} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="self-start font-mono text-[10px] text-text-muted underline hover:text-text-primary"
      >
        Browse library instead
      </button>

      {expanded ? (
        <div className="flex flex-col gap-2.5 border-t border-border-subtle pt-2.5">
          <label className="flex flex-col gap-1 font-mono text-[10px] text-text-muted">
            Alt text (blank = decorative)
            <input
              type="text"
              value={layout.alt}
              maxLength={140}
              onChange={(event) => setField("alt", event.target.value)}
              className="rounded-md border border-border-default bg-surface-2 px-2 py-1.5 text-[12px] text-text-primary outline-none focus-visible:border-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Width" value={layout.width} min={40} max={400} onChange={(v) => setField("width", v)} />
            <NumberField label="Height" value={layout.height} min={40} max={400} onChange={(v) => setField("height", v)} />
            <NumberField label="Offset X" value={layout.offsetX} min={-700} max={700} onChange={(v) => setField("offsetX", v)} />
            <NumberField label="Top %" value={layout.topPct} min={0} max={100} onChange={(v) => setField("topPct", v)} />
            <NumberField label="Rotation" value={layout.rotation} min={-15} max={15} onChange={(v) => setField("rotation", v)} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="dashed" onClick={onResetPosition}>
              Reset position
            </Button>
            <Button variant="primary" className="px-4 py-2 text-[11px]" onClick={() => onSaveLayout(layout)}>
              Save
            </Button>
          </div>
        </div>
      ) : null}

      <MediaPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onPickFromLibrary} />

      <Dialog open={confirmingDelete} onClose={() => setConfirmingDelete(false)} title="Remove this image?">
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-text-secondary">
            It disappears from the home page right away. You can undo for 8 seconds from the toast that appears.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="dashed" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setConfirmingDelete(false);
                onRemove();
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="flex flex-col gap-1 font-mono text-[10px] text-text-muted">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-border-default bg-surface-2 px-2 py-1.5 text-[12px] text-text-primary outline-none focus-visible:border-accent"
      />
    </label>
  );
}
