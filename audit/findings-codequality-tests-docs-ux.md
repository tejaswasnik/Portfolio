# Code quality, tests, docs, and UX findings (sections L, M, N, O)

## Findings

### QUAL-01 — Inconsistent action response shape on some failure branches
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `src/app/admin/(dashboard)/media/actions.js:28`, `:31`, `:41`; `src/app/admin/(dashboard)/skills/actions.js:80`
- **Evidence:** These branches return `{ok:false}` / `{ok:false, files:[]}` / `{ok:false, results:[]}` with no `error` key, unlike every other failure branch across all 8 admin `actions.js` files, which follow `{ok:false, error, fieldErrors?}`.
- **Expected vs actual:** Every action should return `error` on failure per the project's own documented convention; these four branches omit it.
- **Impact:** A caller relying on `result.error` for toast text gets `undefined` for these specific failure paths.
- **Recommended fix:** Add an `error` string to each of the four branches. (effort: S)

### QUAL-02 — ARCHITECTURE.md folder-structure diagram not updated for fixes-round-2 additions
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `docs/ARCHITECTURE.md:19-27`
- **Evidence:** The documented `src/lib/` tree omits `src/lib/icons/` and `src/lib/hooks/`, both added during "fixes round 2."
- **Expected vs actual:** Doc should reflect current folder structure.
- **Impact:** Minor — a future contributor reading ARCHITECTURE.md gets an incomplete map.
- **Recommended fix:** Add the two missing lines. (effort: S)

### DOCS-01 — ARCHITECTURE.md's skills field documentation is stale
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `docs/ARCHITECTURE.md:40` vs `src/lib/schemas/skill.js:14-22`
- **Evidence:** ARCHITECTURE.md documents a single `icon` field for `skills`; the actual `skillSchema` has `iconLibrary`, `iconSlug`, `iconUrl` instead, changed across two fixes-round-2 commits, with the doc never corrected.
- **Expected vs actual:** Doc should match the real schema shape.
- **Impact:** Misleads anyone (including a future Claude session) using ARCHITECTURE.md as the data-model source of truth.
- **Recommended fix:** Update the row to list `iconLibrary`/`iconSlug`/`iconUrl`. (effort: S)

### DOCS-02 — design.md §20 still says skill icons are monochrome by default, contradicting the actual, user-requested behavior
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `docs/design.md:515-519` (§20) vs `src/components/ui/SkillIcon.jsx:10-15`
- **Evidence:** design.md §20 states icons are "monochrome by default." `SkillIcon.jsx`'s own JSDoc (lines 10-15) explicitly notes it colors by default, "overriding design.md §20's original 'monochrome by default' call," per direct user feedback.
- **Expected vs actual:** design.md should reflect the current, user-approved behavior, not the superseded original design intent.
- **Impact:** Per CLAUDE.md, "where Figma and design.md disagree, Figma wins" — but nothing tells a future session that design.md itself is stale here; a future build or redesign pass could silently revert the user's explicit request by trusting design.md.
- **Recommended fix:** Correct §20's text to describe colored-by-default with the `monochrome` override. (effort: S)

### DOCS-03 — README command table omits two fixes-round-2 npm scripts
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** README.md (commands section) vs `package.json` scripts
- **Evidence:** `package.json` defines `migrate:skill-icons` and `generate:remixicon-index`; neither appears in README's documented command list.
- **Expected vs actual:** README should document every operationally-relevant script.
- **Impact:** Minor — a future maintainer regenerating the Remix Icon index or re-running the skill-icon migration has to discover the script by reading `package.json` directly.
- **Recommended fix:** Add both to the README command table with a one-line description each. (effort: S)

### UX-01 — Toast "undo" affordance exists in the component but is never wired up anywhere
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `src/components/admin/Toaster.jsx:118-128` (supports `actionLabel`/`onAction`)
- **Evidence:** `grep -rn "actionLabel" src/components/admin src/app/admin` returns zero matches outside the `Toaster.jsx` definition itself — no delete flow actually passes `actionLabel`/`onAction`.
- **Expected vs actual:** `docs/DECISIONS.md`'s "Fix 5" write-up implies/describes the undo capability as part of the toast system; in practice no caller uses it.
- **Impact:** Low — every delete action already has a `Dialog` confirmation step before the destructive action runs, so there's no actual safety gap, just a doc/feature mismatch.
- **Recommended fix:** Either wire `actionLabel="Undo"` into at least the project/skill/media delete flows, or correct `docs/DECISIONS.md` to say the capability exists but is unused. (effort: S-M)

### UX-02 — No unsaved-changes warning on any admin form
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `src/components/admin/ProjectForm.jsx` (647 lines) and other admin forms
- **Evidence:** `grep -rln "beforeunload" src/components src/app` returns nothing anywhere in the codebase.
- **Expected vs actual:** A long form like `ProjectForm` should warn before a navigation or tab-close discards unsaved edits.
- **Impact:** Real day-to-day risk for the single admin user repeatedly editing these forms — an accidental sidebar click or tab close silently loses all in-progress input with no warning.
- **Recommended fix:** Add a shared `useUnsavedChangesWarning(isDirty)` hook wired to `beforeunload` and to in-app navigation (e.g. intercepting sidebar link clicks while dirty). (effort: M)

## Pass list
- No unused dependencies — every `package.json` dependency is imported somewhere.
- `requireAdmin({ redirectOnFail: false })` call shape is identical across all 8 admin `actions.js` files.
- No unhandled throws in the actions layer — every action catches and returns a clean result.
- `getEnv()`'s lazy validation is a deliberate, documented tradeoff, not a defect.
- `createdAt`/`updatedAt` stamping is done correctly at call sites in `projects/actions.js:103,142`.
- `.env.example` matches `envSchema` exactly — no missing or extra variables.
- No flaky or tautological test assertions found anywhere in the test suite.
- Strong security-relevant unit coverage confirmed by reading source: login lockout threshold, `tokenVersion` mismatch invalidation, rate-limiter TTL logic tested via fixtures (not real timers), analytics hash daily rotation tested with pinned date keys, all three icon-library lookup modules tested for both hit and miss cases.
- README setup and deployment docs are accurate and specific — Vercel/Atlas/Gmail OAuth2 steps all check out against what this app actually needs.
- All delete actions use a `Dialog` confirmation before executing.
- Zero `href="#"` or empty-`href` dead links found anywhere.

## Docs-vs-code mismatch table
| Collection/Field | Documented | Actual | File:line |
|---|---|---|---|
| `skills.icon` | single `icon` field | `iconLibrary` + `iconSlug` + `iconUrl` | `docs/ARCHITECTURE.md:40` vs `src/lib/schemas/skill.js:14-22` |
| `src/lib/` tree | missing `icons/`, `hooks/` | both exist | `docs/ARCHITECTURE.md:19-27` |
| Skill icon default color | "monochrome by default" | colored by default | `docs/design.md:519` vs `src/components/ui/SkillIcon.jsx:10-15` |

All other collections (`projects`, `messages`, `media`, `siteSettings`, `profile`, `sections`, `events`, `users`, `rateLimits`) matched their documented schemas field-for-field — no further mismatches found.

## Highest-value missing tests
1. `iconSlugSchema` rejection cases (uppercase, embedded spaces, over-length) — only happy-path slugs are currently tested.
2. `media/actions.js`'s `deleteMedia` "in use" branch (the `usage` array shape that blocks deletion) — zero direct coverage.
3. A Playwright scrollWidth test for any *authenticated* admin page — `e2e/responsive.spec.js:28-31` explicitly skips all admin pages, so the widest/most complex layouts (data tables, icon-picker grid) have never been responsive-tested at all.
4. `searchSkillIcons` called with an invalid `library` enum value server-side (bypassing client validation).
5. A regression test asserting `createdAt`/`updatedAt` get set on create/update automatically — currently correct only because both call sites remember to pass them manually, with no test enforcing that convention going forward.
6. Server-action CSRF/Origin rejection, distinct from route-handler CSRF checks (may already be covered by the parallel security audit — cross-check before adding).
7. `SkillIcon.jsx`'s `monochrome` prop — documented in JSDoc, zero call sites, zero test coverage.

## Summary and scores
- **L (code quality): 8/10** — Very consistent conventions across the admin actions layer; the main deductions are the small response-shape slip (QUAL-01) and docs drifting behind two new `lib/` subfolders (QUAL-02).
- **M (tests): 9/10** — Excellent depth on security-sensitive logic (lockout, token invalidation, rate limiting, analytics hashing, icon lookups). The main gap is zero authenticated-route e2e coverage for admin pages.
- **N (docs/deployment): 7/10** — README is accurate and specific and would genuinely work for a new developer. `docs/ARCHITECTURE.md` and `docs/design.md` have drifted behind the fixes-round-2 code changes; DOCS-01 and DOCS-02 are the standout issues, since DOCS-02 in particular risks a future session reverting a direct user request if it trusts design.md over the actual code.
- **O (UX): 7/10** — Delete confirmations and link hygiene are solid. The missing unsaved-changes warning (UX-02) is the one finding with real day-to-day impact for the site's single admin user; the toast-undo gap (UX-01) is a minor doc/feature mismatch, not a safety issue.
