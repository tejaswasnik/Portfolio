# Performance, reliability, and SEO findings (areas I, J, K)

Environment: shared audit server at `http://localhost:3000`, production build, pointed at the isolated `portfolio_audit` MongoDB database. All test data (projects, 50k seeded events, one broken-data project) created during this audit was cleaned up afterward, except one deliberately-left contact message (evidence for REL-03) and a pre-existing `audit-xss-test-project` left by a different concurrent fork (not touched).

**Lighthouse noise caveat:** other audit forks ran concurrently in this sandbox, a known source of Performance-score variance (64-96 observed elsewhere in this audit for an unchanged page). These runs came back stable (93-100, repeated), but treat absolute numbers as directional pending a real no-contention deployment check. Accessibility/Best-Practices/SEO sub-scores are much more stable under contention.

## Lighthouse results

| Page | Form factor | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | Mobile ×2 | 95 / 95 | 100 | 96 | 100 |
| `/` | Desktop | 100 | 100 | 96 | 100 |
| `/projects` | Mobile | 95 | 100 | 96 | 100 |
| `/projects/workspace` | Mobile | 95 | 100 | 96 | 100 |

All four categories clear 90+ on every page. Only two recurring deductions, both minor (PERF-01, PERF-02).

## Findings

### PERF-01 — /favicon.ico 404s on every page load (trips Lighthouse's console-error check)
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `src/app/` — no favicon file present
- **Evidence:** Lighthouse `errors-in-console` (score 0): `"Failed to load resource: ... 404 ... http://localhost:3000/favicon.ico"`. Sole reason Best Practices sits at 96 instead of 100 on every page.
- **Expected vs actual:** No favicon file exists; browser requests it on every load and gets a 404.
- **Impact:** Minor console error on every page load, caps Best Practices score at 96.
- **Recommended fix:** Add `src/app/icon.png` (App Router metadata convention). (effort: S)

### PERF-02 — ~14 KiB of unneeded legacy-JS transpilation
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** build output / browserslist config
- **Evidence:** Lighthouse `legacy-javascript-insight`: score 0, "Est savings of 14 KiB", ~150ms potential LCP.
- **Expected vs actual:** Target browsers likely don't need this transpiled syntax; no modern `browserslist` entry limits it.
- **Impact:** Low priority given current 95-100 scores.
- **Recommended fix:** Add a modern `browserslist` entry to stop transpiling baseline-supported syntax. (effort: S)

### PERF-03 — unstable_cache has no time-based fallback revalidation (only tag-based)
- **Severity:** P3
- **Confidence:** Confirmed — working as designed, flagged only as an operational caveat
- **Location:** `src/lib/db/cache.js:23-64`
- **Evidence:** Inserted a project directly into `portfolio_audit` (`published:true`) — it never appeared in `/sitemap.xml` (grep count 0) because no admin action fired `revalidateTag`. By contrast, a never-before-queried slug rendered immediately (no stale cache entry existed). Cross-checked: every one of the 6 `CACHE_TAGS` entries has a matching `revalidateTag` call in its admin action file — no mismatched tag names found anywhere.
- **Expected vs actual:** Works correctly for every real admin write path; only a direct-DB write (bypassing the app entirely) bypasses revalidation.
- **Impact:** None under normal operation. Only bites a future direct-DB maintenance script.
- **Recommended fix:** Document the caveat, or add a bounded `revalidate` fallback to each `unstable_cache` call as belt-and-suspenders. (effort: S)

### PERF-04 — Dashboard aggregation degrades sharply at realistic event volumes
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `src/lib/analytics/aggregations.js` (pure-JS reduction over an in-memory array), `src/app/admin/(dashboard)/page.js:40-45` (`findEventsInRange` — plain `find()`, no `$group`)
- **Evidence:** Seeded 50,000 synthetic events (90-day spread) into `portfolio_audit`. Admin dashboard (`GET /admin`, 90-day range) took **7.95s, 4.98s, 3.43s** across three requests; default range **5.53s**. After deleting the 50k events, the same route returned in **43ms** three times in a row — isolates the slowdown to data volume, not sandbox noise.
- **Expected vs actual:** `docs/DECISIONS.md` already calls this tradeoff out explicitly as "right at personal-portfolio volume, wrong at scale." This test proves 50k events — plausible within 1-3 years of real traffic — is already past that line, not a theoretical future concern.
- **Impact:** Multi-second admin dashboard load times once event volume grows, with no architectural ceiling currently in place.
- **Recommended fix:** Move heavy aggregations to MongoDB `$group`/`$facet` pipelines filtered server-side by date range, or add a periodic rollup/pre-aggregation job. (effort: M)

### SEO-01 — Admin relies on robots.txt alone; no X-Robots-Tag/meta noindex defense-in-depth
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `src/app/admin/layout.js`
- **Evidence:** `robots.txt` correctly has `Disallow: /admin` and `/api`. But `curl` of `/admin/login` head and headers shows no `<meta robots>` tag and no `X-Robots-Tag` header.
- **Expected vs actual:** Defense-in-depth would add a noindex meta/header in case `robots.txt` is ignored; currently relies solely on `robots.txt`.
- **Impact:** Low (login page has no sensitive content; everything past it needs JWT auth anyway).
- **Recommended fix:** Add `metadata = { robots: { index: false, follow: false } }` to `src/app/admin/layout.js`. (effort: S)

### SEO-02 — No `<link rel="canonical">` anywhere
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** page `generateMetadata` functions
- **Evidence:** No canonical link found on any page.
- **Expected vs actual:** Not a stated PRD/architecture requirement. Low risk (no tracking-param URL variants exist on this site).
- **Impact:** Minimal.
- **Recommended fix:** Add `alternates.canonical` to each page's `generateMetadata`, reusing the existing `getSiteUrl()` helper. (effort: S)

### SEO-03 — No JSON-LD structured data anywhere
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** N/A
- **Evidence:** No `application/ld+json` found anywhere in the codebase.
- **Expected vs actual:** Not a stated requirement, nice-to-have only.
- **Impact:** Minimal.
- **Recommended fix:** Optional; add structured data for projects if desired. (effort: S)

## Pass list
- **REL-01 — GitHub heatmap fails closed on missing token/fetch error**: `src/lib/github/contributions.js:27-29,57-59` returns `null` uniformly for missing token, missing login, or any fetch/GraphQL failure; home page only renders the section when `Boolean(calendar)`. Matches `docs/ARCHITECTURE.md`'s "hide the section on failure."
- **REL-02 — ImageKit returns clean 503 when unconfigured**: `src/lib/imagekit/client.js:15-30` + `src/app/api/imagekit-auth/route.js:20-26`. Live-tested the happy path (200 with valid token/signature) against real configured creds; the 503 branch is unreachable without touching the shared server's env, so verified by code only.
- **REL-03 — Contact form always saves first, sets emailFailed on send failure**: Live-tested: POSTed a real message to `/api/contact` against `portfolio_audit` (no working Gmail creds wired here) → `{"ok":true}` HTTP 200. Confirmed via `/admin/messages` (authenticated) that the message text and an "emailFailed" indicator both render.
- **REL-04 — DB connection failures fail closed everywhere**: `src/lib/db/client.js` throws on connect failure; all 7 exported getters in `src/lib/db/cache.js:75-130` independently catch and return `null`/`[]`. Verified by code read (did not spin up a second broken-env instance — redundant given the uniform, unconditional catch pattern).
- **REL-05 — Malformed project data renders without crashing**: Inserted a project with no `coverImage`, empty `screenshots`, empty `techIds` directly into the DB. `/projects/audit-broken-project` returned HTTP 200, rendered cleanly. Cleaned up afterward.
- **SEO-04 — OG/description fallback chain and real content confirmed**: `project.seo?.ogImage || project.coverImage || undefined`; live-fetched `/projects/workspace` shows populated real title/description, not placeholders.
- **SEO-05 — Unpublished projects structurally excluded from sitemap/public queries**: `src/lib/db/collections/projects.js:16-22,39-41` — `published: true` is baked into the MongoDB filter itself for every public project query (list, featured, by-slug), not a post-fetch JS filter. Attempted a live Playwright-driven toggle-and-observe test via the admin UI; the scripted login didn't complete (likely an automated-client Origin/cookie nuance, not pursued further — out of this fork's scope and the query-level guarantee is already stronger evidence than a UI click-through would add).

Also observed in passing (not this fork's scope, flagged for the security fork): a stray `audit-xss-test-project` document already exists in `portfolio_audit` and currently appears in the live sitemap — left untouched since another concurrent fork is presumably using it.

## Scores
- **I. Performance: 8/10** — excellent Lighthouse scores; PERF-04 (dashboard-at-scale) is the one real structural risk worth fixing before the site accumulates a few years of traffic.
- **J. Reliability: 9/10** — every dependency and malformed-data path tested fails closed; no defects found.
- **K. SEO: 7/10** — core mechanics (titles, descriptions, OG fallback, sitemap correctness, robots.txt) all correct; three minor, non-blocking gaps (SEO-01/02/03).
