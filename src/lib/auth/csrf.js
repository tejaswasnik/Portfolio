/**
 * Origin-header check for state-changing admin route handlers
 * (docs/ARCHITECTURE.md: "State-changing admin requests are also
 * protected against CSRF (SameSite cookie plus an Origin check)").
 * A same-site request always sends an Origin matching the request's own
 * host; a cross-site form/script cannot forge that header.
 * @param {Request} request
 * @returns {boolean}
 */
export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  // Same-origin requests from a browser always send Origin; its absence
  // (e.g. some non-browser clients) is treated as a mismatch, not an
  // exemption — CLAUDE.md wants every state-changing handler protected.
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
