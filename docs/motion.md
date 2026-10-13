# Motion Design — Portfolio "Field Notes"

> Companion to `docs/design.md` §8, §16, §21. This file is the single source of truth for *what* animates, *why*, and *how* — nothing here should be read as an invitation to add more; the default for every element is **do not animate**.

## Skills note

`audit-suite:*` and `hzblj-skills:*` are not installed in this environment. This plan uses the `gsap-*` skills that are installed (`gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-performance`, `gsap-timeline`) plus standard motion-design judgment (duration/easing scales, reduced-motion handling, feedback-vs-decoration triage) to cover the same ground the missing skills would have.

## 0. Baseline audit (what already exists)

Before planning new motion, here's what's already shipped, found by reading every component:

| Already built | Technique | Notes |
|---|---|---|
| Theme toggle circular wipe | WAAPI (`document.startViewTransition` + `animate()`) | `src/components/ui/ThemeToggle.jsx`. **Gap found:** doesn't check `prefers-reduced-motion`, only feature support. Fixed below. |
| Tagline slider (profile) | CSS transition classes | `src/components/ui/AnimatedTextSlider.jsx`. Already covered by the global reduced-motion CSS override. |
| Side index scroll-progress path | CSS `transition-[stroke-dashoffset]` + a `window.scroll` listener | `src/components/public/SideIndex.jsx`. Listener is `passive: true` already; see §7 for the scrub proposal. |
| Toast enter | CSS `@keyframes toast-in` (slide 8px + fade, 180ms) | `src/styles/globals.css`, matches design.md §21 exactly. |
| Banner GIF reduced-motion fallback | `matchMedia` + conditional render | `src/components/public/BannerMedia.jsx`. Correct, no changes needed. |
| Home section reveal (fade+slide once) | **GSAP** `useGSAP` + `ScrollTrigger` | `src/components/ui/ScrollReveal.jsx`. Re-evaluated below — recommend replacing with CSS/IntersectionObserver (§6). |
| Global reduced-motion safety net | CSS `@media (prefers-reduced-motion: reduce)` collapses all `animation`/`transition` durations to `0.01ms` | `src/styles/globals.css`. Covers every CSS-driven animation automatically; does **not** cover WAAPI/GSAP-driven motion (those need their own check). |
| Button / Toggle hover-color | `transition-colors` / `transition-transform` | Already correct. |

**Gap found:** 24 components have `hover:`/`focus-visible:` color or border changes with **no transition utility at all** — they snap instantly (`Nav.jsx`, `ProjectCard.jsx`, `Dialog.jsx`, `Input.jsx`, `Textarea.jsx`, most of the admin panel). This is the single highest-value, lowest-risk fix available: design.md §8 already specifies "150–200ms ease-out" for exactly this.

**Gap found:** Neither `ContactModal` nor `Lightbox` (both built on `src/components/ui/Dialog.jsx`) have any enter/exit animation, despite design.md §16 explicitly specifying "modal fades and scales 0.98 → 1 over 180ms."

**Gap found:** The orbit dot (design.md §5, §8 — "6×6 accent dot... slow circular drift or pulse") was never implemented.

## 1. Principles

1. **Quiet by default.** Most elements stay still. Motion is reserved for feedback, state changes, orientation, and exactly three signature touches — never decoration.
2. **Drafting-table precision.** Motion should feel measured and intentional — short, linear-ish eases, small distances (4–8px), nothing bouncy or elastic.
3. **Transform and opacity only.** No animating layout properties (width, height, top/left, margin) — ever. Keeps everything on the compositor, off the main thread.
4. **One accent, used sparingly in motion too.** Colour transitions move *toward or away from* `--accent`; motion never introduces a new colour.
5. **Everything is interruptible and reversible.** No animation blocks input; hovering off mid-transition reverses cleanly; nothing forces the user to wait.
6. **First paint is real content.** Nothing is hidden-until-JS. Entrance animations reveal already-rendered content; they never gate it.
7. **Reduced motion means almost no motion**, not "the same animation, faster." Feedback (hover/press/focus/toasts) keeps a simple fade; ambient and signature motion disappears entirely.

## 2. Tokens

Add to `src/styles/globals.css` `:root` alongside the existing design tokens:

```css
/* Motion (docs/motion.md) */
--motion-instant: 100ms;
--motion-fast: 150ms;
--motion-base: 200ms;
--motion-slow: 300ms;
--motion-max: 400ms; /* nothing exceeds this except the ambient orbit dot, which is explicitly out of scope for "max duration" since it's a continuous idle loop, not a response to anything */

--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);   /* decelerate — entrances, reveals */
--ease-exit: cubic-bezier(0.4, 0, 1, 1);        /* accelerate — exits, dismissals */
--ease-move: cubic-bezier(0.65, 0, 0.35, 1);    /* ease-in-out — reorders, toggles, the theme-wipe */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);     /* standard hover/focus ease-out, matches design.md §8 */

--stagger-step: 30ms;
--stagger-max-items: 6; /* beyond the 6th item, no added delay — avoids a 2s wait for a 20-item list */

--motion-distance-sm: 4px;
--motion-distance-md: 8px; /* matches the existing toast's 8px; the ceiling for any translate — no large slides anywhere */
```

**Reduced-motion policy:** the existing blanket CSS override (`globals.css` — collapses all `transition`/`animation` durations to `0.01ms`) stays and continues to cover every CSS-driven effect automatically. It does **not** reach WAAPI (`element.animate()`) or GSAP-driven code, so those get an explicit `prefers-reduced-motion` check via the new `useReducedMotion()` hook (§6) or, for one-off cases, `window.matchMedia(...).matches` read once at the point the effect would fire.

## 3. Element inventory

Trigger key: **load** = on mount/first paint · **scroll** = first time scrolled into view (IntersectionObserver) · **hover** · **press** = `:active`/mousedown · **focus** · **state** = data/prop change · **route** = navigation.

### Public — global / shell

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| Nav links (Home/Projects) | all public | hover | color muted→primary | fast (150ms) | ease-out | — | yes | fade only (covered by global override) | CSS | **must** |
| Theme toggle | all public | press | circular clip-path wipe | 400ms | ease-move | — | no (debounced via `isTransitioningRef`, already built) | instant flip, no wipe | WAAPI (existing) | **must** (fix: add reduced-motion check) |
| Bottom viewport blur | all public | load | already static/always-on | — | — | — | n/a | n/a (no motion, pure backdrop-filter) | CSS (existing) | n/a |
| Section reveal (banner→let's-talk) | home | scroll (once) | opacity 0→1, translateY 8px→0 | base (200ms) | ease-enter | — | n/a (once) | none — shows final state immediately | **CSS + IntersectionObserver** (replacing GSAP, see §6) | **must** |
| Focus ring | every interactive element | focus | outline appears | instant (100ms) | ease-out | — | yes | unchanged (focus rings are not "motion") | CSS | must (already correct via `focus-visible:outline`) |

### Public — banner / identity

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| **Orbit dot** (signature #1) | home banner | load, continuous | translate along a small elliptical path (~±5px), subtle opacity pulse 0.7↔1 | 7s loop | linear (continuous drift reads as mechanical/precise, not springy) | — | n/a (ambient) | **removed entirely** (static dot, no animation) | CSS `@keyframes` on `transform` only | **must** |
| Banner GIF | home | load | — | — | — | — | — | already paused under reduced motion (existing, correct) | existing | n/a |
| Tagline slider | home | continuous | existing cross-fade/slide | existing | existing | — | existing | already covered by global override | existing | n/a (no change) |
| Avatar | home | hover | none | — | — | — | — | — | — | **skip** (decorative only, no action lives here) |

### Public — content sections

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| Contact row cells | home | hover | bg → `--surface-2`-equivalent | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| External link arrow icons | home, project detail | hover | none needed beyond parent color transition | — | — | — | — | — | — | skip |
| **Heatmap fill-in** (signature #2) | home | scroll (once) | one `mask-image` wipe sweeps left→right over the whole grid, revealing the already-rendered cells (not per-cell stagger — 365 cells individually staggered would be both slow to finish and a stagger-cap violation) | 700ms | ease-enter | n/a (single composited wipe, not per-element) | n/a (once) | shows the full grid immediately, no wipe | **CSS** (`mask-image` + IntersectionObserver trigger) | **must** |
| Project cards | /, /projects | hover | border → `--border-default`-to-highlight (per design.md §8) | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| Project card action icons (GitHub/live) | /, /projects | hover | bg/border shift | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| "View details" button | /, /projects | hover | border → accent/50%, arrow icon translates 2px right (per design.md §8 — currently only the border is spec'd/missing entirely) | fast (150ms) | ease-out | — | yes | fade only, no arrow movement | CSS | **must** |
| Skill chips | home, project detail | hover | border solid, text → secondary | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| Side index entries | home | state (active section changes) | indicator opacity + label color | fast (150ms) | ease-out | — | yes (already is) | fade only | CSS (existing) | **must** (just needs the transition it's missing — currently the *label* transitions via existing CSS but verify) |
| Let's talk CTA | home | hover | bg white, arrow nudges right | fast (150ms) | ease-out | — | yes | fade only, no nudge | CSS | **must** |

### Public — /projects and project detail

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| Filter pills (tech/status) | /projects | hover, press | border/bg/text shift | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| Filter pills | /projects | state (selection changes) | active pill fill-in | fast (150ms) | ease-out | — | yes | fade only | CSS | **nice** |
| Project grid (filtered result) | /projects | state (filter change) | **no re-entrance animation** — cards just update; re-animating every filter click would retrigger the "reveal" constantly and read as nervous, not quiet | — | — | — | — | — | — | **explicit skip** |
| Cover image | project detail | load | none (hero content, must be visible immediately — no choreographed intro) | — | — | — | — | — | — | skip |
| Screenshot grid tiles | project detail | hover | expand-icon opacity/scale-in | fast (150ms) | ease-out | — | yes | fade only | CSS | nice |
| **Lightbox** | project detail | open/close | fade + scale 0.98→1 (matches ContactModal — same `Dialog` primitive, see §6) | base (200ms) in / fast (150ms) out | ease-enter / ease-exit | — | yes | fade only, no scale | CSS | **must** |
| Lightbox image swap (prev/next) | project detail | press | crossfade | fast (150ms) | ease-out | — | yes | instant swap | CSS | nice |
| Pager cards (prev/next project) | project detail | hover | border/text shift | fast (150ms) | ease-out | — | yes | fade only | CSS | must |

### Public — contact modal, 404, maintenance

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| **Contact modal** | all (triggered) | open/close | overlay fade + panel fade/scale 0.98→1 (design.md §16, currently missing entirely) | base (200ms) in / fast (150ms) out | ease-enter / ease-exit | — | yes | fade only, no scale | CSS on `Dialog` primitive | **must** |
| Modal → sent-state swap | contact modal | state | crossfade content | fast (150ms) | ease-out | — | yes | instant swap | CSS | nice |
| Field focus | contact modal | focus | border → accent | instant (100ms) | ease-out | — | yes | unchanged | CSS | must |
| Field error | contact modal | state | error text fades in (never flashes) | fast (150ms) | ease-out | — | yes | fade only | CSS | nice |
| 404 / maintenance buttons | 404, maintenance | hover | existing button/CTA treatment reused | fast (150ms) | ease-out | — | yes | fade only | CSS | must (covered by the global button-hover sweep) |

### Admin

| Element | Page | Trigger | What changes | Duration | Easing | Stagger | Interruptible | Reduced-motion | Technique | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| Sidebar nav items | all admin | hover/active | bg/text shift | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| Mobile drawer (sidebar) | <1024px | open/close | slide in from left + overlay fade | base (200ms) in / fast (150ms) out | ease-enter / ease-exit | — | yes | fade only, no slide | CSS (matches existing `Dialog`-style focus trap) | **must** |
| Admin page content on route change | all admin | route | **no transition** — instant swap; animating every admin nav click adds latency-feel to a tool used dozens of times a day | — | — | — | — | — | — | **explicit skip** |
| Table row hover | all list pages | hover | bg → `--surface-2` | fast (150ms) | ease-out | — | yes | fade only | CSS | **must** |
| Drag-reorder row (lift) | Projects/Skills/Sections tables | press (drag start) | opacity 0.6, subtle shadow — a simple lift, not a bouncy drag | instant (100ms) | ease-out | — | yes (drop reverses it) | opacity/shadow still fine (it's feedback, not ambient) | CSS (`[draggable]` + existing `dragId` state) | **must** |
| Drag-reorder row (drop) | same tables | release | settle into new position | fast (150ms) | ease-move | — | — | instant | CSS | nice |
| Up/down reorder buttons | same tables | press | row position settles | fast (150ms) | ease-move | — | yes | instant | CSS | nice |
| Toggle switch | admin forms | press | existing `transition-colors`/`transition-transform`, already correct | existing | existing | — | — | — | existing | n/a |
| Segmented control | admin filters | press | active segment bg fades in | fast (150ms) | ease-out | — | yes | fade only | CSS | must |
| Dropzone upload progress | admin uploads | state | existing `transition-[width]`, already correct | existing | existing | — | — | — | existing | n/a |
| Media picker / confirmation dialogs | admin | open/close | same modal fade+scale as ContactModal (shared `Dialog` primitive) | base/fast | ease-enter/exit | — | yes | fade only | CSS | **must** |
| Bottom sheet (mobile dialogs) | admin <768px | open/close | slide up + fade (sheet variant of the same Dialog) | base (200ms) in | ease-enter | — | yes | fade only, no slide | CSS | **must** |
| Toasts | all admin + public | state | existing `toast-in` keyframe, already correct | existing | existing | — | — | — | existing | n/a |
| List/table skeletons | admin loading states | load | opacity pulse 1↔0.5 | 1.5s loop | ease | — | n/a | **off entirely** (design.md §15.7 already specifies this) | CSS | must (verify skeletons exist per §15.7 and carry the reduced-motion-off rule) |
| KPI numbers (dashboard) | dashboard | state (data load/poll) | **no count-up** — value just renders | — | — | — | — | — | — | **explicit skip** (see §5) |
| Views-over-time line chart | dashboard | load (once) | the stroke itself can draw in via `stroke-dasharray`/`dashoffset` on first mount only, not on every data refresh | 400ms | ease-enter | — | n/a (once per mount) | instant (full line) | CSS | nice |

## 4. Signature moments (3)

1. **Orbit dot (banner).** The existing `6×6` accent dot design.md already calls for, now actually built: a continuous, slow, linear drift along a small elliptical path (`transform: translate(...)`, two axes slightly out of phase so it doesn't look like a simple circle), with a gentle opacity breathe. Pure CSS `@keyframes`, GPU-only (`transform`/`opacity`), no JS, one `<span>`. Reads as the "pencil still moving on the drafting table" — the single piece of ambient life on an otherwise still page. Removed entirely (not slowed) under reduced motion.

2. **Heatmap fill-in.** The first time the Activity section scrolls into view, a single `mask-image` sweep reveals the already-rendered contribution grid left-to-right over 700ms, like a plotter drawing it. One IntersectionObserver trigger, one CSS class toggle, zero per-cell JS — cheap regardless of how many weeks are in the calendar. Never replays. Under reduced motion the grid is simply visible immediately.

3. **Section reveal on first scroll.** Each home-page section fades and rises 8px into place the first time it's scrolled into view (already shipped this session, now reimplemented on plain CSS + IntersectionObserver instead of GSAP — see §6). This is the site's "explains arrival" motion: every section's entrance is identical and quiet, so it reads as one coherent system rather than a sequence of separate effects.

## 5. Not animating (and why)

| Element | Reason |
|---|---|
| Body/paragraph text | Text should never move once legible; reading is the point. |
| Nav bar on scroll (hide/show, shrink) | Adds a layout-shift-adjacent effect on every scroll tick; the nav is small and unobtrusive already. |
| Parallax (banner, any section) | Explicitly decorative, costs scroll-linked main-thread work, fights the "flat drafting table" aesthetic. |
| Custom cursor / cursor-follow effects | Pure decoration, no information conveyed, accessibility risk (hides the real cursor for some users). |
| Multi-step choreographed page-load intro | Would delay real content being visible/interactive — violates "first paint is real content." |
| Admin page-to-page transitions | An admin tool used many times a day; instant navigation beats a polished-feeling fade. |
| Admin table re-sort/re-filter re-entrance | Re-triggering a reveal on every filter click reads as nervous, not quiet; values should just update. |
| Dashboard KPI count-up | Numbers refresh frequently (polling, date-range changes); a count-up animation on every refresh is noisy, not a "first impression" moment worth spending the budget on. |
| Confetti / celebratory effects on save | Doesn't fit the quiet/editorial voice; toasts already cover "did it work." |
| Infinite background loops beyond the orbit dot | One ambient element is the budget; a second competes with it. |
| Drag physics (bounce, inertia, spring-overshoot) | A simple lift/settle is more "precise instrument," less "toy." |
| Table skeleton shimmer (moving gradient) | design.md §15.7 already specifies a plain opacity pulse, not a shimmer sweep — keep it that way; shimmer reads busier for no extra information. |

## 6. Rules

- First paint shows real content; nothing is hidden-until-JS, nothing delays interactivity.
- No animation blocks interaction; every transition is interruptible (CSS transitions/WAAPI are inherently interruptible by re-triggering; none of the above uses a non-interruptible timeline).
- Section reveals skip entirely on first load for content already in the initial viewport (same as today: if a section is already visible at `DOMContentLoaded`, its IntersectionObserver fires immediately rather than waiting for a scroll event — no artificial delay).
- Never `transition: all`; every transition names its properties explicitly (already the house style — `transition-colors`, `transition-transform`, `transition-[width]`).
- `will-change` only applied for the duration of an active animation (the orbit dot and heatmap wipe are short-lived/looping enough not to need it at all; drag-lift sets it only while `dragId` is set).
- Nothing exceeds 400ms except the orbit dot's continuous idle loop (which isn't a "response," so the ceiling doesn't apply the same way — flagged explicitly rather than quietly treated as an exception).

### GSAP decision (self-review finding)

**Recommendation: drop the GSAP-based `ScrollReveal` and replace it with a ~30-line CSS + IntersectionObserver utility, keeping the same `<ScrollReveal>` wrapper API so `page.js` doesn't change.** None of the "must" or "nice" items in this plan — including both new signature moments — need timeline sequencing or scroll-scrubbing that CSS/WAAPI can't do. `gsap` + `@gsap/react` together are real weight on the public bundle (this project's performance budget explicitly caps "a few KB" for the public home); keeping them in for a one-shot fade+slide-up isn't justified once a trivial CSS/IO version exists.
The one place GSAP *could* still be justified is migrating `SideIndex`'s continuous scroll listener to `ScrollTrigger`'s `scrub` (§7, listed as **nice**, not must) — if that's the only surviving use, it alone probably doesn't justify keeping the dependency either; I'd rather leave the existing passive listener as-is (it's cheap, already `passive: true`) than import GSAP just for that. **This removes `gsap`/`@gsap/react` from `package.json` entirely** if approved.

## 7. Accessibility

- `prefers-reduced-motion: reduce` behavior per the table above; the global CSS override continues to handle every CSS-driven case automatically.
- The two places that bypass CSS (theme toggle's WAAPI wipe, and nothing else once GSAP is removed) get an explicit check via a new `useReducedMotion()` hook (`src/lib/hooks/useReducedMotion.js`) — falls back to an instant theme flip.
- Banner GIF: already correctly paused/placeholder'd under reduced motion (no change).
- Focus is never hidden or obscured by motion — modals trap focus on open regardless of animation state; the focus ring itself never animates (appears instantly, per existing `focus-visible:outline`).
- No flashing content anywhere (nothing strobes or flashes faster than 3Hz) — not applicable to anything in this plan, confirmed by inspection.

## 8. Performance budget

- 60fps target: every animation in this plan is `transform`/`opacity` (or `mask-image`, which is compositor-friendly) only — no layout or paint-triggering properties.
- No *new* main-thread scroll listeners: the heatmap wipe and section reveals use IntersectionObserver (fires off the main thread's scroll path); `SideIndex`'s existing listener is left as-is (already `passive: true`), not expanded.
- Public home JS budget: this plan is a net **decrease** if the GSAP removal (§6) is approved — the heatmap wipe, orbit dot, and section-reveal replacement are pure CSS plus one small shared IntersectionObserver hook (under 1KB).
- Lighthouse: expect no regression; removing GSAP should help the performance score slightly, not hurt it.

## 9. Implementation plan

**Order of work:**

1. **Tokens + shared utilities** (`src/styles/globals.css` motion tokens; `src/lib/hooks/useReducedMotion.js`; a small `src/components/ui/Reveal.jsx` — CSS/IntersectionObserver replacement for the current GSAP `ScrollReveal`, same external API).
2. **Global hover/focus transition sweep** — add `transition-colors duration-150` (or the token equivalent) to the ~24 components identified in §0 that currently snap. This is mechanical and low-risk; doing it first means every other change below inherits it rather than needing its own one-off transition.
3. **Must items**: modal fade+scale on `Dialog.jsx` (covers `ContactModal`, `Lightbox`, media picker, bottom sheets in one place), theme-toggle reduced-motion fix, "View details" arrow nudge, mobile drawer slide, drag-reorder lift feedback.
4. **Signature moments**: orbit dot, heatmap wipe, section-reveal migration to `Reveal.jsx`.
5. **Nice items**, only if the performance/Lighthouse checks in Phase 2 step 3 still pass comfortably: filter-pill active fill, lightbox crossfade, pager/skeleton polish, chart draw-in.
6. Remove `gsap`/`@gsap/react` from `package.json` once nothing references them (final step, so there's no window where the app half-depends on a half-removed library).

**Files touched (expected):**
- `src/styles/globals.css` (tokens, orbit-dot keyframes, heatmap-wipe keyframes)
- `src/lib/hooks/useReducedMotion.js` (new)
- `src/components/ui/Reveal.jsx` (new, replaces `src/components/ui/ScrollReveal.jsx`)
- `src/app/(public)/page.js` (swap the import/wrapper name only)
- `src/components/ui/Dialog.jsx` (modal fade+scale, shared by every dialog/sheet)
- `src/components/ui/ThemeToggle.jsx` (reduced-motion check)
- `src/components/public/Nav.jsx`, `ProjectCard.jsx`, `ContactLinksRow.jsx`, `LetsTalkTrigger.jsx`, `SideIndex.jsx` and the rest of the §0 snap-list (transition utility additions only)
- `src/components/public/BannerSection.jsx` or `BannerMedia.jsx` (orbit dot element)
- `src/components/public/GithubHeatmap.jsx` (wipe wrapper)
- `src/components/admin/Sidebar.jsx` (drawer), `ProjectsTable.jsx`/`SkillsManager.jsx`/`SectionsManager.jsx` (drag lift), `SegmentedFilter.jsx`, admin table/list components (hover sweep)
- `package.json`/`package-lock.json` (remove gsap deps, final step)
