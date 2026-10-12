import ImageKit from "imagekit";
import { getEnv } from "../env.js";

let cachedClient;

/**
 * Builds (and caches) the ImageKit server SDK client. Reads credentials
 * lazily, at call time, never at module load, so importing this module
 * never throws when the ImageKit env vars are blank (same pattern as
 * `src/lib/mail/sendMail.js`'s `getTransporter()`). Returns `null` when
 * any required credential is missing, so callers can treat "not
 * configured" as a plain, expected case rather than an exception.
 * @returns {import('imagekit') | null}
 */
export function getImageKitClient() {
  if (cachedClient) return cachedClient;

  const env = getEnv();
  const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = env;
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    return null;
  }

  cachedClient = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
  return cachedClient;
}

/**
 * Signed parameters for a client-side upload (`/api/imagekit-auth`,
 * admin only). `null` when ImageKit isn't configured, so the route
 * handler can return a clear 503 instead of throwing.
 * @returns {{ token: string, expire: number, signature: string, publicKey: string, urlEndpoint: string } | null}
 */
export function generateUploadAuth() {
  const client = getImageKitClient();
  if (!client) return null;

  const { token, expire, signature } = client.getAuthenticationParameters();
  const env = getEnv();
  return { token, expire, signature, publicKey: env.IMAGEKIT_PUBLIC_KEY, urlEndpoint: env.IMAGEKIT_URL_ENDPOINT };
}

/**
 * Deletes a file from ImageKit by id. Never throws: a missing client,
 * an already-deleted file, or any API failure all resolve to
 * `{ ok: false }` so callers (replacing/removing an upload) can treat
 * cleanup as best-effort and never block the user-visible action on it.
 * @param {string} fileId
 * @returns {Promise<{ ok: boolean }>}
 */
export async function deleteImageKitFile(fileId) {
  if (!fileId) return { ok: false };

  const client = getImageKitClient();
  if (!client) return { ok: false };

  try {
    await client.deleteFile(fileId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
