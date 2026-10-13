/**
 * Best-effort client IP for rate-limiting and analytics hashing.
 *
 * `X-Forwarded-For`'s *first* entry is attacker-controlled — a client
 * can send any value there, so a trusted reverse proxy (Vercel,
 * Netlify, ...) appends the real connecting IP as the *last* hop
 * instead of overwriting earlier ones. `X-Real-IP` is set directly by
 * that proxy with no client-controlled passthrough, so prefer it when
 * present. Still spoofable if the app is reachable without a trusted
 * proxy in front (deployment-dependent — see SEC-03 in the audit).
 */
export function getClientIp(request) {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const hops = forwarded.split(",").map((hop) => hop.trim()).filter(Boolean);
  return hops.at(-1) || "unknown";
}
