"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon } from "@/components/ui/icons.jsx";
import { useImageKitUpload } from "@/lib/imagekit/useImageKitUpload.js";
import { recordMediaUpload } from "@/app/admin/(dashboard)/media/actions.js";

const MAX_SIZE_MB = 20;

/** Media library's own "Upload file" button (Figma 71:646) — catalogs the file directly, with no owning form/field. */
export default function MediaUploadButton() {
  const inputId = useId();
  const inputRef = useRef(null);
  const router = useRouter();
  const { upload, uploading, error, setError } = useImageKitUpload({ folder: "/portfolio" });
  const [localError, setLocalError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB, over the ${MAX_SIZE_MB} MB limit.`);
      return;
    }

    const result = await upload(file);
    if (!result.ok) return;

    const recorded = await recordMediaUpload({
      fileId: result.fileId,
      url: result.url,
      name: result.name || file.name,
      type: file.type || "application/octet-stream",
      size: result.size ?? file.size,
    });
    if (!recorded.ok) {
      setLocalError("Uploaded, but couldn't save it to the library.");
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text disabled:opacity-50"
      >
        <UploadIcon size={12} />
        {uploading ? "Uploading…" : "Upload file"}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          disabled={uploading}
          onChange={(event) => handleFile(event.target.files?.[0])}
          className="sr-only"
        />
      </label>
      {error || localError ? (
        <p role="alert" className="font-mono text-[10px] text-text-secondary">
          {error || localError}
        </p>
      ) : null}
    </div>
  );
}
