# Progress

Tracks execution of `docs/PROMPTS.md` steps 0–13, per `docs/MASTER_PROMPT.md`. One entry per step: status, date, commit hash, verification result, deviations/open issues.

## Steps

### 0. Scaffold
- Status: done
- Date: 2026-10-12
- Commit: f74dc81
- Verification: `npm run lint && npm test && npm run build` all pass
- Notes: see docs/DECISIONS.md for deviations (Tailwind v4 config, dropped experimental cache flags, lazy env loader, npm audit advisories left unresolved).

### 1. Design tokens and theme
- Status: done
- Date: 2026-10-12
- Commit: 373bb60
- Verification: `npm run lint && npm test && npm run build` all pass; dev server checked at /dev/ui — compiled CSS inlines `var(--token)` into utility rules (no hard-coded hex); no-flash theme script and font variables confirmed present in rendered HTML.
- Notes: see docs/DECISIONS.md for deviations (no tailwind.config.js, light theme tokens partly derived from screenshot since Figma variables only exposed text colors, --cta-bg/--cta-text kept constant across themes, added --border-hover token).

### 2. Database and schemas
- Status: done
- Date: 2026-10-12
- Commit: e5c3728
- Verification: `npm run lint && npm test && npm run build` all pass (47 tests); confirmed no top-level `getEnv()`/`getClient()`/`getDb()` calls, so the build succeeds with no `.env.local` present.
- Notes: see docs/DECISIONS.md for deviations (lowercase project status enum, relative imports in src/lib/db for plain-node script compatibility, `node --env-file` instead of dotenv, 24-month events TTL, thin collection helpers vs. full CRUD, a real `.env` appeared on disk but db:seed/db:ensure-indexes were not run against it).

### 3. Public home page
- Status: done
- Date: 2026-10-12
- Commit: caa0bcb
- Verification: `npm run lint && npm test && npm run build` all pass (54 tests); dev server checked — nav/rails render correctly in HTML, no server errors; sections render nothing yet because `sections`/`profile`/`skills`/`projects` are unseeded in the live DB (expected, see docs/DECISIONS.md). Visibility/graceful-degradation logic (empty social links skipped, failed GitHub fetch hides Activity, unpublished-DB states still render the rest of the page) verified by code review plus a new Vitest suite for `src/lib/github/contributions.js`.
- Notes: see docs/DECISIONS.md for deviations (home-page reads hit the real `.env` Mongo cluster read-only at build time since `/` is statically prerendered; Banner/Profile split into independently toggleable pieces; project cards render `coverImage` not bespoke illustration; icons inlined with `currentColor` instead of `<img src>`; Message me/Let's Talk degrade to `mailto:`; a few spots duplicate Button's class strings for `<a>` links since editing step 1's primitives was out of scope).

### 4. Projects pages
- Status: done
- Date: 2026-10-12
- Commit: 752b581
- Verification: `npm run lint && npm test && npm run build` all pass (63 tests, +9 new: a pure tag/status filter helper and a slug-lookup/404 helper, both DB-mock-free per docs/MASTER_PROMPT.md §5). `next build` confirms `/projects` and `/projects/[slug]` are dynamic (`ƒ`), not statically prerendered. Dev server checked: `/projects` → 200, `/projects/nonexistent-slug` → 404, no server errors in the log.
- Notes: see docs/DECISIONS.md for deviations (markdown-it for sanitised rendering, tag filter keyed by skill id not slug, lightbox has no Figma frame, index-only screenshot captions, prev/next by shared `order` field, shared LetsTalkSection/ProjectCard reuse, more Button-class-string duplication for links, two new icons downloaded verbatim).

### 5. Contact form
- Status: done
- Date: 2026-10-12
- Commit: ed92cf4
- Verification: `npm run lint && npm test && npm run build` all pass (78 tests, +15 new: env-loader fix, rate-limit atomic upsert, sendMail credential/send-failure paths, full contact route handler with every dependency mocked). `next build` confirms `/api/contact` is dynamic (`ƒ`). Dev server checked: `/projects`'s "Let's Talk" button renders as a real `<button>` (not gated by the unseeded `sections` collection); `POST /api/contact` exercised live for bad email (400 + fieldErrors), empty message (400 + fieldErrors), and a filled honeypot (silent 200, confirmed no DB write via code path) — did not submit a fully valid request live, to avoid writing an unrequested document to the real Mongo cluster.
- Notes: see docs/DECISIONS.md for deviations (fixed a pre-existing getEnv() bug that broke the Mongo client for any missing optional var; IP-hash salt source; atomic rate-limit upsert; honeypot returns silent success; client always sees success once the message is saved regardless of email outcome; ContactModalProvider mounted in PageFrame; Message me/Let's Talk no longer gated on a social email).

### 6. Maintenance, 404, SEO
- Status: done
- Date: 2026-10-12
- Commit: 692d5b5
- Verification: `npm run lint && npm test && npm run build` all pass (96 tests, +9 new: `getSiteUrl`, `resolveSiteMeta`, `isMaintenanceModeOn`). Dev server checked: an unmatched URL → 404 (body has "ERROR 404"/"This page wandered off"/"Go home"/"View projects"), `/maintenance` → 200 (body has "MAINTENANCE MODE"/"Back soon"), `/sitemap.xml` and `/robots.txt` both 200 and well-formed (sitemap degrades to just `/` and `/projects` since the DB is unseeded; robots disallows `/admin` and `/api`, links the sitemap).
- Notes: see docs/DECISIONS.md for deviations (no `src/middleware.js` — maintenance mode and SEO metadata both implemented in a new `src/app/(public)/layout.js` instead, since `/admin` has no pages yet; a single root `src/app/not-found.js` instead of `(public)/not-found.js` per ARCHITECTURE.md's diagram, since only a root boundary reliably catches a genuinely unmatched URL; new `SITE_URL` env var; maintenance page uses the real full nav, not Figma-map's claimed "logo-only" nav).

### 7. Auth and admin shell
- Status: done
- Date: 2026-10-12
- Commit: 62bac7d
- Verification: `npm run lint && npm test && npm run build` all pass (129 tests, +33 new: lockout, JWT sign/verify/tamper/expiry, password hashing, CSRF origin check, requireAdmin's DB-backed tokenVersion check, the login/logout route handlers, nav-item active-route/breadcrumb logic). `next build` shows `/admin` and the login/logout routes as dynamic (`ƒ`), `/admin/login` as static (`○`). Dev server checked live: unauthenticated `GET /admin` → 307 to `/admin/login`; `/admin/login` renders the real copy ("Welcome back.", "Back to site", etc.); cross-origin `POST /api/admin/login` → 403. A direct Mongo connection attempt from this sandbox's shell failed (`querySrv ECONNREFUSED` — no outbound network to Atlas here), so the live same-origin login attempt correctly hit the graceful 503 path rather than reaching real credential checks; the credential/lockout logic itself is fully covered by mocked tests instead.
- Notes: see docs/DECISIONS.md for the two-layer trust model (middleware = edge signature/expiry + sliding refresh, requireAdmin() = authoritative DB-backed tokenVersion check), lockout thresholds (5 attempts / 15 min, taken from the real Figma copy), CSRF Origin check, route-group split (`admin/(dashboard)` vs `admin/login`), and the `next build` "middleware deprecated, use proxy" notice flagged for step 13.

### 8. Admin content management
- Status: done — all 5 screens built (Projects list, New project, Edit project, Skills, Sections, Profile & About), stopped for review after the last one per docs/PROMPTS.md step 8 ("Do them in that order and stop for my review after each one.")
- Date: 2026-10-12
- Commit: 1197856 (screen 1), 61b6283 (screens 2–3 + route-structure fix), 1253f31 (screen 4, Skills), 7ead69b (screen 5, Sections), 73edc74 (screen 6, Profile & About — the prompt lists this as the 5th and last screen; Projects' New/Edit counted as two commits above)
- Verification: `npm run lint && npm test && npm run build` all pass (185 tests, +56 since step 7). `next build` shows `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]`, `/admin/skills`, `/admin/sections` and `/admin/profile` all dynamic (`ƒ`) and correctly nested under `(dashboard)/`. Live dev-server check: unauthenticated `GET` on all six → 307 to `/admin/login`; `GET /` still 200 throughout. A full authenticated visual pass against any of the five Figma frames (65:11/66:700/66:9/67:7/67:836/69:612) wasn't possible in this sandbox (no outbound network to the real Mongo Atlas cluster, same limitation noted in step 7), so every screen was built directly from `get_design_context`'s pixel values and the rendered screenshots instead.
- Notes: see docs/DECISIONS.md step 8 for every deviation and **a bug fix** on screens 2–3: `/admin/projects` had been built as a sibling of `src/app/admin/(dashboard)/` instead of nested inside it, so it had no Sidebar/Topbar shell and skipped `requireAdmin()`'s DB-backed check — moved under `(dashboard)/`; every screen since was built there from the start. Skills-specific: one `SkillsManager` covers Add+Edit in one panel (no separate edit frame exists); Icon is a typed abbreviation, not an icon-library picker; Category is free-text + datalist, not a closed select. Sections-specific: no add/delete (the 8 keys are a fixed enum); the side index's key→label map and per-row descriptions moved to a shared `src/lib/sections.js`, also used by the public home page. Profile & About-specific: this one form writes across three collections (`profile`, `siteSettings` for footer text/GitHub username, and `sections` for the "Show heatmap" toggle) instead of inventing profile-only duplicate fields, confirmed against how the public home page/`LetsTalkSection` actually source each value; "Show heatmap" saves instantly via the Sections screen's own action rather than batching into this form's Save; `profile`/`siteSettings` got their first write helpers (`updateProfile`/`updateSiteSettings`, both upserting); About is a plain blank-line-paragraph textarea, confirmed against `AboutSection.jsx`'s real rendering, not a markdown editor. Carried over from earlier screens: `insertIdAtPosition` lives in `src/lib/db/order.js`; photo/resume/cover-image/screenshots are all plain URL fields pending step 9's ImageKit uploader; server actions return `{ok,error}` instead of redirecting; Topbar's breadcrumb doesn't show a third page-specific segment yet (deferred, noted once in step 8's Projects entry). Step 8 is now fully built — step 9 (ImageKit and banner) is next.

### 9. Images: ImageKit and banner
- Status: done
- Date: 2026-10-12
- Commit: 67cfab9
- Verification: `npm run lint && npm test && npm run build` all pass (201 tests, +12 new: `src/lib/imagekit/client.test.js`, `/api/imagekit-auth/route.test.js`, `src/lib/imagekit/actions.test.js`, plus `profileFormSchema`/`bannerFormSchema` regression coverage in `profile.test.js`). `next build` shows `/admin/banner` and `/api/imagekit-auth` registered and dynamic (`ƒ`). Live dev-server check: unauthenticated `GET /admin/banner` → 307, `GET /api/imagekit-auth` → 401. **Verified against the real ImageKit API** (unlike MongoDB Atlas, still unreachable from this sandbox): a throwaway script confirmed `generateUploadAuth()` signs correctly with the real private key and `client.listFiles({ limit: 1 })` round-trips successfully against ImageKit's live API using the real credentials already present in `.env`. Could not exercise the full browser upload flow or the admin screens visually (needs an authenticated session, blocked on the same unreachable Mongo cluster as every prior admin step).
- Notes: see docs/DECISIONS.md step 9 for full details. Built one shared upload path (`src/lib/imagekit/`: `client.js` signing/delete, `upload.js` XHR-based browser upload for real progress events, `useImageKitUpload.js` hook, `actions.js`'s `deleteImageKitFileAction`) plus `GET /api/imagekit-auth` (admin-gated, Node runtime, never exposes the private key) and a reusable `Dropzone` component, wired into the project cover image/screenshots, profile photo/resume, and a new two-stage `/admin/banner` screen (Figma 69:7 — select → upload → "not saved" preview → explicit "Use this banner", unlike every other instant-apply Dropzone use). **Caught and fixed a real bug**: step 8's `profileFormSchema` included `bannerUrl`/`bannerFileId` with Zod defaults, so every Profile & About save would have silently cleared the banner the moment it had a real writer to collide with — split into `profileFormSchema` (omits both) and a new narrow `bannerFormSchema`, with a regression test. Only banner/resume persist a fileId for cross-session delete-on-replace, matching `docs/ARCHITECTURE.md`'s data model exactly (it lists `bannerFileId`/`resumeFileId` but no fileId field for the photo or project images); cover image/screenshots/photo clean up only within the same editing session. `prefers-reduced-motion` for the banner GIF was already handled in step 3 (`BannerMedia.jsx`) — nothing new needed there. Browser-only upload code (XHR, the hook, Dropzone/BannerManager UI) has no unit tests, consistent with the project's Node-only vitest environment and every prior step's testing scope.

### 10. Messages and settings
- Status: done
- Date: 2026-10-12
- Commit: (pending)
- Verification: `npm run lint && npm test && npm run build` all pass (218 tests, +17 new: `messageIdSchema`/`messageToggleSchema`, `settingsFormSchema`/`maintenanceToggleSchema`, `changePasswordSchema`, and the pure `filterAdminMessages` helper). `next build` shows `/admin/messages`, `/admin/messages/[id]` and `/admin/settings` all dynamic (`ƒ`) and nested under `(dashboard)/`. Live dev-server check: unauthenticated `GET` on all three → 307 to `/admin/login`. A transient dev-only "objectIdStringSchema is not defined" error turned out to be stale Turbopack HMR state (a clean `rm -rf .next` + restart cleared it; the full `npm run build` had already passed cleanly both before and after). Could not exercise the full authenticated UI (same unreachable-Mongo limitation as every prior admin step).
- Notes: see docs/DECISIONS.md step 10. Messages: list + detail match Figma 70:7/70:720, but the detail screen's "Delivery"/"Sender" cards only show real tracked data (`createdAt`, `emailFailed` + working Retry, honeypot always "Clear" by construction, truncated `ipHash`) — Figma's sample Country/Device/Rate-limit rows were dropped rather than fabricated, since `messageSchema` doesn't capture that (it's step 11 analytics' job). Opening a message marks it read as a real side effect of the page render (matches actual inbox semantics). Settings: one bundled "Save settings" for Site & SEO/Notifications/admin email (`settingsFormSchema.pick()`s only the fields it owns, proactively avoiding the exact bug class step 9 caught), maintenance mode is its own instant toggle, and password change is a separate mini-form requiring the real current password. Changing admin email or password bumps `tokenVersion` and redirects to `/admin/login`, per the architecture's documented behavior. Data export returns JSON straight from a server action (no new route), downloaded client-side via a Blob. New `ArchiveIcon`/`ReplyIcon`/`DownloadIcon` downloaded verbatim from Figma.

### 10.5 Review note
- Everything from here on (steps 11–13 and the final phase) continues autonomously per docs/MASTER_PROMPT.md's "Work autonomously... do not stop to ask me unless truly blocked" and the user's "continue till the project is completed" — no per-screen review pause, unlike step 8's explicit instruction.

### 11. Analytics
- Status: not started

### 12. Media library
- Status: not started

### 13. Polish and launch
- Status: not started

## Designed by me
- `Toggle` (switch) primitive — no Figma frame anywhere in the file (home page has none; admin section/skill toggles come in step 8). Built from tokens; revisit against the real `67:836` frame in step 8.
- `Dialog` primitive's focus-trap/Esc/aria wiring — the contact modal (`74:1105`) gave the visual chrome (panel, header, ESC label, inputs), but the interactive behavior itself has no design reference.
- GitHub heatmap section heading text ("Activity") — the Figma `get_design_context` response for that section was truncated before a heading node appeared; used the side index's own label for consistency.
- Public-facing empty states for the avatar ("no caption" instead of Figma's "YOUR PHOTO") and banner ("Banner coming soon" instead of Figma's "Upload GIF banner") — the Figma copy reads as an editor-facing hint, not public copy.
- Screenshot lightbox (`src/components/public/Lightbox.jsx`) — no Figma frame for the overlay itself; gallery grid/caption-row chrome follows the real frame, focus-trap/Esc/arrow-key interaction reuses `Dialog`'s pattern from step 1.

## Blocked
(Failures that survived 3 distinct fix attempts.)

## Needs from you
- Real credentials for `.env.local` (MongoDB URI, ImageKit keys, Google OAuth client id/secret/refresh token, Gmail user, GitHub token, analytics salt, JWT secret, admin email) — building against mocks/placeholders until supplied.
- Run `npm run seed:admin` against a reachable database and do a full manual login → `/admin` dashboard → sign-out pass — not exercisable in this sandbox (no outbound network to MongoDB Atlas; see step 7's notes).
