"use client";

import { useState } from "react";
import { uploadToImageKit } from "./upload.js";

/**
 * Drives one file through `/api/imagekit-auth` → ImageKit, tracking the
 * progress/error states `Dropzone` and `BannerManager` both need
 * (CLAUDE.md step 9: "client-side upload, preview, progress and error
 * states"). Shared by every upload surface so there's exactly one place
 * that knows how to talk to ImageKit from the browser.
 * @param {{ folder?: string }} [options]
 */
export function useImageKitUpload({ folder } = {}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function upload(file) {
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const authRes = await fetch("/api/imagekit-auth");
      const auth = await authRes.json().catch(() => ({}));
      if (!authRes.ok) {
        throw new Error(auth.error || "Image uploads aren't configured yet.");
      }

      const result = await uploadToImageKit(file, auth, { folder, onProgress: setProgress });
      setUploading(false);
      return { ok: true, ...result };
    } catch (err) {
      setUploading(false);
      setError(err.message || "Upload failed. Please try again.");
      return { ok: false };
    }
  }

  return { upload, uploading, progress, error, setError };
}
