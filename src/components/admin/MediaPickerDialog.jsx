"use client";

import { useEffect, useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { listImageMedia } from "@/app/admin/(dashboard)/media/actions.js";

/**
 * "Pick from the library instead of re-uploading" (CLAUDE.md step 12),
 * opened from `Dropzone`'s image fields. Picking a file never deletes
 * whatever the field held before — that file might still be in use
 * elsewhere, so cleanup stays the media library's own job, which checks
 * live usage before it lets anything be deleted.
 * @param {{ open: boolean, onClose: () => void, onPick: (file: { url: string, fileId: string }) => void }} props
 */
export default function MediaPickerDialog({ open, onClose, onPick }) {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listImageMedia().then((result) => {
      if (cancelled) return;
      if (result.ok) setFiles(result.files);
      else setError("Couldn't load the media library.");
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Pick from library">
      {files === null ? (
        <p className="font-mono text-[11px] text-text-muted">Loading…</p>
      ) : error ? (
        <p role="alert" className="font-mono text-[11px] text-text-secondary">
          {error}
        </p>
      ) : files.length === 0 ? (
        <p className="font-mono text-[11px] text-text-muted">
          No images uploaded yet. Upload one to add it here.
        </p>
      ) : (
        <div className="grid max-h-[400px] grid-cols-4 gap-2 overflow-y-auto">
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => {
                onPick({ url: file.url, fileId: file.fileId });
                onClose();
              }}
              className="aspect-square overflow-hidden rounded-md border border-border-default bg-surface-3 transition-colors hover:border-accent/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
              <img src={file.url} alt={file.name} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </Dialog>
  );
}
