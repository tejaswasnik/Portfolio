"use client";

import { useId, useRef, useState } from "react";
import { FileIcon, TrashIcon, UploadIcon } from "@/components/ui/icons.jsx";
import { useImageKitUpload } from "@/lib/imagekit/useImageKitUpload.js";
import { deleteImageKitFileAction } from "@/lib/imagekit/actions.js";
import { recordMediaUpload } from "@/app/admin/(dashboard)/media/actions.js";
import MediaPickerDialog from "@/components/admin/MediaPickerDialog";
import { useToast } from "@/components/ui/Toaster";

/**
 * Reusable single-file ImageKit uploader (CLAUDE.md step 9): drag/drop
 * or click to pick a file, uploads straight to ImageKit via the signed
 * `/api/imagekit-auth` token, shows a progress bar while uploading and
 * an inline error on failure, and previews the result (image thumbnail
 * or a file row for non-images, e.g. the resume PDF).
 *
 * `fileId` is the *currently known* ImageKit file id, if any — when
 * present, replacing or removing deletes that old file from ImageKit
 * (`deleteImageKitFileAction`); when absent (an existing url saved
 * before step 9, which never recorded a fileId), replacing still works,
 * it just can't clean up the old file since nothing ever tracked its id
 * — see docs/DECISIONS.md step 9.
 *
 * @param {{
 *   value: string,
 *   fileId?: string,
 *   onChange: (next: { url: string, fileId: string }) => void,
 *   accept?: string,
 *   maxSizeMB?: number,
 *   kind?: 'image' | 'file',
 *   label: string,
 *   hint?: string,
 *   folder?: string,
 * }} props
 */
export default function Dropzone({
  value,
  fileId = "",
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  kind = "image",
  label,
  hint,
  folder = "/portfolio",
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { upload, uploading, progress, error, setError } = useImageKitUpload({ folder });
  const toast = useToast();

  async function handleFile(file) {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      const message = `File is ${(file.size / 1024 / 1024).toFixed(1)} MB, over the ${maxSizeMB} MB limit.`;
      setError(message);
      toast.error("Upload failed", { detail: message });
      return;
    }

    const result = await upload(file);
    if (!result.ok) {
      toast.error("Upload failed");
      return;
    }

    recordMediaUpload({
      fileId: result.fileId,
      url: result.url,
      name: result.name || file.name,
      type: file.type || "application/octet-stream",
      size: result.size ?? file.size,
    }).catch(() => {});

    if (fileId) deleteImageKitFileAction({ fileId }).catch(() => {});
    onChange({ url: result.url, fileId: result.fileId });
    // Upload progress stays in the dropzone (design.md §21); the toast
    // fires once, on completion, labeled with whatever field this is.
    toast.success(`${label} uploaded`);
  }

  async function handleRemove() {
    if (fileId) await deleteImageKitFileAction({ fileId }).catch(() => {});
    onChange({ url: "", fileId: "" });
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {value ? (
        <div className="flex w-full items-center gap-3 rounded-lg border border-border-subtle bg-surface-2 p-3">
          {kind === "image" ? (
            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-surface-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
              <img src={value} alt="" className="size-full object-cover" />
            </div>
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border-icon bg-surface-icon-alt">
              <FileIcon size={16} className="text-text-secondary" />
            </span>
          )}
          <p className="flex-1 truncate text-[13px] text-text-primary">
            {decodeURIComponent(value.split("/").pop() || value)}
          </p>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${label}`}
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      ) : null}

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center ${
          dragOver ? "border-accent bg-surface-3" : "border-border-default bg-surface-2"
        }`}
      >
        <span className="flex size-8 items-center justify-center rounded-2xl bg-bg">
          <UploadIcon size={16} className="text-text-primary" />
        </span>
        <p className="font-mono text-[11px] text-text-primary">
          {uploading ? `Uploading… ${progress}%` : value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        </p>
        {hint ? <p className="font-mono text-[10px] text-text-muted">{hint}</p> : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={uploading}
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="sr-only"
        />
      </label>

      {kind === "image" ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="self-start font-mono text-[10px] text-text-muted underline hover:text-text-primary"
        >
          Browse library instead
        </button>
      ) : null}

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={onChange}
      />

      {uploading ? (
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-accent transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-[11px] text-text-secondary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
