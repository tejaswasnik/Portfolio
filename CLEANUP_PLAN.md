# Cleanup plan

Generated from Phase 1 (find only — nothing deleted yet). Evidence for every row comes from a real command run against this repo, shown below each table. **Status: awaiting approval before Phase 2.**

## Baseline (clean install)

```
npm ci            → added 430 packages, 7 vulnerabilities (2 moderate, 5 high)
npm run lint      → clean, 0 errors/warnings
npm test          → 56 test files, 382 tests, all passing
npm run build     → succeeds, 25 routes (see below)
```

Next.js 16 (Turbopack) no longer prints a first-load-JS-per-route table the way the old webpack build did, so there is no "before" size-per-route number to diff against in Phase 2 — I'll report `.next/static` chunk sizes before/after instead and call that out explicitly rather than imply a number I don't have.

**Repo size** (excluding `node_modules` and `.git`): **291.75 MB** — almost all of that is `.next/` (282 MB, gitignored build output, regenerated on every build and irrelevant to repo/git size). `node_modules`: 590.48 MB. `.git`: 12.07 MB. `audit/` specifically: 6.9 MB, **and it's tracked in git** (87 files) despite already being listed in `.gitignore` — see category (d).

**Routes built** (25): `/`, `/_not-found`, `/admin` ×12 subpages, `/admin/login`, `/api/*` ×5, `/dev/ui`, `/maintenance`, `/projects`, `/projects/[slug]`, `/robots.txt`, `/sitemap.xml`.

---

## (a) Unused source files

| Path | Evidence | Action | Risk |
|---|---|---|---|
| `src/lib/db/collections/rate-limits.js` | `npx knip` flags it as an unused file. Confirmed: `src/lib/rate-limit/index.js` reads `db.collection(COLLECTIONS.rateLimits)` **directly**, never importing `rateLimitsCollection()` from this file. No other file references it, no test file exists for it. | Delete | Low |

No other unused source files found — every component/hook/util/API route/page knip and manual grep checked resolves to a real import or route.

---

## (b) Dead code inside used files

| Item | File | Evidence | Action | Risk |
|---|---|---|---|---|
| `Crosshair` function | `src/components/ui/PageFrame.jsx:88` | `grep -rn "\bCrosshair\b" src/` → zero call sites, not even within its own file (`Rails`/`BottomBlur` in the same file ARE rendered in `PageFrame`'s JSX; `Crosshair` isn't). Note: `TransitionProvider.jsx` independently hand-rolls near-identical crosshair markup for the page-transition overlay — a duplicate I introduced without noticing this component existed. Not merging them (different positioning needs — static vs. GSAP-animated — real refactor risk), just removing the dead one. | Delete | Low |
| `trackClick` function | `src/lib/analytics/trackEvent.js:37` | Zero call sites. `TrackedLink.jsx` (the only tracked-link component) calls `trackEvent("click", {...})` directly, not this wrapper. `trackEvent` itself stays — it's actively used. | Delete | Low |
| `RESET_LOGIN_STATE` const | `src/lib/auth/lockout.js:46` | Zero usage anywhere. The actual post-login reset happens in `resetLoginFailures()` (`src/lib/db/collections/users.js`), which builds its own inline `{failedAttempts: 0, lockedUntil: null}` rather than importing this constant. | Delete | Low |
| `export default AnimatedTextSlider` (just the default-export line) | `src/components/ui/AnimatedTextSlider.jsx:55` | knip flags a duplicate export; `ProfileIdentity.jsx` imports the **named** `{ AnimatedTextSlider }`, never the default. The component stays — only the redundant `export default` line goes. | Delete (1 line) | Low |
| `countInterestImages` function | `src/lib/db/collections/interestImages.js:27` | Zero usage anywhere, including internally. Leftover from a `listInterestImages` admin action that was written then removed later in the same build (the admin page now fetches directly in the server component). | Delete | Low |
| `TOTAL_MS`, `Z_INDEX` consts | `src/lib/transitions/constants.js:12,61` | Zero usage — `TransitionProvider.jsx` hardcodes `z-[70]` directly in JSX instead of using `Z_INDEX.overlay`, and never references `TOTAL_MS` (each beat's own duration constant is used instead). My own recent code; confirmed dead via grep. | Delete | Low |

### Keep — exported but only used within their own file

knip also flags 17 more "unused exports": `ALL_NAV_ITEMS`, `defaultFlipKeyForVariant`, `BottomBlur`, `Rails`, `rangeOptions`, `LOCKOUT_MINUTES`, `sessionCookieOptions`, `getImageKitClient`, `eventTypeValues`, `interestImageSchema`, `interestImageLayoutSchema`, `mediaUsageValues`, `socialLinksSchema`, `sectionKeyValues`, `MAX_VISIBLE_TOASTS`, and the 9 `xCollection(db)` raw-accessor functions (`eventsCollection`, `mediaCollection`, `messagesCollection`, `profileCollection`, `projectsCollection`, `sectionsCollection`, `siteSettingsCollection`, `skillsCollection`, `interestImagesCollection`, `usersCollection`).

I checked every one: each is genuinely **called**, just only from within its own defining file (e.g. `skillsCollection(db)` is used by `findAllSkills`/`insertSkill`/etc. in the same file, but nothing outside `skills.js` imports it directly). The `xCollection` pattern in particular is a deliberate, uniform convention repeated identically across every `src/lib/db/collections/*.js` file.

**Recommendation: keep as-is.** Removing the `export` keyword from ~17 files changes zero behavior and zero bundle size (all server-only/build-time code) for real churn risk (17 files touched, chance of missing a test/dynamic import). Flagging here per the task's instructions, not acting on it.

---

## (c) Dependencies

| Package | Evidence | Action | Risk |
|---|---|---|---|
| `remixicon` | `npx knip` + `npx depcheck` both flag it unused. Real story: `scripts/generate-remixicon-index.js` reads raw SVGs from `node_modules/remixicon/icons` at **dev time** to regenerate the committed `src/lib/icons/remixicon-index.json`, which is what the running app actually imports (documented in `remixIcons.js`'s own header comment — deliberate, so Next's serverless bundler can trace the import statically). It's currently listed under `"dependencies"` in `package.json`; it should be a `devDependency` (a code-gen tool, not a runtime import). | Move dependencies → devDependencies (not delete) | Low |
| `@tailwindcss/turbopack`, `tailwindcss` | `depcheck` flags both unused. **False positive** — `next.config.mjs:43` references `@tailwindcss/turbopack` as the Turbopack CSS loader string, and `src/styles/globals.css:1` has `@import "tailwindcss"`. depcheck can't trace config-string or CSS-file references. | Keep, no action | — |

No duplicate dependencies found (3 icon packages — `simple-icons`/`lucide-static`/`remixicon` — are 3 deliberately distinct, admin-selectable icon libraries per `ICON_LIBRARIES`, not duplicates; no two date libraries, no two className helpers — the codebase uses plain template literals throughout, no `clsx`/`cva`).

---

## (d) Stray / generated files

| Path | Evidence | Action | Risk |
|---|---|---|---|
| `audit/` (87 files, 6.9 MB: logs, Lighthouse JSON, screenshots, scratch `.cjs` scripts) | **Tracked in git** (`git ls-files audit/` → 87 hits) despite `.gitignore:49` already listing `audit/` — committed before that ignore rule was added, never cleaned up since. One-time output of a past audit/review pass; nothing in `src/`, `scripts/`, config, docs, or `package.json` references any file under it. | `git rm -r audit/` | Low |
| `test-results/.last-run.json` | Not tracked by git (`.gitignore:45` already covers `/test-results/`) — present on disk only because Playwright wrote it locally. | No git action needed | — |
| `.next/` | Not tracked (`.gitignore:17`). | No action | — |

`.gitignore` already correctly covers the generated-file categories that matter (`.next/`, `/test-results/`, `audit/`, env files, OS files, TS build info). No `.DS_Store`/`Thumbs.db`/`*.bak`/`*.old`/`*copy*` files found anywhere in the tracked tree.

One unrelated, very low-priority gitignore gap: `.impeccable/` (a design-review tool's local cache) exists on disk but isn't tracked — currently kept out only by this machine's local `.git/info/exclude`, which isn't part of the repo. Adding `.impeccable/` to the committed `.gitignore` would make that robust for any other clone, but it's tool-local state, not really "this project's" concern — flagging, not acting unless you want it.

---

## (e) Unused public assets

**N/A — there is no `public/` directory in this repo at all** (`find . -maxdepth 1 -iname public` → nothing, `git ls-files | grep '^public/'` → nothing). Favicon/OG-image/etc. are all admin-configurable and served from ImageKit URLs stored in the database, never from static files. Nothing to check or clean here.

---

## (f) Leftover scaffolding

Checked for: default create-next-app files (`vercel.svg`, `next.svg`, etc. — none exist, consistent with no `public/`), TypeScript leftovers (`tsconfig.json`, `*.d.ts`, `next-env.d.ts`, `@types/*` — none found anywhere), duplicate configs (exactly one `eslint.config.mjs`, one `.prettierrc.json`/`.prettierignore`, no `tailwind.config.js` — Tailwind v4's CSS-based config lives in `globals.css` as expected, no `postcss.config.*` needed separately).

**Nothing to clean in this category.**

---

## (g) Process docs — flagging only, your call (not deleting)

| Path | Size | What it is |
|---|---|---|
| `PROGRESS.md` (root) | 47.6 KB | Step-by-step log of build steps 0–13 per `docs/MASTER_PROMPT.md`; reads as complete/historical. |
| `AUDIT_REPORT.md` (root) | 38.6 KB | Write-up of the same audit pass that produced the `audit/` directory above. |
| `docs/PROMPTS.md` | 11.8 KB | Per-step build prompts. |
| `docs/MASTER_PROMPT.md` | 6.7 KB | The orchestrating prompt `PROGRESS.md` tracks against. |
| `docs/ROADMAP.md` | 2.6 KB | Build-order roadmap. |
| `docs/FIXES_PROMPT_1.md` | 9.2 KB | A fix-round prompt (matches the task's "`docs/FIXES_PROMPT.md`" category, numbered). |

None of these are imported or read by any code — they're pure documentation of a now-finished build process. Per your rules I'm not deleting any of them. Options: **(1) keep as-is, (2) move all six to `docs/archive/`.** Tell me which and I'll do it in Phase 2.

**Not flagged** (these stay regardless): `docs/DECISIONS.md` — despite being large (105 KB), this is *actively* cited throughout the current codebase (dozens of `// see docs/DECISIONS.md` comments across `src/`) as ongoing architecture/decision reference, not a finished-process doc. `README.md`, `CLAUDE.md`, `.env.example`, `docs/PRD.md`, `docs/design.md`, `docs/ARCHITECTURE.md`, `docs/figma-map.md`, `docs/motion.md` are all explicitly protected by your rules and are also genuinely still relevant.

---

## (h) Database / env leftovers

| Check | Result |
|---|---|
| `.env.example` vs actual `process.env` usage | **Matches exactly.** All 13 vars (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `IMAGEKIT_*` ×3, `GOOGLE_*` ×3, `GMAIL_USER`, `GITHUB_TOKEN`, `ANALYTICS_SALT`, `SITE_URL`) are read via `src/lib/env.js`'s centralized `getEnv()`/Zod schema, which is why a plain `grep process\.env\.` under-reports them — checked `env.js` directly instead. No orphaned example vars, no code reading an env var absent from `.env.example`. |
| `package.json` scripts → file targets | All 6 (`db:ensure-indexes`, `db:seed`, `seed:admin`, `seed:interests`, `migrate:skill-icons`, `generate:remixicon-index`) point at files that exist. |
| Collections referenced only by removed code | `COLLECTIONS.rateLimits` (the key itself) stays — `rate-limit/index.js` uses it directly even though the dead `rateLimitsCollection()` wrapper goes (see category a). |

---

## Risky items — not part of the delete list, surfacing for a decision

- **`src/app/dev/ui/page.js`** (route `/dev/ui`) — a design-token/component showcase page. It's a real, working, *reachable* route — `middleware.js`'s matcher is `/admin/:path*` only, so `/dev/ui` is **publicly accessible in production**, unauthenticated. This isn't "unused" (deleting it would change behavior — the route currently works), so it's out of scope for this cleanup's "prove unused" bar, but you may want it removed or gated before launch. **Not touching without your say-so.**
- **`npm audit`: 7 vulnerabilities (2 moderate, 5 high)**, all transitive: `braces` (via `eslint-config-next`'s `@next/eslint-plugin-next` → `fast-glob` → `micromatch` chain) and `uuid` (via `imagekit`'s dependency on an old `uuid`). Both fixes npm offers require `--force` with breaking downgrades — `eslint-config-next@14.2.35` (incompatible with this Next 16 project) and `imagekit@1.5.0`. Fixing either would **change behavior** (the opposite of this task's goal), so not proposing either. Pre-existing, already noted as "left unresolved" in `docs/DECISIONS.md` step 0.

---

## Summary

| Category | Delete | Move | Keep (flagged/unsure) |
|---|---|---|---|
| (a) files | 1 | — | — |
| (b) dead code | 6 items (5 files touched) | — | 17 items (no action recommended) |
| (c) dependencies | — | 1 (`remixicon`) | 2 false positives |
| (d) stray/generated | 87 files (`audit/`) | — | — |
| (e) assets | — | — | N/A, no `public/` |
| (f) scaffolding | — | — | nothing found |
| (g) process docs | 0 (your call) | 6 pending your decision | — |
| (h) db/env | — | — | clean |

**Estimated size saving:** ~6.9 MB off the tracked repo (`audit/`), plus whatever `git gc` later reclaims from history (out of scope — history isn't touched). No `node_modules` size change (no packages actually removed, one moved sections). Dead-code deletions are a handful of KB of source, immaterial to bundle size but real for maintainability.

**Status: Phase 1 complete. Awaiting your approval (and the (g) decision) before Phase 2.**
