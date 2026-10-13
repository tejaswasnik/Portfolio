/**
 * Reads a File's natural pixel dimensions client-side, via a throwaway
 * `<img>` + object URL. Shared by every admin upload surface that needs
 * the source size before saving (banner aspect-ratio warning, interest
 * images' default-size-from-aspect-ratio).
 * @param {File} file
 * @returns {Promise<{ width: number, height: number } | null>}
 */
export function readImageDimensions(file) {
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
