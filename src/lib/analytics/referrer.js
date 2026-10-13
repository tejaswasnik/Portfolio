const KNOWN_LABELS = {
  "google.com": "Google",
  "www.google.com": "Google",
  "bing.com": "Bing",
  "duckduckgo.com": "DuckDuckGo",
  "linkedin.com": "LinkedIn",
  "www.linkedin.com": "LinkedIn",
  "github.com": "GitHub",
  "twitter.com": "X",
  "x.com": "X",
  "t.co": "X",
};

/**
 * Turns a raw `Referer` header into a dashboard-friendly label (Figma
 * 53:2's "Top referrers" card: "Direct", "Google", "LinkedIn", …).
 * Empty, missing, or same-origin referrers are "Direct" traffic; a
 * recognized hostname gets its friendly name, anything else just shows
 * its bare hostname rather than guessing.
 * @param {string} referrer
 * @param {string} siteOrigin e.g. "https://tejaswasnik.me"
 * @returns {string}
 */
export function normalizeReferrer(referrer, siteOrigin) {
  if (!referrer) return "Direct";

  let url;
  try {
    url = new URL(referrer);
  } catch {
    return "Direct";
  }

  if (siteOrigin) {
    try {
      if (url.origin === new URL(siteOrigin).origin) return "Direct";
    } catch {
      // siteOrigin itself malformed — ignore, fall through
    }
  }

  const host = url.hostname.toLowerCase();
  return KNOWN_LABELS[host] || host;
}
