/**
 * Appends an ImageKit URL-based transformation
 * (https://docs.imagekit.io/features/image-transformations) to a stored
 * file url, so the browser downloads an appropriately-sized/-quality
 * file instead of the original upload. A no-op for anything that isn't
 * an `ik.imagekit.io` url (a legacy/non-ImageKit value, or already
 * transformed), so every caller degrades safely.
 * @param {string | undefined | null} url
 * @param {string} transformation e.g. `"w-220,q-80"`
 */
export function withImageKitTransform(url, transformation) {
  if (!url || !url.includes("ik.imagekit.io") || url.includes("tr=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=${transformation}`;
}
