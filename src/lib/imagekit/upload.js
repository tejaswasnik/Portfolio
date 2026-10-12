const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

/**
 * Uploads one file directly from the browser to ImageKit using a
 * signed token/expire/signature from `/api/imagekit-auth` (never the
 * private key, which stays server-side). Uses `XMLHttpRequest` instead
 * of `fetch` specifically for `upload.onprogress`, which `fetch` has no
 * equivalent for — needed for the real progress state CLAUDE.md/step 9
 * asks `Dropzone` to show.
 * @param {File} file
 * @param {{ token: string, expire: number, signature: string, publicKey: string }} auth
 * @param {{ folder?: string, onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, fileId: string, name: string, size: number }>}
 */
export function uploadToImageKit(file, auth, { folder, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("publicKey", auth.publicKey);
    formData.append("signature", auth.signature);
    formData.append("token", auth.token);
    formData.append("expire", String(auth.expire));
    formData.append("useUniqueFileName", "true");
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Upload failed: unexpected response."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: body.url, fileId: body.fileId, name: body.name, size: body.size });
      } else {
        reject(new Error(body.message || "Upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(formData);
  });
}
