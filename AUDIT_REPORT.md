# Portfolio Audit Report

Independent audit of the Tejas Wasnik portfolio project (Next.js App Router, plain JS, MongoDB, JWT auth). Read-only review; no fixes applied in this run.

## 1. Summary

**Verdict: Ship-ready for a personal portfolio, with a short list of real fixes worth doing before or shortly after launch.** No P0 (critical/blocking) or P1 (severe) findings were found anywhere in the application. Every security boundary tested (auth, CSRF, injection, XSS, rate limiting, uploads) held up under live, hands-on testing against an isolated database — nothing here represents an unauthenticated attacker gaining admin access or real user data being exposed. The issues that do exist are concrete, specific, and mostly small: a handful of defense-in-depth security gaps (P2), a couple of confirmed responsive-layout bugs on four admin pages, one accessibility defect on the most-visited page, two places where project docs have drifted behind code changes in a way that risks a future regression, and one real scalability ceiling in the analytics dashboard.

### Severity counts
| Severity | Count |
|---|---|
| P0 (critical) | 0 |
| P1 (severe) | 0 |
| P2 (moderate) | 10 |
| P3 (minor) | 14 |

(Four additional "DESIGN-01..04" observations in the design-fidelity section are not counted as findings — they are seed-data artifacts or already-documented, no-fix-needed scope gaps, included for completeness only.)

### Top 10 issues (all P2, ordered by impact)

1. **PERF-04** — Admin dashboard aggregation takes 4-8 seconds at 50,000 events (43ms at low volume); no architectural ceiling exists today. (`src/lib/analytics/aggregations.js`)
2. **SEC-02** — No Content-Security-Policy header; a defense-in-depth gap that was explicitly deferred during development and never revisited. (`next.config.mjs`)
3. **SEC-01** — Login route leaks raw internal error text (e.g. a DB connection error string) to unauthenticated callers on a transient failure. (`src/app/api/admin/login/route.js:46-51`)
4. **SEC-03** — Contact-form and analytics rate limiting key off a client-spoofable `X-Forwarded-For` header with no validation; confirmed bypassable in this sandbox, production impact depends on the real deployment's trusted-proxy setup (Not verified). (`src/app/api/contact/route.js`, `src/app/api/track/route.js`)
5. **UX-02** — No unsaved-changes warning on any admin form; a 647-line `ProjectForm` can lose all in-progress edits to an accidental navigation click. (`src/components/admin/ProjectForm.jsx`)
6. **A11Y-01** — The Home page has no `<h1>`; the visually-heading-styled name is a `<p>`, confirmed as the one page on the whole site missing this. (`src/components/public/ProfileIdentity.jsx:42`)
7. **DOCS-02** — `docs/design.md` §20 still documents skill icons as "monochrome by default," directly contradicting the current, user-requested colored-by-default behavior — risks a future session reverting the user's explicit feedback by trusting a stale doc. (`docs/design.md:515-519`)
8. **DOCS-01** — `docs/ARCHITECTURE.md`'s data model table documents an obsolete single `icon` field for skills; the real schema has `iconLibrary`/`iconSlug`/`iconUrl`. (`docs/ARCHITECTURE.md:40`)
9. **RESP-01** — The Skills admin page's filter pills force horizontal page scroll below 768px; a missing `flex-wrap`/`overflow-x-auto` on one shared component. (`src/components/admin/SegmentedFilter.jsx:17`)
10. **RESP-03** — The Banner (and likely Media) admin panel uses a hard-coded `w-[344px]` with no responsive fallback, unlike sibling panels that correctly collapse to full width; causes horizontal scroll below ~390px. (`src/components/admin/BannerManager.jsx:318`)

(SEC-04, upload validation enforced only client-side, is an 11th P2 — omitted from the top 10 only because its real-world impact already requires an authenticated admin session and may already be covered at the ImageKit account level in production, a detail this audit could not verify.)

### Scorecard (A–O, 0–10)

| Area | Score |
|---|---|
| A. Spec coverage | 7 |
| B. Functional E2E | 8 |
| C. Security | 7 |
| D. Privacy/analytics | 9 |
| E. Data layer | 9 |
| F. Design fidelity | 8 |
| G. Responsive | 7 |
| H. Accessibility | 6 |
| I. Performance | 8 |
| J. Reliability | 9 |
| K. SEO | 7 |
| L. Code quality | 8 |
| M. Tests | 9 |
| N. Docs/deployment | 7 |
| O. Product/UX | 7 |

## 2. Environment

- **Commit:** `a795c7e6` (branch `fixes-round-2`)
- **Node:** v22.23.1, **npm:** 10.9.8, **OS:** Windows 10.19045
- **Real vs mocked services:**
  - **MongoDB:** Real — tested against an isolated, disposable sibling database (`portfolio_audit`) on the same Atlas cluster as production, never touching real production data. Every live functional/security/data-layer test in this report ran against real MongoDB, not a mock.
  - **GitHub API:** Not independently exercised with real credentials in this pass; the Home page's Activity/heatmap section didn't render during testing, consistent with the documented "hide on missing token/fetch failure" fallback (confirmed in code), but the real contribution-fetching path itself is **Not verified**.
  - **ImageKit:** Partially verified — the auth-token-signing happy path was tested against real configured credentials (200 with a valid signature); actual file upload/delivery through the real ImageKit service, and its real-world file-type/size enforcement, is **Not verified**.
  - **Gmail/Nodemailer OAuth2:** Not verified — no working Gmail OAuth2 credentials were used. The "email fails, message still saves with `emailFailed: true`" path was verified live against the contact form; actual email delivery and the email-header-injection risk were assessed by code trace only, not a real send.
- **Items marked "Not verified" throughout this report:** real GitHub API behavior, real ImageKit upload enforcement, real Gmail send/OAuth2 flow, production trusted-proxy behavior for `X-Forwarded-For` (SEC-03), and a handful of admin screens not reached by the functional-E2E pass within its time box (banner, profile/resume, messages sub-actions, JSON export, media library, screenshot lightbox — see the PRD coverage table in §4).

## 3. Baseline results

| Check | Result |
|---|---|
| `npm ci` | PASS, exit 0, 428 packages |
| `npm run lint` | PASS, exit 0, zero warnings/errors |
| `npm test` | PASS, 51 files / 338 tests, exit 0 |
| `npm run build` | PASS, exit 0 (Turbopack doesn't print a First Load JS table; ~1.1MB total chunks approximated manually, largest single chunk 224.4KB) |
| `npm audit --omit=dev` | 2 moderate (via `imagekit`'s own `uuid` dependency, <11.1.1) |
| `npm audit` (all) | 7 total — the other 5 are high-severity but dev-only tooling (`eslint-config-next`'s transitive `braces`/`micromatch`/`fast-glob`), not shipped |
| `npm outdated` | `eslint` 9.39.5 → 10.12.0 (major, not applied); `vitest`/`zod` patch-level only |
| TODO/FIXME/console.log/debugger | None found in `src`/`scripts` |
| Hard-coded hex outside `icons.jsx`/tests/`globals.css` | None found |
| `eslint-disable` count | 21, all with an inline justification |
| Secrets in git history | None found |
| Dev server hydration warnings | None observed |

Full detail: `audit/00-baseline-summary.md` and its referenced logs.

## 4. PRD coverage table

| Requirement | Status | Evidence |
|---|---|---|
| Navbar `TW.`/Home/Projects/theme toggle, no Notes | Done | Confirmed in rendered HTML of `/`, `/projects`, `/projects/[slug]` |
| Side index + scroll-spy | Done | 4 anchor links found; active-state link appears after scroll |
| SEO: sitemap/robots/per-project meta | Done | `/sitemap.xml`, `/robots.txt` well-formed; project OG/title/description tags confirmed |
| Home sections (Profile/About/Contact/Heatmap/Projects/Stack/Let's talk/Footer) | Done | All render on `/` (heatmap section correctly hidden per its own fallback — see REL-01) |
| `/projects` filters | Done | Garbage tag/status params don't crash |
| `/projects/[slug]` markdown + prev/next + SEO | Done | XSS-safe markdown rendering confirmed live (FUNC-PUB-03) |
| Contact form (honeypot + rate limit + save-first) | Done | All three mechanisms confirmed live |
| Auth (login, lockout, change password/email) | Done | Generic error on failure, lockout at 5 attempts, tokenVersion session invalidation all confirmed live |
| Skills CRUD incl. multi-library icon picker | Done | Simple Icons/Lucide/Remix Icon all verified live, real icons persisted (not letter-tile fallbacks) |
| Projects CRUD incl. unique slug | Done | Duplicate slug rejected client-side and enforced at the MongoDB level |
| Maintenance mode (Phase 2) | Done | Toggled both directions live; public shows maintenance page while `/admin` stays reachable |
| Drag-to-reorder projects (Phase 2) | Done | Drag handle + `MoveButtons` keyboard alternative both present |
| Media library (Phase 2) | Not verified | Not reached within this audit's time box |
| Click-tracking / analytics dashboard (Phase 2) | Done | Verified at both small and 50k-event scale (see PRIV section and PERF-04) |
| Data export (Phase 2) | Not verified | Not reached within this audit's time box |
| Banner upload/replace/remove | Not verified | Not reached within this audit's time box |
| Profile/resume editor | Not verified | Not reached within this audit's time box |
| Messages sub-actions (read/unread/archive/delete/reply) | Not verified | Not reached within this audit's time box |
| Section visibility toggle | Not verified (structurally identical maintenance toggle was verified) | Not reached directly within this audit's time box |

## 5. Findings by area

### C. Security

**SEC-01 — Internal error details leaked to client on login DB failure**
- Severity: P2 · Confidence: Confirmed
- Location: `src/app/api/admin/login/route.js:46-51`
- Evidence: Unconditionally returns `details: error?.message` in the 503 JSON response whenever `getDb()` throws; live-observed leaking `"querySrv ECONNREFUSED ..."` during this session. `/api/contact`'s equivalent catch block correctly omits `details` — inconsistent.
- Expected vs actual: Error responses should never leak driver/internal error text; login route does, contact route doesn't.
- Impact: Leaks internal infrastructure details to any unauthenticated caller during a transient outage.
- Fix: Drop the `details` field, keep `console.error` server-side only. (effort: S)

**SEC-02 — No Content-Security-Policy header**
- Severity: P2 · Confidence: Confirmed
- Location: `next.config.mjs`
- Evidence: 5 security headers are set; no CSP. `docs/DECISIONS.md:13` explicitly deferred this "until the external origins... are finalized" — they now are (ImageKit, Google Fonts, GitHub API all wired up) but the decision was never revisited.
- Expected vs actual: A CSP scoped to the known external origins should exist now; none does.
- Impact: Not independently exploitable today (no XSS vector found), but a real, confirmed defense-in-depth gap.
- Fix: Add a CSP scoped to the known external origins, `Report-Only` first if uncertain. (effort: M)

**SEC-03 — Rate-limit key trusts a client-spoofable X-Forwarded-For header**
- Severity: P2 · Confidence: Confirmed as coded; production impact Not verified
- Location: `getClientIp()` in `src/app/api/contact/route.js` and `src/app/api/track/route.js`
- Evidence: Takes the left-most, least-trustworthy hop of `x-forwarded-for` directly. Live repro: 3 same-spoofed-IP requests to `/api/contact` hit the 429 limit as expected; 3 requests with 3 different spoofed XFF values immediately after all returned 200, bypassing the 3/hour limit entirely.
- Expected vs actual: Rate limiting should key off a trustworthy client identifier; it currently trusts an attacker-controlled header outright.
- Impact: Whether this is exploitable in the real deployment depends on whether a trusted proxy (e.g. Vercel's edge) overwrites XFF in front of the app — **this specific deployment detail could not be confirmed, marked Not verified** — but the code itself has no validation against a spoofed header.
- Fix: Prefer platform-provided `request.ip` where available, or explicitly take the correct trusted hop. (effort: S–M)

**SEC-04 — Upload size/type limits enforced only client-side**
- Severity: P2 · Confidence: Suspected/high-confidence — not verified against real ImageKit
- Location: `src/components/admin/Dropzone.jsx` (`maxSizeMB`), `recordMediaUpload` action
- Evidence: Client-only size/type check; `recordMediaUpload` (already requires admin auth) records whatever the client reports with no server-side re-validation.
- Impact: Low — requires an authenticated admin session already; real enforcement may already exist at the ImageKit account level, untestable without real credentials.
- Fix: Add server-side re-validation if feasible; otherwise confirm ImageKit account-level enforcement in production. (effort: S, pending verification)

### D. Privacy and analytics

**PRIV-01 — ANALYTICS_SALT unset, silently reusing JWT_SECRET**
- Severity: P3 · Confidence: Confirmed
- Location: `.env.local` (`ANALYTICS_SALT=` empty), `src/lib/analytics/hash.js`
- Evidence: Falls back to `JWT_SECRET` (64-char, not weak in practice) when unset.
- Impact: A future `JWT_SECRET` rotation also silently resets analytics continuity; one secret's exposure affects two unrelated subsystems.
- Fix: Set a real independent `ANALYTICS_SALT` value. (effort: S)

Everything else in this area — no cookies/raw IPs ever stored, daily salt rotation producing distinct hashes, bot/admin exclusion, correct TTL indexes, and numerically correct dashboard aggregation (verified against 60 hand-seeded fixture events) — passed live testing. See `audit/findings-security-privacy-data.md` for full evidence.

### E. Data layer

**DATA-01 — users collection has no index on email, including no unique constraint**
- Severity: P3 · Confidence: Confirmed
- Location: `scripts/ensure-indexes.js`, `users` collection
- Evidence: Live index listing shows only `{_id:1}`.
- Impact: Low risk today (single-admin, one insert path), but nothing at the DB level prevents a future duplicate.
- Fix: Add a unique index, mirroring the `projects.slug` pattern. (effort: S)

`projects.slug` uniqueness, connection reuse, and both `scripts/seed.js`/`scripts/migrate-skill-icons.js`'s idempotency were all independently verified live. See `audit/findings-security-privacy-data.md`.

### F. Design fidelity

No code defects found. Three observations (DESIGN-01/02/03) are seed-data artifacts (empty GitHub token/social links/cover images in the disposable test database, not reproducible against real content) and one (DESIGN-04) is an already-documented, pre-existing scope gap (`docs/design.md` §19's own "known gaps" list for admin empty/loading/error states and admin light theme). Fonts, colors, and structure all matched Figma where diffed. Full detail: `audit/findings-design-responsive-a11y.md`.

### G. Responsive

**RESP-01 — Admin segmented filter overflows viewport below 768px (Skills page)**
- Severity: P2 · Confidence: Confirmed
- Location: `src/components/admin/SegmentedFilter.jsx:17`
- Evidence: `scrollWidth` 418 vs `innerWidth` 320/375 on `/admin/skills`; the filter pill row's own children never wrap even though its parent does.
- Fix: Add `overflow-x-auto` to the component's root div, or let pills wrap with smaller gap/padding. (effort: S)

**RESP-02 — /admin/sections filter overflows at 320px only**
- Severity: P3 · Confidence: Confirmed
- Location: Same component family as RESP-01
- Evidence: `scrollWidth` 370 vs `innerWidth` 320 at 320px only.
- Fix: Same as RESP-01. (effort: S)

**RESP-03 — Banner (and likely Media) admin panel uses hard-coded w-[344px] with no responsive fallback**
- Severity: P2 · Confidence: Confirmed for Banner; Suspected for Media
- Location: `src/components/admin/BannerManager.jsx:318`
- Evidence: `scrollWidth` 382 vs `innerWidth` 320/375, unlike sibling panels (`SkillsManager.jsx:400`, `SectionsManager.jsx:194`) which correctly use `w-full ... lg:w-[344px]`.
- Fix: Change to `w-full flex-col ... lg:w-[344px]`; check Media's equivalent panel for the same fix. (effort: S)

The entire public site (6 widths × every page) was clean with zero horizontal-scroll failures. 11 of 14 scanned admin pages were also clean. Full matrix: `audit/findings-design-responsive-a11y.md`.

### H. Accessibility

**A11Y-01 — Home page has no `<h1>`**
- Severity: P2 · Confidence: Confirmed
- Location: `src/components/public/ProfileIdentity.jsx:42`
- Evidence: The visually-heading-styled name is a `<p>`; grep for heading tags on live Home HTML returns zero matches, while every other page (Projects, project details, admin login) has exactly one `<h1>`.
- Impact: Screen-reader users navigating by heading level never hit a page title on the most-visited page.
- Fix: Change the `<p>` to `<h1>`, keeping existing classes. (effort: S)

**A11Y-02 — 14 components use raw `<button>` without the design system's focus-visible ring**
- Severity: P3 · Confidence: Confirmed (static); visual outcome Suspected
- Location: `BannerManager.jsx`, `DateRangeSelector.jsx`, `Dropzone.jsx`, `MediaCardActions.jsx`, `MediaPickerDialog.jsx`, `MessageDetail.jsx`, `MessagesTable.jsx`, `MoveButtons.jsx`, `ProjectsTable.jsx`, `Topbar.jsx`, `LetsTalkTrigger.jsx`, `MessageMeTrigger.jsx`, `NotFoundView.jsx`, `ProjectCard.jsx`
- Evidence: None of these apply `Button.jsx`'s `focus-visible:outline-*` classes; keyboard operability is intact (browser default ring likely still shows), just visually inconsistent.
- Fix: Add the shared focus-visible classes to each, prioritizing `MoveButtons.jsx` (keyboard-critical reorder control). (effort: M)

`--text-muted` contrast passes AA in both themes against every surface (computed from real token values). `prefers-reduced-motion` correctly implemented for the global case and the banner GIF. No missing alt text found on sampled pages. **Not verified in this pass:** axe-core/Lighthouse accessibility automation, and interactive keyboard walkthroughs of the contact modal, lightbox, and icon-picker dialog's focus-trapping.

### I. Performance

**PERF-04 — Dashboard aggregation degrades sharply at realistic event volumes**
- Severity: P2 · Confidence: Confirmed
- Location: `src/lib/analytics/aggregations.js` (pure-JS reduction over an in-memory array), `src/app/admin/(dashboard)/page.js:40-45`
- Evidence: Seeded 50,000 synthetic events (90-day spread); dashboard load went from 43ms (0 events) to 3.4–8.0s (50k events), isolated specifically to data volume by re-measuring after deletion.
- Expected vs actual: `docs/DECISIONS.md` already calls this "right at personal-portfolio volume, wrong at scale" — this test proves 50k events (plausible within 1-3 years of real traffic) is already past that line.
- Fix: Move aggregations to MongoDB `$group`/`$facet` pipelines filtered server-side by date range, or add a periodic rollup job. (effort: M)

**PERF-01 — /favicon.ico 404s on every page load**
- Severity: P3 · Confidence: Confirmed
- Evidence: Caps Lighthouse Best Practices at 96/100 on every page via a console error.
- Fix: Add `src/app/icon.png`. (effort: S)

**PERF-02 — ~14 KiB of unneeded legacy-JS transpilation**
- Severity: P3 · Confidence: Confirmed
- Evidence: Lighthouse `legacy-javascript-insight`, ~150ms potential LCP savings.
- Fix: Add a modern `browserslist` entry. (effort: S)

**PERF-03 — unstable_cache has no time-based fallback revalidation**
- Severity: P3 · Confidence: Confirmed, working as designed
- Evidence: A project inserted directly into the DB (bypassing the app entirely) never appeared in `/sitemap.xml` until a real admin write fired `revalidateTag`. No mismatched tag names found anywhere real write paths are used.
- Impact: None under normal operation; only affects a hypothetical future direct-DB maintenance script.
- Fix: Document the caveat, or add a bounded `revalidate` fallback as belt-and-suspenders. (effort: S)

Lighthouse scores (noisy sandbox caveat applies — see §8): 95-100 Performance, 100 Accessibility, 96 Best Practices, 100 SEO across `/`, `/projects`, and a project detail page, mobile and desktop.

### J. Reliability

All five fallback paths tested — GitHub heatmap, ImageKit auth, email-send failure (`emailFailed`), DB connection failure, and malformed project data — failed closed correctly with no crashes. No findings. See `audit/findings-performance-reliability-seo.md`.

### K. SEO

**SEO-01 — Admin relies on robots.txt alone; no X-Robots-Tag/meta noindex defense-in-depth**
- Severity: P3 · Confidence: Confirmed
- Fix: Add `metadata = { robots: { index: false, follow: false } }` to `src/app/admin/layout.js`. (effort: S)

**SEO-02 — No `<link rel="canonical">` anywhere**
- Severity: P3 · Confidence: Confirmed, not a stated requirement
- Fix: Add `alternates.canonical` to each page's `generateMetadata`. (effort: S)

**SEO-03 — No JSON-LD structured data anywhere**
- Severity: P3 · Confidence: Confirmed, not a stated requirement, nice-to-have only
- Fix: Optional. (effort: S)

Titles, descriptions, OG image fallback chain, sitemap correctness (published-only, enforced at the query level), and robots.txt disallow rules all confirmed correct.

### L. Code quality

**QUAL-01 — Four failure branches break the project's own `{ok,error}` convention**
- Severity: P3 · Confidence: Confirmed
- Location: `src/app/admin/(dashboard)/media/actions.js:28,31,41`, `src/app/admin/(dashboard)/skills/actions.js:80`
- Fix: Add an `error` string to each. (effort: S)

**QUAL-02 — ARCHITECTURE.md folder-structure diagram not updated for fixes-round-2 additions**
- Severity: P3 · Confidence: Confirmed
- Location: `docs/ARCHITECTURE.md:19-27` (missing `src/lib/icons/`, `src/lib/hooks/`)
- Fix: Add the two missing lines. (effort: S)

No unused dependencies, no unhandled throws in the actions layer, consistent `requireAdmin()` call shape across all 8 admin action files.

### M. Tests

No findings — 338 tests across 51 files, strong coverage of security-sensitive logic (lockout, tokenVersion invalidation, rate-limiter TTL via fixtures, analytics hash rotation, all three icon-library lookups). Highest-value gaps identified (not defects, just coverage opportunities): `iconSlugSchema` rejection cases, `deleteMedia`'s "in use" branch, authenticated-admin-page responsive tests (currently zero — `e2e/responsive.spec.js` only covers public pages), invalid-library-enum server-side rejection for `searchSkillIcons`.

### N. Docs and deployment

**DOCS-01 — ARCHITECTURE.md's skills field documentation is stale**
- Severity: P2 · Confidence: Confirmed
- Location: `docs/ARCHITECTURE.md:40` vs `src/lib/schemas/skill.js:14-22`
- Evidence: Documents a single `icon` field; actual schema has `iconLibrary`/`iconSlug`/`iconUrl`.
- Fix: Update the row. (effort: S)

**DOCS-02 — design.md §20 still says skill icons are monochrome by default, contradicting actual, user-requested behavior**
- Severity: P2 · Confidence: Confirmed
- Location: `docs/design.md:515-519` vs `src/components/ui/SkillIcon.jsx:10-15`
- Evidence: `SkillIcon.jsx`'s own JSDoc explicitly notes it overrides design.md §20's original call, per direct user feedback earlier in this project.
- Impact: Per CLAUDE.md, "where Figma and design.md disagree, Figma wins" — but nothing flags that design.md itself is stale here; a future redesign pass trusting design.md could silently revert the user's explicit request.
- Fix: Correct §20's text. (effort: S)

**DOCS-03 — README command table omits two fixes-round-2 npm scripts**
- Severity: P3 · Confidence: Confirmed
- Evidence: `migrate:skill-icons` and `generate:remixicon-index` exist in `package.json` but aren't documented.
- Fix: Add both to the README command table. (effort: S)

README setup/deployment steps were otherwise confirmed accurate and specific (`.env.example` matches `envSchema` exactly; `seed:admin`/production build both independently verified live during this audit's setup).

### O. Product and UX gaps

**UX-02 — No unsaved-changes warning on any admin form**
- Severity: P2 · Confidence: Confirmed
- Location: `src/components/admin/ProjectForm.jsx` (647 lines) and other admin forms
- Evidence: Zero `beforeunload` listeners found anywhere in the codebase.
- Impact: Real day-to-day risk — an accidental sidebar click or tab close silently loses all in-progress input on the single admin's longest form.
- Fix: Add a shared `useUnsavedChangesWarning(isDirty)` hook. (effort: M)

**UX-01 — Toast "undo" affordance exists in the component but is never wired up anywhere**
- Severity: P3 · Confidence: Confirmed
- Location: `src/components/admin/Toaster.jsx:118-128`
- Evidence: `actionLabel`/`onAction` props exist and work, but no delete flow actually passes them; not a safety gap since every delete already has a confirmation dialog.
- Fix: Wire it up to at least the project/skill/media delete flows, or correct `docs/DECISIONS.md`'s description. (effort: S-M)

All delete actions confirmed to use a confirmation dialog; zero dead/broken links found.

## 6. Design-fidelity table

See §5 "F. Design fidelity" and the full page × width × theme comparison table in `audit/findings-design-responsive-a11y.md`. Summary: Home (1440 dark) pixel-diffed directly against Figma frame `5:5314` and matched structurally; all other routes reviewed via code-vs-Figma-node comparison, not pixel diffing (time-boxed). Zero code-level design defects found; all observed differences traced to disposable-database seed-data gaps (empty social links, no cover images, no GitHub token in this sandbox) or pre-existing, already-documented scope gaps.

## 7. Responsive and accessibility matrices

**Responsive** (scrollWidth check at 320/375/768/1024/1280/1440, every page, not sampled): public site 100% clean across all 6 widths; 11/14 scanned admin pages clean; 4 confirmed failures (RESP-01, RESP-02, RESP-03 ×2 pages) all isolated to two root-cause components (`SegmentedFilter.jsx`, `BannerManager.jsx`'s fixed-width panel). Full matrix in `audit/findings-design-responsive-a11y.md`.

**Accessibility**: heading hierarchy correct on every page except Home (A11Y-01); contrast passes AA in both themes everywhere tested; `prefers-reduced-motion` correctly implemented; alt text complete on sampled pages; one consistency gap on focus rings (A11Y-02). No axe-core/Lighthouse automated accessibility run and no interactive keyboard/focus-trap walkthrough were completed in this pass — marked **Not verified** rather than assumed passing.

## 8. Performance table

| Page | Form factor | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|---|
| `/` | Mobile ×2 | 95 / 95 | 100 | 96 | 100 |
| `/` | Desktop | 100 | 100 | 96 | 100 |
| `/projects` | Mobile | 95 | 100 | 96 | 100 |
| `/projects/workspace` | Mobile | 95 | 100 | 96 | 100 |

All four categories clear the 90+ target on every page tested. **Caveat:** this sandbox showed Lighthouse Performance-score variance of 64-96 for an unchanged page under concurrent-process contention during this audit; these specific runs came back stable and repeated, but the absolute numbers should be re-verified on a real deployment with no contention. Accessibility/Best Practices/SEO sub-scores are far more stable under contention and can be trusted with higher confidence.

## 9. Things done well

- Every security boundary tested — auth, CSRF/Origin checks, MongoDB operator injection, XSS via markdown, honeypot, login lockout, rate limiting, JWT algorithm pinning and tokenVersion invalidation — held up under live, hands-on attack-style testing, not just code review.
- Privacy/analytics implementation is excellent: zero raw IPs or cookies ever stored (verified by direct DB inspection), daily-rotating salt independently proven to produce different hashes, bot/admin exclusion verified live, and the dashboard's aggregation math independently verified correct against hand-seeded fixture data.
- Data layer fundamentals are solid: unique-index enforcement at the MongoDB level (not just app-level Zod), connection reuse, and both migration/seed scripts proven idempotent by actually running them twice.
- Graceful degradation is comprehensive and consistently applied: GitHub heatmap, ImageKit, email sending, and DB connection failures all fail closed with no crashes, and malformed/incomplete project data renders without errors.
- Test suite (338 tests, 51 files) has real depth on security-sensitive logic specifically — lockout, token invalidation, rate-limiter TTL, analytics hash rotation — not just happy-path coverage.
- The multi-library skill-icon picker (Simple Icons/Lucide/Remix Icon) works end-to-end with real icons persisting correctly, a meaningfully complex feature built and verified correctly in this session.
- Visibility rules (draft/published/featured) and slug uniqueness are enforced exactly as the PRD specifies, confirmed with live edge-case testing, not just reading the code.
- Lighthouse scores clear the 90+ target across all four categories on every page tested.

## 10. Fix plan

Ordered batches, P0/P1 first (none exist), then P2, grouped for efficient single-session fixes. Each is a ready-to-paste prompt for an implementing agent.

### Batch 1 — Security hardening (P2, SEC-01/02/03/04)
```
Fix four security findings from AUDIT_REPORT.md:
1. SEC-01: in src/app/api/admin/login/route.js (around lines 46-51), remove the
   `details: error?.message` field from the 503 error response; keep the
   console.error server-side logging, but never forward driver/internal error
   text to the client.
2. SEC-02: add a Content-Security-Policy header in next.config.mjs, scoped to
   the app's known external origins (ImageKit, Google Fonts, the GitHub API).
   Start with Content-Security-Policy-Report-Only if you're unsure of the
   exact origin list, then confirm no real functionality breaks before
   switching to the enforcing header.
3. SEC-03: in getClientIp() (src/app/api/contact/route.js and
   src/app/api/track/route.js), stop trusting the raw x-forwarded-for header
   outright. Prefer a platform-provided client IP where available (e.g.
   request.ip on the deployment platform), or explicitly document and take
   only the correct trusted hop for this app's actual deployment topology.
4. SEC-04: add server-side re-validation of file size/type in the media
   upload action (recordMediaUpload and wherever Dropzone.jsx's upload
   flow calls it), not just the client-side check already in Dropzone.jsx.
Add or update tests for each change. Run npm test and npm run lint after.
```

### Batch 2 — Admin responsive layout fixes (P2, RESP-01/02/03)
```
Fix three responsive-layout bugs from AUDIT_REPORT.md, all on admin pages:
1. RESP-01/RESP-02: in src/components/admin/SegmentedFilter.jsx (line 17),
   the filter pill row's own children never wrap, causing horizontal page
   scroll on /admin/skills below 768px and on /admin/sections at 320px.
   Add overflow-x-auto to the component's root div (with appropriate
   padding/scroll-snap), or let the pills flex-wrap with a smaller gap.
2. RESP-03: in src/components/admin/BannerManager.jsx (line 318), the panel
   uses a hard-coded w-[344px] with no responsive fallback, unlike the
   sibling panels in SkillsManager.jsx:400 and SectionsManager.jsx:194 which
   correctly use `w-full ... lg:w-[344px]`. Apply the same pattern here, and
   check whether the Media admin panel has the same hard-coded-width bug
   (it showed identical overflow numbers in testing but wasn't independently
   traced to a line number) and fix it too if so.
Verify with the existing e2e/responsive.spec.js pattern (or a manual
scrollWidth check at 320/375/768px) that all four pages are now clean.
```

### Batch 3 — Accessibility fix (P2, A11Y-01) plus consistency pass (P3, A11Y-02)
```
Fix from AUDIT_REPORT.md:
1. A11Y-01: in src/components/public/ProfileIdentity.jsx (line 42), change
   the <p className="font-serif text-[38px] ..."> element rendering the
   profile name on the Home page to an <h1>, keeping its existing classes.
   Confirm this doesn't break any other heading-level assumption on the page.
2. A11Y-02: add the design system's focus-visible classes (the same string
   used in src/components/ui/Button.jsx: `focus-visible:outline
   focus-visible:outline-2 focus-visible:outline-offset-2
   focus-visible:outline-accent`) to the raw <button> elements in these 14
   files that currently lack them: BannerManager.jsx, DateRangeSelector.jsx,
   Dropzone.jsx, MediaCardActions.jsx, MediaPickerDialog.jsx,
   MessageDetail.jsx, MessagesTable.jsx, MoveButtons.jsx, ProjectsTable.jsx,
   Topbar.jsx, LetsTalkTrigger.jsx, MessageMeTrigger.jsx, NotFoundView.jsx,
   ProjectCard.jsx. Prioritize MoveButtons.jsx first since it's a
   keyboard-critical reorder control.
Run npm run lint and npm test after.
```

### Batch 4 — Docs correction (P2, DOCS-01/02) plus minor doc gaps (P3, QUAL-02/DOCS-03)
```
Fix four documentation-drift findings from AUDIT_REPORT.md — no code changes,
docs only:
1. DOCS-01: in docs/ARCHITECTURE.md (around line 40), update the `skills`
   data-model row — it still documents a single `icon` field; the real
   schema (src/lib/schemas/skill.js:14-22) has iconLibrary/iconSlug/iconUrl.
2. DOCS-02: in docs/design.md §20 (around lines 515-519), correct the text
   that says skill icons are "monochrome by default" — the actual,
   user-requested behavior (src/components/ui/SkillIcon.jsx) is colored by
   default with an opt-in `monochrome` override. This is important to fix
   correctly because a future session trusting design.md over the code could
   otherwise silently revert a direct user request.
3. QUAL-02: in docs/ARCHITECTURE.md's folder-structure diagram (lines 19-27),
   add the two missing lib subfolders: src/lib/icons/ and src/lib/hooks/.
4. DOCS-03: in README.md's command table, add the two undocumented npm
   scripts from package.json: migrate:skill-icons and
   generate:remixicon-index, each with a one-line description.
```

### Batch 5 — UX: unsaved-changes warning (P2, UX-02)
```
Fix UX-02 from AUDIT_REPORT.md: no admin form warns before an in-progress
edit is discarded by navigation or tab close. Add a shared
useUnsavedChangesWarning(isDirty) hook (new file under src/lib/hooks/ or
src/components/admin/ as fits the project's existing conventions) that:
- Attaches a beforeunload listener when isDirty is true, warning on tab
  close/reload.
- Intercepts in-app navigation (e.g. sidebar link clicks) while isDirty is
  true, with a confirmation prompt.
Wire it into src/components/admin/ProjectForm.jsx first (the largest, most
form, 647 lines), then apply to the other admin forms (Skills, Sections,
Profile, Settings) using the same hook. Add tests for the hook's dirty-state
logic. Run npm test and npm run lint after.
```

### Batch 6 — Performance: dashboard aggregation at scale (P2, PERF-04)
```
Fix PERF-04 from AUDIT_REPORT.md: the admin analytics dashboard
(src/app/admin/(dashboard)/page.js:40-45, src/lib/analytics/aggregations.js)
currently fetches all events in range with a plain find() and aggregates in
pure JS, which takes 4-8 seconds at 50,000 events (vs 43ms at low volume,
confirmed by live testing in this audit).

Move the heavy aggregations (top pages, unique visitors, referrers, etc.) to
MongoDB $group/$facet pipelines filtered server-side by date range, so the
database does the reduction instead of Node. Preserve the exact same output
shape consumed by the dashboard UI. Add a test seeding a moderate number of
synthetic events and asserting the aggregation result matches hand-computed
expected values (mirroring the approach already used in this audit: seed
fixture events with known distributions, assert exact counts). Run npm test
and npm run lint after.
```

### Batch 7 — Minor cleanup sweep (P3, low-risk, can be done together)
```
Fix these small P3 findings from AUDIT_REPORT.md, each independent and
low-risk — do them together as one cleanup pass:
1. QUAL-01: in src/app/admin/(dashboard)/media/actions.js (lines 28, 31, 41)
   and src/app/admin/(dashboard)/skills/actions.js (line 80), four failure
   branches return {ok:false} without an `error` key, breaking this
   project's own {ok,error} convention used everywhere else. Add an `error`
   string to each.
2. PERF-01: add src/app/icon.png (a real favicon) using the Next.js App
   Router metadata convention — currently /favicon.ico 404s on every page
   load.
3. PERF-02: add a modern browserslist entry to package.json to stop
   transpiling baseline-supported syntax (~14 KiB savings per Lighthouse).
4. SEO-01: add `metadata = { robots: { index: false, follow: false } }` to
   src/app/admin/layout.js as defense-in-depth alongside the existing
   robots.txt disallow rule.
5. SEO-02: add `alternates.canonical` (using the existing getSiteUrl()
   helper) to each page's generateMetadata call.
6. PRIV-01: set a real, independent ANALYTICS_SALT value in .env.local /
   deployment env vars, separate from JWT_SECRET.
7. DATA-01: add a unique index on the users collection's email field in
   scripts/ensure-indexes.js, mirroring the existing projects.slug pattern.
Run npm test and npm run lint after each file group; these are independent
enough to commit separately if preferred.
```

### Batch 8 (optional, lowest priority) — UX-01 and SEO-03
```
Two optional, lowest-priority items from AUDIT_REPORT.md:
1. UX-01: the toast system (src/components/admin/Toaster.jsx:118-128)
   supports an actionLabel/onAction "undo" affordance that's never used
   anywhere. Either wire it into the project/skill/media delete flows, or
   update docs/DECISIONS.md's description of Fix 5 to clarify the
   capability exists but isn't currently used anywhere.
2. SEO-03: optionally add JSON-LD structured data for project pages. Not a
   stated requirement — skip if there's no near-term need for rich search
   results.
```
