# Security, privacy, and data-layer findings (areas C, D, E)

Scope: Security (C), Privacy/analytics (D), Data layer (E) audit of the portfolio app, tested live against the isolated `portfolio_audit` MongoDB database and a running production build at `localhost:3000`.

## Pass list (verified correct — real evidence, not code-reading alone)

- **Auth boundary on `/admin/*`**: no cookie / garbage cookie / signature-truncated cookie all → 307 redirect to `/admin/login`. Confirmed live via curl.
- **`requireAdmin()` coverage**: grepped all 8 `src/app/admin/(dashboard)/*/actions.js` files plus both `/api/admin/*` routes and `/api/imagekit-auth` — every mutation calls `requireAdmin({redirectOnFail:false})` before doing anything. None missing.
- **`requireAdmin()` fails closed on DB errors** (`requireAdmin.js:40-43`): a thrown error from `getDb()`/`findUserById()` falls through to "unauthenticated."
- **JWT algorithm pinned**: HS256 via `jose`; `jwtVerify` with a symmetric key rejects `alg:none`/mismatched-algorithm forgeries by construction.
- **`tokenVersion` invalidation**: `requireAdmin` compares live `user.tokenVersion` vs. the token's `ver` claim on every request; `changePassword`/email-change actions call `bumpTokenVersion`. Confirmed via code path; the live round-trip (change password, confirm old cookie now fails) was not separately driven through the UI in this pass — label that specific round-trip "Suspected, high confidence."
- **Cookie flags**: `Set-Cookie` from `/api/admin/login` = `Path=/; Secure; HttpOnly; SameSite=lax; Max-Age=1800`. Matches CLAUDE.md exactly.
- **Login lockout**: threshold 5, confirmed live — attempts 1-4 returned decrementing "N attempts left," attempt 5 and 6 returned 423 "Too many failed attempts." (Reset the account's `failedAttempts`/`lockedUntil` directly in the DB immediately afterward since this is a shared audit login other parallel work depends on.)
- **CSRF/Origin check**: `/api/admin/login` and `/api/admin/logout` reject missing/mismatched `Origin` with 403, confirmed live. Server Actions get Next's built-in same-origin check (not disabled in `next.config.mjs`).
- **No state-changing GETs**: `/api/imagekit-auth` is a GET but only issues a short-lived signed upload token.
- **Mongo operator injection blocked by Zod**: `{"name":{"$ne":null}}` and `{"email":{"$gt":""}}` to `/api/contact` both 400 "expected string, received object."
- **`/api/imagekit-auth` requires admin auth**: unauthenticated GET → 401.
- **Honeypot works correctly**: filling the real hidden field (`company`, not a field literally named `honeypot` — confirmed by reading `src/lib/schemas/message.js`) returns `{"ok":true}` but the message is NOT saved (DB-verified 0 documents).
- **Contact rate limiting**: same `X-Forwarded-For` value → requests 1-3 succeed, 4th returns 429. Atomic `findOneAndUpdate`-based counter is race-safe by construction.
- **Analytics never stores a raw IP**: live-inserted events via `/api/track`, read back from `portfolio_audit.events` directly — only `visitorHash` (sha256 hex) ever present.
- **Daily-rotating salt**: `hashVisitor()` called directly with two different date keys produces two different hashes (verified with `node`).
- **Bot/admin exclusion from analytics**: POST to `/api/track` with a Googlebot UA, and separately with the real admin session cookie, both return `{"ok":true}` but neither creates an `events` document (DB-verified, count 0 both times).
- **TTL indexes correct**: `events.createdAt_1` (`expireAfterSeconds: 63072000`, ~2yr retention); `rateLimits.expiresAt_1` (`expireAfterSeconds: 0`, expires at stored timestamp). Confirmed via live index listing.
- **Dashboard aggregation is numerically correct**: seeded 60 fixture events (20 each across 3 fake paths, 15 distinct visitor hashes) directly into `events`, loaded `/admin` authenticated — "Top pages" showed exactly 20/20/20 for the three fixture paths (byte-for-byte match), "Unique visitors" showed 17 = 15 fixture hashes + 2 real hashes from earlier manual tests, matching an independent `distinct()` query. Fixtures cleaned up afterward.
- **`projects.slug` uniqueness enforced at the MongoDB level**: inserting two documents with the same slug directly via the driver (bypassing Zod entirely) — second insert threw `E11000 duplicate key error`.
- **`scripts/seed.js` is idempotent**: re-run against the audit DB, "Seed complete," no error, collection counts unchanged (3/6/8).
- **`scripts/migrate-skill-icons.js` is idempotent**: run twice, both runs reported "0 migrated... 6 already had iconSlug," no errors or duplicate writes.
- **No secrets in the client bundle**: real `JWT_SECRET`/`IMAGEKIT_PRIVATE_KEY` values grepped against `.next/static` — not found. No `NEXT_PUBLIC_*` vars defined anywhere.
- **Markdown rendering is safe**: `markdown-it` configured with `html: false` (raw HTML escaped, not parsed). Only 3 `dangerouslySetInnerHTML` sites in the whole codebase: a build-time theme-flash script (not user input) and `MarkdownContent.jsx` (fed only by the safe renderer above). Admin messages inbox renders contact content as plain React children — no `dangerouslySetInnerHTML` there.

## Findings

### SEC-01 — Internal error details leaked to client on login DB failure
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `src/app/api/admin/login/route.js:46-51`
- **Evidence:** The route unconditionally returns `details: error?.message` in the JSON 503 response whenever `getDb()` throws. Already observed live earlier this session leaking `"querySrv ECONNREFUSED _mongodb._tcp.cluster0.pnkk9z5.mongodb.net"` to the browser. `/api/contact`'s equivalent catch block omits `details` — inconsistent.
- **Expected vs actual:** Error responses should never leak driver/internal error text to the client; login route does, contact route doesn't.
- **Impact:** Leaks internal infrastructure details (DB host, driver internals) to any unauthenticated caller during a transient outage.
- **Recommended fix:** Drop the `details` field, keep `console.error` server-side only. (effort: S)

### SEC-02 — No Content-Security-Policy header
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `next.config.mjs`
- **Evidence:** Ships 5 security headers but no CSP. `docs/DECISIONS.md:13` explicitly deferred this "until the external origins... are finalized" — they now are (ImageKit, Google Fonts, GitHub API all wired up), but the decision was never revisited.
- **Expected vs actual:** A CSP scoped to known external origins should exist now that they're finalized; none exists.
- **Impact:** Not independently exploitable today (no XSS vector found), but it's a real, confirmed gap in defense-in-depth.
- **Recommended fix:** Add a CSP scoped to the known external origins, `Report-Only` first if uncertain. (effort: M)

### SEC-03 — Rate-limit key trusts a client-spoofable X-Forwarded-For header
- **Severity:** P2
- **Confidence:** Confirmed as coded; production impact Not verified
- **Location:** `getClientIp()` in both `src/app/api/contact/route.js` and `src/app/api/track/route.js`
- **Evidence:** Takes `request.headers.get("x-forwarded-for")` directly, `.split(",")[0]` (the least-trustworthy, left-most hop). Live repro: 3 same-IP requests to `/api/contact` → 2x 200 + 1x 429 as expected; immediately after, 3 requests each with a *different* spoofed XFF value all returned 200, fully bypassing the 3/hour limit.
- **Expected vs actual:** Rate limiting should key off a trustworthy client identifier; it currently trusts an attacker-controlled header outright.
- **Impact:** Whether this is exploitable in the real deployment depends on whether a trusted proxy (e.g. Vercel's edge, which overwrites XFF with the real client IP) sits in front — this specific deployment detail could not be confirmed, marked **Not verified** — but the code itself unconditionally trusts an untrusted header with no validation.
- **Recommended fix:** Prefer platform-provided `request.ip` where available, or explicitly take the correct trusted hop. (effort: S–M)

### SEC-04 — Upload size/type limits enforced only client-side
- **Severity:** P2
- **Confidence:** Suspected/high-confidence — not verified against real ImageKit
- **Location:** `src/components/admin/Dropzone.jsx` (`maxSizeMB` check), `recordMediaUpload` action
- **Evidence:** `Dropzone.jsx`'s size/type check is client-only; `recordMediaUpload` (admin, already requires auth) records whatever the client reports post-upload with no server-side re-validation.
- **Expected vs actual:** Size/type limits should ideally be re-validated server-side; currently only enforced client-side.
- **Impact:** Low since this requires an authenticated admin session already, and real enforcement may already exist at the ImageKit account level — untestable without real credentials, correctly out of scope here.
- **Recommended fix:** Add server-side validation before/after upload if feasible; otherwise confirm ImageKit account-level enforcement in production. (effort: S, pending verification)

### PRIV-01 — ANALYTICS_SALT unset, silently reusing JWT_SECRET
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `.env.local` (`ANALYTICS_SALT=` empty), `src/lib/analytics/hash.js` fallback
- **Evidence:** `.env.local` has `ANALYTICS_SALT=` (empty); `hash.js` falls back to `JWT_SECRET` (64-char, so not weak in practice).
- **Expected vs actual:** Analytics salt should be an independent secret; it currently silently reuses the JWT secret.
- **Impact:** A future `JWT_SECRET` rotation also silently resets analytics continuity, and one secret's exposure affects two unrelated subsystems.
- **Recommended fix:** Set a real independent `ANALYTICS_SALT` value. (effort: S)

### DATA-01 — users collection has no index on email, including no unique constraint
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `scripts/ensure-indexes.js`, `users` collection
- **Evidence:** Live index listing shows only `{_id:1}`.
- **Expected vs actual:** `email` should have a unique index, mirroring the `projects.slug` pattern; it has none.
- **Impact:** Low risk today (single-admin, one insert path already keyed by `{email}`), but nothing at the DB level prevents a future duplicate.
- **Recommended fix:** Add a unique index in `scripts/ensure-indexes.js`. (effort: S)

## Summary
No finding in this pass represents an unauthenticated attacker gaining admin access or real user data being exposed. Top 3 actionable items: SEC-01 (trivial fix, stop leaking driver errors), SEC-02 (ship the CSP that was explicitly deferred and forgotten), SEC-03 (rate-limit key hardening, severity deployment-dependent).

Process note: the shared `audit@test.local` account was briefly locked testing lockout and immediately reset via a direct DB write — no disruption expected, but flagged in case another fork's login attempt overlapped that ~2-second window.

## Scores
- **C. Security: 7/10** — auth/CSRF/injection/XSS defenses solid and live-verified; remaining gaps are defense-in-depth (CSP, error leakage, spoofable rate-limit key), not a direct breach.
- **D. Privacy/analytics: 9/10** — every PRD promise independently reproduced with real data (no raw IP, salt rotation, bot/admin exclusion, correct TTL, correct aggregation). Only the salt-reuse hygiene issue counts against it.
- **E. Data layer: 9/10** — unique-index enforcement, connection reuse, and both scripts' idempotency all verified by direct action against the DB. Missing `users.email` index is the only gap, low-risk given current design.
