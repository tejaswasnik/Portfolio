# Portfolio Micro-Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small, consistent layer of micro-animations to tezus.me (Home + Projects) that makes it feel crafted, award-site quality, without becoming "an animated website".

**Architecture:** One motion-token source (TS + CSS variables) drives everything. Hover/press states are pure CSS (cheap, no JS). Entrance, in-view, layout and number animations use `motion` (Framer Motion's current package, `motion/react`) through four small reusable primitives (`Reveal`, `TextReveal`, `RoleRotator`, `CountUp`) plus one `Magnetic` wrapper. A global `<MotionConfig reducedMotion="user">` makes every Motion animation respect the OS setting.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, `motion` (v11+/v12, import from `motion/react`), Vitest + React Testing Library (logic), Playwright (interaction + reduced-motion checks).

**Spec:** Inline — see "Motion Spec" below (from Tejas's request: *minimal, aesthetic, micro, Awwwards-grade*).

---

## Motion Spec

**Design principles** (the filter every animation must pass):

1. **Purpose or nothing.** Each animation either confirms an action (press, hover), orients (nav pill, filter reflow), or reveals content once (hero, sections). No looping decoration except the two listed below.
2. **Small distances.** Max translate 8px for reveals, 2–4px for hovers, 6px for magnetic. Scale never below 0.96 or above 1.04.
3. **Fast.** UI feedback ≤ 240ms. Reveals ≤ 500ms. Whole hero sequence finishes within 900ms.
4. **ease-out for things entering, never `linear`, never `ease-in` for UI.**
5. **Blur bridges states.** Entrances go `blur(4px) → 0` with opacity; it reads as "focus pulling" and hides the small translate.
6. **Once.** In-view reveals fire once per page load. The hero plays once per session.
7. **Reduced motion keeps opacity, drops movement.** Never remove all feedback.

**Motion tokens** (exact values):

| Token | Value | Used for |
|---|---|---|
| `--ease-out` / `EASE.out` | `cubic-bezier(0.23, 1, 0.32, 1)` | all entrances, hovers |
| `--ease-in-out` / `EASE.inOut` | `cubic-bezier(0.77, 0, 0.175, 1)` | elements moving on screen (rotator, pill) |
| `--dur-press` / `DUR.press` | `120ms` / `0.12` | `:active` scale |
| `--dur-hover` / `DUR.hover` | `180ms` / `0.18` | color, arrow nudge, lift |
| `--dur-ui` / `DUR.ui` | `240ms` / `0.24` | pills, rotator swap |
| `--dur-reveal` / `DUR.reveal` | `500ms` / `0.5` | in-view and hero reveals |
| `STAGGER` | `0.04` (s) | word/child stagger |
| `SPRING.layout` | `{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }` | `layoutId` pills, grid reflow |
| `SPRING.magnetic` | `{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }` | magnetic CTA |

**Animation inventory** (this is the whole list — anything not here is out of scope):

| # | Where | What | Inspiration |
|---|---|---|---|
| A1 | All buttons/links | `:active` → `scale(0.97)`, 120ms | Emil Kowalski / Vercel |
| A2 | "Let's Talk →", "View details", Resume | arrow nudges `translateX(3px)` on hover | Linear |
| A3 | Nav links | underline draws from left (`scaleX 0→1`, origin left) on hover | rauno.me |
| A4 | Social links | `translateY(-1px)` + color to foreground | paco.me |
| A5 | Hero | banner fades in; avatar `opacity 0, scale .96, blur 4px → 1, 1, 0`; name reveals word-by-word from a mask (`y: 100% → 0`) | Awwwards minimal portfolios |
| A6 | Hero roles | the 5 role lines become one rotating line: vertical slide + blur swap every 2.6s, container width animates | Awwwards / Framer templates |
| A7 | Nav (Home/Projects) | active-route pill slides between items via `layoutId` | Vercel dashboard |
| A8 | Sections (About, Projects, Activity, Stack, Let's talk) | heading + body fade up 8px with blur, once, at 25% in view | — |
| A9 | Project cards | image `scale(1.03)` inside `overflow:hidden`, border brightens; "Ongoing" badge gets a soft pulsing dot (only looping animation #1) | Linear changelog cards |
| A10 | Activity graph | cells fade in as a left-to-right wave (column-staggered, 8ms/column) on first view; "393" counts up | GitHub-skyline-style |
| A11 | Projects page filters | active tag/status pill slides via `layoutId`; card grid reflows with `layout` + `AnimatePresence mode="popLayout"` | Awwwards filterable grids |
| A12 | "Let's Talk →" CTA (footer) | magnetic pull ≤ 6px toward cursor, `pointer: fine` only | Awwwards magnetic buttons |
| A13 *(stretch)* | Card → project detail | View Transition: card image morphs into detail hero image | Next.js view transitions |

Looping animation #2 is the role rotator (A6); it pauses when the tab is hidden.

**Explicitly out of scope:** custom cursor, smooth-scroll hijacking (Lenis), page-load preloader, parallax, marquee, WebGL, sound.

## Global Constraints

- Package: `motion` (import from `"motion/react"`), not `framer-motion`. No GSAP for this work.
- Every value in "Motion tokens" is defined once in `src/lib/motion/tokens.ts` and `src/styles/motion.css`; no inline magic numbers in components.
- Animate only `transform`, `opacity`, `filter`, `clip-path`. Never `width/height/top/left` — except A6's container width, which uses Motion `layout` (transform-based).
- Never `transition: all`. List properties.
- Hover effects inside `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion: reduce` → no translate/scale/blur; opacity fades of ≤ 150ms allowed; rotator shows the first role statically; count-up shows the final number.
- Server-rendered HTML must be readable with JS disabled: only the hero (A5) may start at `opacity: 0` in SSR output; in-view reveals (A8) must not hide content before hydration (see Task 5).
- No layout shift: Lighthouse CLS ≤ 0.05 on `/` after all tasks.
- Paths below assume `src/app` + `src/components`. **Before Task 1**, map each "Files" entry to the real file in the repo (`ls src`, grep for "Activity", "Stack", "Let's talk") and use real paths throughout.

## Review Focus

1. **Reduced motion** — a visitor with OS reduced-motion on sees every piece of content immediately, no movement, no rotator cycling. (Tests in Tasks 1, 3, 5, 7.)
2. **Touch devices** — no sticky hover states after tap, no magnetic effect on phones. (Tests in Tasks 2, 9.)
3. **Slow JS / hydration** — content below the hero is visible before Motion hydrates; no hydration mismatch warnings from the rotator or count-up. (Tests in Tasks 3, 5, 7.)
4. **Background tab** — the role rotator doesn't queue up swaps while hidden and jump on return. (Test in Task 3.)
5. **Rapid filter clicks** on `/projects` — clicking 4 tags quickly never leaves ghost cards or overlapping cards. (Test in Task 8.)

---

### Task 1: Motion foundation (tokens, CSS vars, provider, test harness)

**Files:**
- Create: `src/lib/motion/tokens.ts`
- Create: `src/styles/motion.css` (import from `src/app/globals.css`)
- Create: `src/components/providers/MotionProvider.tsx`
- Modify: `src/app/layout.tsx` (wrap `{children}`)
- Create: `vitest.config.ts`, `src/test/setup.ts` (only if Vitest absent)
- Create: `playwright.config.ts` (only if Playwright absent)
- Test: `src/lib/motion/tokens.test.ts`, `e2e/motion.spec.ts`

**Interfaces:**
- Produces: `EASE: { out: [0.23,1,0.32,1]; inOut: [0.77,0,0.175,1] }`, `DUR: { press: 0.12; hover: 0.18; ui: 0.24; reveal: 0.5 }`, `STAGGER = 0.04`, `SPRING: { layout; magnetic }`, `revealVariants: Variants` (`hidden: {opacity:0, y:8, filter:"blur(4px)"}`, `visible: {opacity:1, y:0, filter:"blur(0px)", transition:{duration:DUR.reveal, ease:EASE.out}}`). CSS custom properties `--ease-out`, `--ease-in-out`, `--dur-press`, `--dur-hover`, `--dur-ui`, `--dur-reveal`. `<MotionProvider>` client component.

- [ ] **Step 1:** `npm i motion` and, if missing, `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react @playwright/test`; `npx playwright install chromium`.
- [ ] **Step 2: Write failing test** `tokens.test.ts`: asserts `EASE.out` deep-equals `[0.23,1,0.32,1]`, `DUR.ui === 0.24`, `revealVariants.hidden.y === 8`.
- [ ] **Step 3:** `npx vitest run src/lib/motion` → FAIL (module not found).
- [ ] **Step 4:** Implement `tokens.ts` and `motion.css` with the token table values. `motion.css` also contains the global `@media (prefers-reduced-motion: reduce)` block that sets `--dur-*` to `0.01ms` except a `.motion-safe-fade` class keeping a 150ms opacity transition.
- [ ] **Step 5:** Implement `MotionProvider` = `"use client"` + `<MotionConfig reducedMotion="user" transition={{ duration: DUR.ui, ease: EASE.out }}>`; wrap body children in `layout.tsx`.
- [ ] **Step 6:** `npx vitest run src/lib/motion` → PASS.
- [ ] **Step 7: Write e2e smoke** `e2e/motion.spec.ts` › `"home renders with reduced motion"`: `test.use({ reducedMotion: "reduce" })`, goto `/`, expect heading "Tejas Wasnik" visible within 300ms and no console errors.
- [ ] **Step 8:** `npx playwright test e2e/motion.spec.ts` → PASS.
- [ ] **Step 9:** Commit `feat(motion): add motion tokens, provider and test harness`.

### Task 2: CSS micro-interactions (A1–A4)

**Files:**
- Modify: `src/styles/motion.css` (add utility classes)
- Modify: nav component (e.g. `src/components/layout/Navbar.tsx`), button/link components, social links, project card "View details", footer CTA
- Test: `e2e/interactions.spec.ts`

**Interfaces:**
- Consumes: CSS vars from Task 1.
- Produces: classes `.press` (A1), `.arrow-nudge` + child `.arrow` (A2), `.link-underline` (A3), `.lift` (A4). Later tasks only add these class names.

- [ ] **Step 1: Write failing test** `interactions.spec.ts`:
  - `"Let's Talk arrow nudges on hover"`: hover the CTA, read `getComputedStyle(arrow).transform` after 250ms, expect matrix with `tx ≈ 3`.
  - `"no hover transform on touch"`: in a `hasTouch: true, isMobile: true` context, tap CTA, expect arrow transform `none`.
- [ ] **Step 2:** `npx playwright test e2e/interactions.spec.ts` → FAIL.
- [ ] **Step 3:** Implement the four classes. `.press:active { transform: scale(.97) }` with `transition: transform var(--dur-press) var(--ease-out)`. Hover rules wrapped in `@media (hover:hover) and (pointer:fine)`. `.link-underline::after` is a 1px bar, `transform: scaleX(0)`, `transform-origin: left`, → `scaleX(1)` on hover; on mouse-out origin flips to `right` so it exits the way it came (the rauno.me detail).
- [ ] **Step 4:** Apply classes: `.press` to every `<button>` and button-styled `<a>`; `.arrow-nudge` to "Let's Talk →", "View details", "Resume", "Message me" (wrap the `→`/icon in `<span class="arrow" aria-hidden>`); `.link-underline` to nav and footer text links; `.lift` to GitHub/LinkedIn/Twitter.
- [ ] **Step 5:** Run → PASS. Manually check keyboard focus still shows a visible ring (don't animate `outline`).
- [ ] **Step 6:** Commit `feat(motion): css press, hover and underline micro-interactions`.

### Task 3: Hero entrance + role rotator (A5, A6)

**Files:**
- Create: `src/components/motion/TextReveal.tsx`
- Create: `src/hooks/useRotatingIndex.ts`
- Create: `src/components/motion/RoleRotator.tsx`
- Modify: hero component (e.g. `src/components/home/Hero.tsx`)
- Test: `src/hooks/useRotatingIndex.test.ts`, `src/components/motion/RoleRotator.test.tsx`, `src/components/motion/TextReveal.test.tsx`

**Interfaces:**
- Consumes: `EASE`, `DUR`, `STAGGER`.
- Produces:
  - `useRotatingIndex(length: number, intervalMs: number, opts?: { paused?: boolean }): number`
  - `<TextReveal text: string; as?: "h1"|"h2"|"span"; delay?: number />` — renders `<as aria-label={text}>` with each word in `<span aria-hidden className="inline-block overflow-hidden"><motion.span …/></span>`.
  - `<RoleRotator roles: string[]; intervalMs?: number = 2600 />`

- [ ] **Step 1: Write failing tests**
  - `useRotatingIndex`: with fake timers, index goes `0 → 1` after `intervalMs`, wraps `length-1 → 0`; when `document.visibilityState = "hidden"` + `visibilitychange` fired, advancing 10× the interval leaves the index unchanged; returns to cycling (one step at a time) after visible again.
  - `RoleRotator`: with `matchMedia('(prefers-reduced-motion: reduce)')` mocked true, renders only `roles[0]` and never changes after 10s. No `aria-live` (cycling text would spam screen readers); assert container has `aria-label={roles.join(", ")}` and inner text is `aria-hidden`.
  - `TextReveal`: `getByRole("heading", { name: "Tejas Wasnik" })` exists; words are `aria-hidden`.
- [ ] **Step 2:** `npx vitest run src/hooks src/components/motion` → FAIL.
- [ ] **Step 3:** Implement `useRotatingIndex` with `setInterval` cleared on `visibilitychange` hidden and re-armed on visible (never `setTimeout` chains that accumulate).
- [ ] **Step 4:** Implement `RoleRotator`: `useReducedMotion()` → static. Otherwise `<motion.span layout>` container (animates width smoothly) containing `<AnimatePresence mode="popLayout" initial={false}>` with a keyed `<motion.span>`: enter `{y:"60%", opacity:0, filter:"blur(4px)"}` → `{y:0, opacity:1, filter:"blur(0)"}`, exit `{y:"-60%", opacity:0, filter:"blur(4px)"}`, `duration: DUR.ui*1.5, ease: EASE.inOut`. First SSR render = `roles[0]` (no hydration mismatch).
- [ ] **Step 5:** Implement `TextReveal`: parent variants `staggerChildren: STAGGER, delayChildren: delay`; child `{y:"100%"} → {y:0}`, `duration: DUR.reveal, ease: EASE.out`.
- [ ] **Step 6:** Wire hero: banner `motion.div` opacity 0→1 (0.6s); avatar `{opacity:0, scale:.96, filter:"blur(4px)"}` → visible at delay 0.1; `<TextReveal text="Tejas Wasnik" as="h1" delay={0.2}/>`; replace the five role lines with `<RoleRotator roles={[...]}/>` at delay 0.45; location + Resume fade at 0.55. Gate with `sessionStorage("hero-played")` → `initial={false}` on repeat visits in the same session (read in `useEffect`; default to playing).
- [ ] **Step 7:** Run unit tests → PASS. Run Task 1 e2e → still PASS. Check browser console: no hydration warnings.
- [ ] **Step 8:** Commit `feat(motion): hero entrance and role rotator`.

### Task 4: Nav active pill (A7)

**Files:**
- Modify: nav component
- Test: `e2e/nav.spec.ts`

**Interfaces:**
- Consumes: `SPRING.layout`.
- Produces: nothing new.

- [ ] **Step 1: Write failing test** `"active pill moves to Projects"`: goto `/`, assert `[data-nav-pill]` bounding box overlaps "Home"; click "Projects"; after 400ms assert it overlaps "Projects"; exactly one `[data-nav-pill]` in DOM.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** In the nav (client component, `usePathname()`), render `<motion.span data-nav-pill layoutId="nav-pill" transition={SPRING.layout} className="absolute inset-0 -z-10 rounded-full bg-…"/>` inside the active link only. Nav must live in the root layout so it persists across routes (otherwise `layoutId` can't animate).
- [ ] **Step 4:** Run → PASS. Commit `feat(motion): sliding nav pill`.

### Task 5: Section reveals (A8)

**Files:**
- Create: `src/components/motion/Reveal.tsx`
- Modify: home sections — About, Projects, Activity, Stack, Let's talk
- Test: `src/components/motion/Reveal.test.tsx`, `e2e/motion.spec.ts` (add case)

**Interfaces:**
- Consumes: `revealVariants`.
- Produces: `<Reveal as?: keyof JSX.IntrinsicElements = "div"; delay?: number; stagger?: boolean; className?: string>` — when `stagger`, direct `<Reveal.Item>` children animate 60ms apart.

- [ ] **Step 1: Write failing tests**
  - unit: under reduced motion, children rendered with no inline `transform`.
  - e2e `"content visible without JS"`: `javaScriptEnabled: false`, goto `/`, expect "About", "Stack", "Let's talk" headings visible (computed opacity `1`).
- [ ] **Step 2:** Run → FAIL (or the no-JS case fails once `Reveal` naively uses `initial="hidden"`).
- [ ] **Step 3:** Implement `Reveal` with `whileInView="visible" viewport={{ once: true, amount: 0.25 }}`. To keep no-JS content visible: render `initial={false}` on the server/first render, then flip to `initial="hidden"` only if the element is **below the fold at mount** (check `getBoundingClientRect().top > innerHeight` in a layout effect). Above-the-fold sections just appear.
- [ ] **Step 4:** Wrap each section: heading + body as `Reveal.Item`s; Stack chips are a single `Reveal` (don't stagger 20 chips — feels slow).
- [ ] **Step 5:** Run → PASS. Commit `feat(motion): one-time section reveals`.

### Task 6: Project card hover + status pulse (A9)

**Files:**
- Modify: project card component (e.g. `src/components/projects/ProjectCard.tsx`), `src/styles/motion.css`
- Test: `e2e/interactions.spec.ts` (add case)

**Interfaces:**
- Produces: classes `.card-media` (image zoom container), `.status-dot--live`.

- [ ] **Step 1: Write failing test** `"card image zooms on hover"`: hover first card, after 400ms image transform scale ≈ 1.03; card still same bounding box (no layout shift).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** CSS: `.card-media{overflow:hidden}` `img{transition: transform 400ms var(--ease-out)}`, hover → `scale(1.03)`; card border color transitions over `--dur-hover`. "Ongoing" badge: prepend 6px dot, `::after` ring `scale 1→2.2, opacity .5→0`, 2s infinite, disabled under reduced motion. "Completed" gets a static dot.
- [ ] **Step 4:** Run → PASS. Commit `feat(motion): project card hover and live status dot`.

### Task 7: Activity graph wave + count-up (A10)

**Files:**
- Create: `src/components/motion/CountUp.tsx`
- Modify: activity/contribution graph component
- Test: `src/components/motion/CountUp.test.tsx`

**Interfaces:**
- Produces: `<CountUp to: number; duration?: number = 0.9; className?: string />` — SSR renders `to` (final value; no hydration mismatch, correct with no JS); animates from 0 only when it first enters view.

- [ ] **Step 1: Write failing tests**: SSR/first render text is `"393"`; under reduced motion stays `"393"` with no intermediate values; uses `tabular-nums` class (so digits don't jitter width).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement with `useMotionValue` + `animate(mv, to, { duration, ease: EASE.out })` triggered by `useInView(ref, { once: true })`; write to `ref.textContent` via `mv.on("change")` (no re-render per frame).
- [ ] **Step 4:** Graph wave: on first in-view, each cell `opacity 0 → its level opacity` with `delay = columnIndex * 0.008` (≈ 0.42s across 53 columns), `duration 0.3`. Use a single CSS custom property `--col` per column + one `@keyframes`, toggled by a `data-inview` attribute — not 371 Motion components.
- [ ] **Step 5:** Run → PASS. Commit `feat(motion): activity wave and contribution count-up`.

### Task 8: Projects page filter animations (A11)

**Files:**
- Modify: projects filter component and project grid on `src/app/projects/page.tsx` (likely needs a client `ProjectGrid` that receives all projects and filters on the client, keeping `?tag=`/`?status=` in the URL via `router.replace(…, { scroll: false })`)
- Test: `e2e/projects-filter.spec.ts`

**Interfaces:**
- Consumes: `SPRING.layout`, `.press`.
- Produces: `<ProjectGrid projects: Project[] />` (client).

- [ ] **Step 1: Write failing tests**
  - `"tag pill slides"`: one `[data-filter-pill]` per filter group; after clicking "MongoDB" it overlaps the MongoDB chip.
  - `"rapid filtering leaves no ghosts"`: click TailwindCSS, Git, Postman, All within 300ms; after 800ms, count of `[data-project-card]` equals the "· N projects" number in the subtitle, and no two cards' boxes overlap.
  - `"filter URL still shareable"`: visit `/projects?status=ongoing` directly → only PlantWise.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Pills: same `layoutId` technique as Task 4, unique ids `"tag-pill"` and `"status-pill"`. Grid: `<LayoutGroup>` + `<AnimatePresence mode="popLayout" initial={false}>`, each card `<motion.article layout data-project-card>` with enter/exit `{opacity:0, scale:.97, filter:"blur(4px)"}`, `transition: SPRING.layout`. The "· N projects" subtitle is a plain text swap (no count-up here).
- [ ] **Step 4:** Run → PASS. Commit `feat(motion): animated project filtering`.

### Task 9: Magnetic CTA (A12)

**Files:**
- Create: `src/components/motion/Magnetic.tsx`
- Modify: footer "Let's Talk →"
- Test: `src/components/motion/Magnetic.test.ts`

**Interfaces:**
- Consumes: `SPRING.magnetic`.
- Produces: `<Magnetic strength?: number = 0.25; max?: number = 6>{children}</Magnetic>` and pure helper `magneticOffset(dx: number, dy: number, strength: number, max: number): { x: number; y: number }`.

- [ ] **Step 1: Write failing tests** for `magneticOffset`: `(40, 0, .25, 6) → {x:6, y:0}` (clamped), `(8, -4, .25, 6) → {x:2, y:-1}`, `(0,0,…) → {0,0}`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement helper (clamp each axis to `±max`). Component: `useSpring` x/y, update on `pointermove` relative to element center, reset to 0 on `pointerleave`. Render children unchanged (no listeners) when `matchMedia("(pointer: fine)")` is false or reduced motion is on.
- [ ] **Step 4:** Run → PASS. Wrap footer CTA. Commit `feat(motion): magnetic contact CTA`.

### Task 10 (stretch): Card → detail view transition (A13)

**Files:**
- Modify: `next.config.*` (`experimental.viewTransition: true` — confirm availability for the installed Next version first; skip the task if unsupported), project card image, `src/app/projects/[slug]/page.tsx` hero image
- Test: `e2e/view-transition.spec.ts`

- [ ] **Step 1: Write failing test**: click "View details" on LearnDeck → URL `/projects/learndeck`, hero image visible; with `reducedMotion: "reduce"` navigation completes in < 300ms.
- [ ] **Step 2:** Run → FAIL (if the route already works, the test passes — then add the assertion that the card image has `style.viewTransitionName === "project-learndeck"`).
- [ ] **Step 3:** Set matching `viewTransitionName: \`project-${slug}\`` on card image and detail hero; add `::view-transition-group(*){ animation-duration: var(--dur-reveal); animation-timing-function: var(--ease-out) }` and disable under reduced motion.
- [ ] **Step 4:** Run → PASS. Commit `feat(motion): shared-element transition to project detail`.

### Task 11: Motion QA pass

**Files:** none new (fixes only)

- [ ] **Step 1:** `npx vitest run && npx playwright test` → all PASS.
- [ ] **Step 2:** Lighthouse mobile on `/` → CLS ≤ 0.05, TBT not worse than baseline by > 50ms.
- [ ] **Step 3:** Chrome DevTools Performance, 4× CPU throttle: scroll the home page; no long frames attributable to animations.
- [ ] **Step 4:** Manual matrix — macOS/Windows reduced-motion on, Android Chrome (touch), keyboard-only tab through nav/filters/CTA. Fix anything that moves under reduced motion or traps focus.
- [ ] **Step 5:** Commit `chore(motion): qa fixes`.
