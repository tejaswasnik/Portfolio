"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { CopyIcon, LockIcon, TrashIcon } from "@/components/ui/icons.jsx";
import { deleteMedia } from "@/app/admin/(dashboard)/media/actions.js";
import { useActionToast } from "@/lib/hooks/useActionToast.js";

/**
 * One card's copy/delete controls (Figma 71:646's "icon button — copy"
 * and "icon button — lock"/"icon button — trash"). Deleting is only ever
 * offered for a file with no live usage — in-use files show a disabled,
 * titled lock icon instead, matching the frame's own distinction.
 * @param {{ id: string, url: string, usage: Array<{ label: string }> }} props
 */
export default function MediaCardActions({ id, url, usage }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const notify = useActionToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      notify({ ok: true }, "URL copied");
    } catch {
      setError("Couldn't copy — select and copy the URL manually.");
      notify({ ok: false, error: "Couldn't copy — select and copy the URL manually." });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteMedia({ id });
    setDeleting(false);
    if (!result.ok) {
      setError(result.error || "Couldn't delete this file.");
      setConfirmOpen(false);
      notify(result);
      return;
    }
    setConfirmOpen(false);
    notify(result, "File deleted");
    router.refresh();
  }

  const inUse = usage.length > 0;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy file URL"
          title={copied ? "Copied!" : "Copy file URL"}
          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
        >
          <CopyIcon size={14} />
        </button>

        {inUse ? (
          <button
            type="button"
            disabled
            title={`In use — ${usage.map((u) => u.label).join(", ")}`}
            aria-label={`Can't delete — in use by ${usage.map((u) => u.label).join(", ")}`}
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary opacity-45"
          >
            <LockIcon size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete file"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary hover:border-border-hover"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>

      {error ? (
        <p role="alert" className="max-w-[160px] text-right font-mono text-[9px] text-text-secondary">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete file?">
        <p className="mb-6 text-sm text-text-secondary">
          This permanently removes the file from ImageKit and the media library. This can&apos;t
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="dashed" type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
