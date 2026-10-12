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
- Commit: (recorded after commit below)
- Verification: `npm run lint && npm test && npm run build` all pass (63 tests, +9 new: a pure tag/status filter helper and a slug-lookup/404 helper, both DB-mock-free per docs/MASTER_PROMPT.md §5). `next build` confirms `/projects` and `/projects/[slug]` are dynamic (`ƒ`), not statically prerendered. Dev server checked: `/projects` → 200, `/projects/nonexistent-slug` → 404, no server errors in the log.
- Notes: see docs/DECISIONS.md for deviations (markdown-it for sanitised rendering, tag filter keyed by skill id not slug, lightbox has no Figma frame, index-only screenshot captions, prev/next by shared `order` field, shared LetsTalkSection/ProjectCard reuse, more Button-class-string duplication for links, two new icons downloaded verbatim).

### 5. Contact form
- Status: not started

### 6. Maintenance, 404, SEO
- Status: not started

### 7. Auth and admin shell
- Status: not started

### 8. Admin content management
- Status: not started

### 9. Images: ImageKit and banner
- Status: not started

### 10. Messages and settings
- Status: not started

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
