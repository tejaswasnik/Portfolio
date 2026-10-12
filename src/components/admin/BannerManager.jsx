"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { AlertIcon, CheckIcon, TrashIcon, UploadIcon } from "@/components/ui/icons.jsx";
import { useImageKitUpload } from "@/lib/imagekit/useImageKitUpload.js";
import { deleteImageKitFileAction } from "@/lib/imagekit/actions.js";
import { saveBanner } from "@/app/admin/(dashboard)/banner/actions.js";

const MAX_SIZE_MB = 5;
const EXPECTED_WIDTH = 760;
const EXPECTED_HEIGHT = 100;

const guidelines = [
  { title: "760 × 100 px", hint: "Aspect ratio guidance, warning if different" },
  { title: "5 MB maximum", hint: "Larger files are blocked before upload" },
  { title: "GIF only", hint: "Looping animation, first frame used for reduced motion" },
  { title: "ImageKit storage", hint: "Signed upload, old file deleted on replace" },
];

/** Reads a File's natural pixel dimensions client-side. */
function readImageDimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Admin Banner (Figma 69:7): a two-stage upload — picking a file
 * uploads it straight to ImageKit and stages it as "not saved" with
 * size/aspect-ratio warnings, and only "Use this banner" writes it to
 * `profile.bannerUrl`/`bannerFileId` (CLAUDE.md step 9: "preview, replace,
 * remove, revert to placeholder, 760 × 100 guidance warning, 5 MB limit").
 * `prefers-reduced-motion` handling for the banner GIF itself already
 * lives in the public `BannerMedia.jsx` (built in step 3).
 * @param {{ profile: { bannerUrl?: string, bannerFileId?: string } | null }} props
 */
export default function BannerManager({ profile }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef(null);

  const [bannerUrl, setBannerUrl] = useState(profile?.bannerUrl ?? "");
  const [bannerFileId, setBannerFileId] = useState(profile?.bannerFileId ?? "");
  const [pending, setPending] = useState(null); // { url, fileId, name, size, dimensions }
  const [sizeWarning, setSizeWarning] = useState("");
  const [ratioWarning, setRatioWarning] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { upload, uploading, progress, error: uploadError, setError: setUploadError } =
    useImageKitUpload({ folder: "/portfolio/banner" });

  async function stageFile(file) {
    if (!file) return;
    setError("");
    setSizeWarning("");
    setRatioWarning("");

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(
        `File is ${formatSize(file.size)}, over the ${MAX_SIZE_MB} MB limit. Compress the GIF or trim frames before saving.`,
      );
      return;
    }

    const dimensions = await readImageDimensions(file);
    if (dimensions && (dimensions.width !== EXPECTED_WIDTH || dimensions.height !== EXPECTED_HEIGHT)) {
      setRatioWarning(
        `Dimensions differ from ${EXPECTED_WIDTH} × ${EXPECTED_HEIGHT}. It will be cropped to fit, so check the preview.`,
      );
    }

    const result = await upload(file);
    if (!result.ok) return;

    setPending({ url: result.url, fileId: result.fileId, name: result.name, size: file.size, dimensions });
  }

  async function cancelPending() {
    if (pending?.fileId) await deleteImageKitFileAction({ fileId: pending.fileId }).catch(() => {});
    setPending(null);
    setSizeWarning("");
    setRatioWarning("");
  }

  async function useThisBanner() {
    if (!pending) return;
    setSaving(true);
    setError("");

    const result = await saveBanner({ bannerUrl: pending.url, bannerFileId: pending.fileId });
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Could not save the banner.");
      return;
    }

    if (bannerFileId && bannerFileId !== pending.fileId) {
      deleteImageKitFileAction({ fileId: bannerFileId }).catch(() => {});
    }

    setBannerUrl(pending.url);
    setBannerFileId(pending.fileId);
    setPending(null);
    router.refresh();
  }

  async function revertToPlaceholder() {
    setSaving(true);
    setError("");

    const result = await saveBanner({});
    setSaving(false);

    if (!result.ok) {
      setError(result.error || "Could not update the banner.");
      return;
    }

    if (bannerFileId) deleteImageKitFileAction({ fileId: bannerFileId }).catch(() => {});
    setBannerUrl("");
    setBannerFileId("");
    router.refresh();
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    stageFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="flex w-full items-start gap-6">
      <div className="flex flex-1 flex-col gap-4">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-border-default bg-surface-2 px-3 py-2.5 text-[12px] text-text-secondary"
          >
            {error}
          </p>
        ) : null}

        <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Current banner</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
              Live on site
            </p>
          </div>

          {bannerUrl ? (
            <div className="h-24 w-full overflow-hidden rounded-lg bg-gradient-to-r from-surface-3 to-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
              <img src={bannerUrl} alt="" className="size-full object-cover" />
            </div>
          ) : (
            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-surface-2">
              <p className="font-mono text-[11px] text-text-muted">No banner set</p>
            </div>
          )}

          {bannerUrl ? (
            <p className="flex gap-4 font-mono text-[10px] text-text-muted">
              <span>{decodeURIComponent(bannerUrl.split("/").pop() || bannerUrl)}</span>
              <span>{EXPECTED_WIDTH} × {EXPECTED_HEIGHT}</span>
            </p>
          ) : null}

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
            >
              <UploadIcon size={12} />
              Replace
            </button>
            <button
              type="button"
              disabled={!bannerUrl || saving}
              onClick={revertToPlaceholder}
              className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary disabled:opacity-40"
            >
              <TrashIcon size={12} />
              Remove
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Upload new banner</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
              Preview before saving
            </p>
          </div>

          {pending ? (
            <div className="flex w-full items-center gap-3 rounded-lg border border-border-default bg-surface-2 p-3">
              <div className="h-9 w-24 shrink-0 overflow-hidden rounded-md bg-gradient-to-r from-surface-3 to-surface-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF */}
                <img src={pending.url} alt="" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">{pending.name}</p>
                <p className="font-mono text-[10px] text-text-muted">
                  {pending.dimensions ? `${pending.dimensions.width} × ${pending.dimensions.height} · ` : ""}
                  {formatSize(pending.size)}
                </p>
              </div>
              <span className="shrink-0 rounded-[3px] border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase text-text-muted">
                Not saved
              </span>
            </div>
          ) : null}

          {ratioWarning ? (
            <div className="flex w-full items-start gap-2.5 rounded-lg border border-border-default bg-surface-2 px-3 py-2.5">
              <AlertIcon size={14} className="mt-0.5 shrink-0 text-text-secondary" />
              <p className="flex-1 font-mono text-[10px] text-text-secondary">{ratioWarning}</p>
            </div>
          ) : null}

          {uploadError ? (
            <div className="flex w-full items-start gap-2.5 rounded-lg border border-accent bg-surface-3 px-3 py-2.5">
              <AlertIcon size={14} className="mt-0.5 shrink-0 text-accent" />
              <p className="flex-1 font-mono text-[10px] text-text-secondary">{uploadError}</p>
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
            className={`flex h-[100px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed ${
              dragOver ? "border-accent bg-surface-3" : "border-border-default bg-surface-2"
            }`}
          >
            <span className="flex size-8 items-center justify-center rounded-2xl bg-bg">
              <UploadIcon size={16} className="text-text-primary" />
            </span>
            <p className="font-mono text-[11px] text-text-primary">
              {uploading ? `Uploading… ${progress}%` : "Drop a GIF here, or choose a file"}
            </p>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/gif"
              disabled={uploading}
              onChange={(event) => stageFile(event.target.files?.[0])}
              className="sr-only"
            />
          </label>

          <div className="flex w-full items-start justify-end gap-2">
            <Button type="button" variant="dashed" onClick={cancelPending} disabled={!pending}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={useThisBanner}
              disabled={!pending || saving}
              className="flex items-center justify-center rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-40"
            >
              {saving ? "Saving…" : "Use this banner"}
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
          <div className="flex w-full items-center justify-between">
            <p className="font-serif text-[22px] text-text-primary">Placeholder fallback</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.72px] text-text-muted">
              When no banner is set
            </p>
          </div>
          <div className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-surface-2">
            <span className="flex size-6 items-center justify-center rounded-xl bg-bg">
              <UploadIcon size={12} className="text-text-primary" />
            </span>
            <p className="font-mono text-[11px] font-bold text-text-primary">Upload GIF banner</p>
            <p className="font-mono text-[10px] text-text-muted">
              Reserved for a looping GIF image · {EXPECTED_WIDTH} × {EXPECTED_HEIGHT}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-[344px] flex-col gap-4 rounded-xl border border-border-subtle bg-surface-1 p-5">
        <p className="font-serif text-[22px] text-text-primary">Guidelines</p>
        {guidelines.map((rule) => (
          <div key={rule.title} className="flex w-full items-start gap-2.5">
            <CheckIcon size={14} className="mt-0.5 shrink-0 text-accent" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-medium text-text-primary">{rule.title}</p>
              <p className="font-mono text-[10px] text-text-muted">{rule.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
