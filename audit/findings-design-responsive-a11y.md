# Design fidelity, responsive and accessibility findings (areas F, G, H)

Scope: public + admin pages of the running audit build (`http://localhost:3000`, disposable `portfolio_audit` database, admin `audit@test.local`). Evidence: Playwright (Chrome, real `channel: "chrome"`, mobile-correct viewport emulation via `newContext({viewport})`, not just window resize), raw curl HTML dumps, Figma `get_screenshot` for frame `5:5314` (Home, 1440 dark), and direct source reads.

**Not fully covered in this pass** (time-boxed; flagged, not fabricated):
- No axe-core/Lighthouse run was executed. Contrast was instead verified by direct WCAG relative-luminance computation against the actual token hex values.
- Manual interactive keyboard walkthroughs of the contact modal, lightbox, icon-picker dialog and toast dismiss were **not** performed — only static code evidence was checked.
- Only one Figma frame (Home, 1440 dark) was pixel-screenshot-diffed; the other 24 frames in `docs/figma-map.md` were reviewed via source/markup comparison, not `get_screenshot` diffing.
- Light-theme Home at 1280/768/375 was not diffed against Figma's light frames.

## 1. Design-fidelity table (F)

| Page | Width/theme | Method | Result |
|---|---|---|---|
| `/` | 1440 dark | Screenshot diff vs Figma `5:5314` | Matches — only deltas are seed-data-driven (DESIGN-01..03), not code bugs |
| `/` | 1440 light | Captured, not diffed (no Figma 1440-light frame exists) | Visually consistent |
| `/projects`, `/projects/[slug]`, contact modal/success | 1440 | Reviewed via code vs Figma node IDs | Matches structurally; no pixel diff |
| Maintenance | — | Not loaded this pass | Not verified |
| 404 | 1440 | Screenshot captured | Renders correctly, not pixel-diffed |
| All 10 scanned admin routes | 1440 | Screenshot captured each | Structurally consistent shell; not pixel-diffed per frame |

### DESIGN-01 — Home "Activity" (GitHub heatmap) section never renders
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `src/app/(public)/page.js:39,50,77-78`, `src/components/public/GithubHeatmap.jsx`
- **Evidence:** Figma shows a populated heatmap; live screenshot/side-index has no Activity section at all.
- **Expected vs actual:** Figma shows a populated GitHub contribution heatmap; live app shows no Activity section.
- **Impact:** `page.js:50` guards rendering on `Boolean(calendar)` — this is the documented GitHub-API-down fallback, very likely correct behavior in this sandboxed environment, not a bug.
- **Recommended fix:** None needed if confirmed as the fallback; verify `GITHUB_USERNAME`/token in real deployment. (effort: N/A)

### DESIGN-02 — Home social row shows only "Message me", not 4 buttons
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** seed data `scripts/seed.js` (no `githubUrl`/`linkedinUrl`/`twitterUrl`)
- **Evidence:** Figma shows Message me/GitHub/LinkedIn/Twitter; live shows one centered button, degrading gracefully.
- **Expected vs actual:** Figma shows 4 social buttons; live shows 1, due to empty seed profile links, not a code defect.
- **Impact:** None — expected behavior for missing data.
- **Recommended fix:** None — populate real profile links via admin panel. (effort: N/A)

### DESIGN-03 — Project cards show gradient placeholders and empty tech-tag rows
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** `scripts/seed.js:63-64,81-82` (`coverImage: "", screenshots: [], techIds: []`)
- **Evidence:** Raw HTML shows empty `<div class="flex flex-wrap gap-1.5"></div>` for tags; matches seed data exactly.
- **Expected vs actual:** Expected placeholder rendering for empty seed data — matches design intent for the empty state.
- **Impact:** None — expected behavior for missing data.
- **Recommended fix:** None — assign real cover image/tech IDs via admin panel. (effort: N/A)

### DESIGN-04 — Admin empty/loading/error/confirm states and admin light theme remain undesigned
- **Severity:** P3
- **Confidence:** Confirmed (doc cross-check)
- **Location:** `docs/design.md` §19, `docs/figma-map.md` "Known gaps"
- **Evidence:** Both docs still list these as not-yet-designed; spot-checked Skills' empty state (`SkillsManager.jsx:253-255`) exists and looks reasonable but has no Figma ground truth to verify against.
- **Expected vs actual:** No Figma frame exists for these states, so fidelity cannot be scored either way.
- **Impact:** None currently — documented, pre-existing scope gap.
- **Recommended fix:** None required now; re-audit if/when Figma frames are added. (effort: N/A)

### Fonts — Pass
Computed styles confirm Instrument Serif (headings) / JetBrains Mono (mono) only; no stray `IBM Plex Mono` or hard-coded `font-family` found in `src`. One artifact: Home's `h1` lookup returned `null` — not a font bug, see A11Y-01 (no `<h1>` exists on Home at all).

## 2. Responsive matrix (G)

Every page × every width (320/375/768/1024/1280/1440) was measured for `scrollWidth > innerWidth`, not sampled. ✅ = no horizontal scroll.

| Page | 320 | 375 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|
| `/`, `/projects`, both project details, 404 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/profile`, `/admin/messages`, `/admin/settings` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/skills` | ❌ 418/320 | ❌ 418/375 | ✅ | ✅ | ✅ | ✅ |
| `/admin/sections` | ❌ 370/320 | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin/banner` | ❌ 382/320 | ❌ 382/375 | ✅ | ✅ | ✅ | ✅ |
| `/admin/media` | ❌ 382/320 | ❌ 382/375 | ✅ | ✅ | ✅ | ✅ |

Raw data: `audit/responsive-scan-results.json`.

### RESP-01 — Admin segmented filter overflows viewport below 768px (Skills, confirmed root cause)
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `src/components/admin/SegmentedFilter.jsx:17` (`flex items-center gap-0.5`, no `flex-wrap`/scroll), used from `src/app/admin/(dashboard)/skills/page.js:65-76`
- **Evidence:** Screenshot `admin_admin_skills_375.png` shows the ALL/DATABASE/FRAMEWORK/LANGUAGE/RUNTIME/STYLING pill row clipped at the edge. Parent row has `flex flex-wrap` and does wrap around the component as a unit, but the component's own children never wrap, so its intrinsic content width forces page overflow.
- **Expected vs actual:** Filter pills should stay within viewport width or scroll internally; instead they force page-level horizontal scroll.
- **Impact:** Skills admin page scrolls horizontally on any phone ≤375px; filter tabs partly unusable.
- **Recommended fix:** Add `overflow-x-auto` (with scroll-snap/padding) to `SegmentedFilter`'s root div, or let pills `flex-wrap` with smaller `gap`/`px`. (effort: S)

### RESP-02 — `/admin/sections` filter overflows at 320px only
- **Severity:** P3
- **Confidence:** Confirmed
- **Location:** Same component family as RESP-01
- **Evidence:** scrollWidth 370 vs innerWidth 320 at 320px only; clean at 375px+.
- **Expected vs actual:** Same as RESP-01, narrower range.
- **Impact:** Page scrolls horizontally only at the smallest supported width (320px).
- **Recommended fix:** Same as RESP-01. (effort: S)

### RESP-03 — `/admin/banner` (and likely `/admin/media`) panel uses hard-coded `w-[344px]` with no responsive fallback
- **Severity:** P2
- **Confidence:** Confirmed for Banner; Suspected (same root cause) for Media
- **Location:** `src/components/admin/BannerManager.jsx:318` — `w-[344px]` with no `lg:`/`sm:` variant, unlike the sibling panels in `SkillsManager.jsx:400` and `SectionsManager.jsx:194` which correctly use `w-full ... lg:w-[344px]`.
- **Evidence:** scrollWidth 382 vs innerWidth 320/375 on both Banner and Media screenshots — consistent with the 344px fixed width plus padding; Media's source wasn't independently traced (Suspected, not confirmed) but shows byte-identical overflow numbers.
- **Expected vs actual:** Panel should collapse to full width below `lg`, matching sibling admin panels; instead stays fixed at 344px and forces overflow.
- **Impact:** Horizontal scroll on Banner/Media admin screens below ~390px.
- **Recommended fix:** Change `w-[344px]` → `w-full flex-col ... lg:w-[344px]` in `BannerManager.jsx:318`; check/apply same fix wherever Media's panel is defined. (effort: S)

### Touch targets / drawers / bottom sheets — Not fully verified
Off-canvas drawer, sticky save bar, and bottom-sheet behaviors were not interactively exercised — only screenshotted. Theme-toggle hit area computed from markup (`before:-inset-[14px]` + `size-4` = 44×44px) — Suspected pass, not live-measured. Mobile card layouts for Projects/Skills/Messages confirmed present via screenshots; `MoveButtons` visible in mobile cards but not click-tested.

## 3. Accessibility matrix (H)

| Page/area | Result |
|---|---|
| `/` heading structure | ❌ **A11Y-01**: no `<h1>` (Confirmed) |
| `/projects`, `/projects/[slug]`, `/admin/login`, all admin pages | ✅ exactly one `<h1>` each (Confirmed via curl) |
| `--text-muted` contrast, dark theme | ✅ 4.82–5.64:1 vs all 4 surfaces (Confirmed, computed) |
| `--text-muted` contrast, light theme | ✅ 5.15–6.38:1 vs all 4 surfaces (Confirmed, computed) |
| Alt text / icon-button labels (Home, Projects, one detail page) | ✅ 0 missing (Confirmed via DOM query) |
| `prefers-reduced-motion` global + banner GIF | ✅ both implemented in code (Confirmed via source); GIF swap not visually demonstrable — no banner uploaded in seed data |
| Focus ring — shared `Button` component | ✅ built in (Confirmed) |
| Focus ring — raw `<button>`s outside `Button` | ⚠️ **A11Y-02**: 14 components lack an explicit ring (Confirmed); likely still shows browser default (no global `outline:none` reset found) |
| Keyboard reorder (`MoveButtons`) | ✅ real buttons w/ `onClick`+`aria-label`, Tab/Enter-operable (Confirmed); shares A11Y-02's ring inconsistency |
| Modal/lightbox/dialog focus-trap, toast keyboard reachability | **Not verified** — no interactive walkthrough performed |

### A11Y-01 — Home page has no `<h1>`
- **Severity:** P2
- **Confidence:** Confirmed
- **Location:** `src/components/public/ProfileIdentity.jsx:42` — `<p className="font-serif text-[38px] ...">{profile?.name ?? "Your Name"}</p>`
- **Evidence:** `grep -o '<h[1-6][^>]*>'` on live Home HTML returns zero matches; same grep on `/projects`, `/projects/workspace`, `/admin/login` each returns exactly one `<h1>` — confirms Home is the outlier, not a grep artifact.
- **Expected vs actual:** The visually-heading-styled name element should be marked up as `<h1>`; it's a `<p>` instead.
- **Impact:** Screen-reader users navigating by heading level never hit a page title on the most-visited page; visually it looks like a heading (same serif/size treatment) but isn't marked up as one.
- **Recommended fix:** Change the `<p>` at `ProfileIdentity.jsx:42` to `<h1>` (keep existing classes). (effort: S)

### A11Y-02 — 14 components use raw `<button>` without the design system's focus-visible ring
- **Severity:** P3
- **Confidence:** Confirmed (static); visual outcome Suspected
- **Location:** `BannerManager.jsx`, `DateRangeSelector.jsx`, `Dropzone.jsx`, `MediaCardActions.jsx`, `MediaPickerDialog.jsx`, `MessageDetail.jsx`, `MessagesTable.jsx`, `MoveButtons.jsx`, `ProjectsTable.jsx`, `Topbar.jsx`, `LetsTalkTrigger.jsx`, `MessageMeTrigger.jsx`, `NotFoundView.jsx`, `ProjectCard.jsx`
- **Evidence:** `Button.jsx:2` has `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`; none of these 14 files apply it to their own raw `<button>`s; no global `outline:none` reset exists, so the browser default ring most likely still shows (functional, just inconsistent).
- **Expected vs actual:** Every interactive element should share the design system's focus-visible treatment; 14 raw buttons fall back to the browser default instead.
- **Impact:** Low — keyboard operability intact, but visual focus indicator is inconsistent with the rest of the product, and default rings aren't guaranteed to contrast well against custom surface colors.
- **Recommended fix:** Add the same focus-visible class string to each raw `<button>`, prioritizing `MoveButtons.jsx` (keyboard-critical reorder control). (effort: M — 14 small edits)

## Pass list
- Font tokens used consistently; no stray fonts/hard-coded `font-family`.
- `--text-muted` passes AA in both themes against every surface (computed from actual hex values).
- Home/Projects/Project-details/Contact structurally match Figma.
- Zero horizontal-scroll failures on the entire public site, all 6 widths.
- 11 of 14 scanned admin pages clean at all widths.
- Heading hierarchy correct everywhere except Home.
- `prefers-reduced-motion` correctly implemented (code-verified) both globally and for the banner GIF.
- No missing alt text/unlabeled icon buttons found on sampled pages.

## Area scores
- **F (Design fidelity): 8/10** — close tracking to Figma; every observed difference traced to empty seed data or a documented pre-existing scope gap, not a code defect. Docked for incomplete frame-by-frame pixel diffing (time-boxed).
- **G (Responsive): 7/10** — public site flawless; 4/14 admin pages have confirmed, narrowly-scoped horizontal-scroll bugs with specific one-line-class fixes. Docked for unfinished interactive drawer/touch-target testing.
- **H (Accessibility): 6/10** — one confirmed meaningful defect (missing Home `<h1>`), one confirmed low-severity consistency gap (focus rings), strong verified fundamentals elsewhere (contrast, reduced-motion, alt text). Docked heavily for no axe/Lighthouse run and no interactive keyboard walkthrough of modal/lightbox/dialog focus-trapping.
