/**
 * Minimal, dependency-free device/browser/OS detection from a User-Agent
 * string, for the admin dashboard's Devices/Browsers/OS widgets (PRD
 * §3.2). Not a full UA-parsing library — just enough to bucket the
 * common cases; an unrecognized UA falls back to "Other"/"" rather than
 * guessing.
 * @param {string | null | undefined} userAgent
 * @returns {{ device: string, browser: string, os: string }}
 */
export function parseUserAgent(userAgent) {
  const ua = userAgent || "";

  let device = "Desktop";
  if (/ipad|tablet(?!.*mobile)/i.test(ua)) device = "Tablet";
  else if (/mobi|iphone|android.*mobile/i.test(ua)) device = "Mobile";

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\//i.test(ua) && !/edg\/|opr\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x|macintosh/i.test(ua) && !/iphone|ipad/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}
