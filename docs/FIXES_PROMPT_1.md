# Fix prompt: icons, skill field, responsiveness, toasts

Paste into your agent from the repo root. It assumes `CLAUDE.md`, `PROGRESS.md` and the docs are in the repo, and that you have replaced `docs/design.md` and `docs/figma-map.md` with the newest versions (they now contain the icon, toast and responsive specs: design.md §20 to §23).

```
You are fixing four issues in my existing portfolio project. Read CLAUDE.md, PROGRESS.md, docs/design.md (especially §20 Skill icons, §21 Toasts, §22 Responsive public, §23 Responsive admin), docs/figma-map.md and docs/PRD.md first. Same rules as docs/MASTER_PROMPT.md: plain JavaScript only, npm, Figma is the source of truth for UI (file key KxTn1qYG7kzoGVYjbQM5Vh), one commit per fix, tests and verification before moving on, PROGRESS.md updated. Add a "Fixes round 2" section to PROGRESS.md.

For every bug: first reproduce it and write a failing test or a short repro note, then fix the root cause (not a patch over the symptom), then add a regression test, then verify in the browser.

## Fix 1: technology icons are not displayed
Symptom: the Stack chips on the home page, the project-card tech pills and the admin skills list show only text (the admin list even shows the raw icon string like "javascript" in a tile). No icon graphics render.
Likely cause: the skill's `icon` field stores a plain string and nothing maps it to an actual icon.
Do:
1. Add the `simple-icons` package. Create `src/components/ui/SkillIcon.jsx` that takes `slug`, `size` (default 14) and `className`, looks the slug up, and renders inline SVG with `fill="currentColor"`. Wrap the lookup in a helper in `src/lib/icons/` (build a slug → icon map once, server-safe, tree-shaken so the whole library is not shipped to the client; the admin picker may load the slug list lazily).
2. Colour rules from design.md §20: monochrome `--text-chip` in the Stack section; monochrome in admin; brand colours only where design.md §2 allows (Next.js, TypeScript, PostgreSQL, React) in project-card pills.
3. Fallback: when the slug is empty or unknown, render a 14px rounded tile with the skill's first letter (mono 9). Never a blank gap or raw text.
4. Rename the field to `iconSlug` (and optional `iconUrl` for ImageKit-uploaded custom icons). Write a one-off migration script `npm run migrate:skill-icons` that maps existing values and names to slugs (JavaScript → javascript, React → react, Next.js → nextdotjs, Node.js → nodedotjs, MongoDB → mongodb, Tailwind CSS → tailwindcss, HTML → html5, CSS → css, TypeScript → typescript, PostgreSQL → postgresql, Git → git, Figma → figma, Python → python, and so on). It must be idempotent, log what it changed, and skip documents that already have `iconSlug`.
5. Use the same SkillIcon everywhere skills appear: home Stack, project cards, project details "Tech used", admin skills list, project form tech picker.
6. Update the seed script so default skills have correct slugs.

## Fix 2: skill icon input only accepts 3 characters
Symptom: in Admin > Skills > Add skill, the icon field stops after 3 characters, so I cannot add things like "html5".
Likely cause: a `maxLength={3}` on the input and/or a `.max(3)` in the Zod skill schema left over from the "short abbreviation" idea.
Do:
1. Find and remove both limits (client input and the shared Zod schema in src/lib/schemas) and any DB-level or API-level check. Search the whole repo for maxLength, max(3) and "abbreviation".
2. Replace the free-text field with an **icon picker** (design.md §20): a search field plus a grid of matching simple-icons (max 48 results, debounced, keyboard navigable, slug shown on hover/focus). Typing the skill name should auto-suggest the matching icon; the user can still override. The slug is validated by `^[a-z0-9-]{1,40}$`. Keep an "Upload custom icon" option using the existing ImageKit dropzone (SVG/PNG, max 200 KB) that sets `iconUrl`.
3. Update the label and hint text (remove "short abbreviation (e.g. TS, NX)").
4. Tests: schema accepts "html5", "nextdotjs", a 40-char slug; rejects uppercase, spaces and 41 chars; the add/edit actions persist a long slug; the picker returns results for "html", "react", "mongo".

## Fix 3: public pages are not responsive
The Figma file already has the responsive designs for the home page: 768px dark `28:34292`, 768px light `28:35385`, 375px dark `28:34672`, 375px light `28:35765` (and 1280px dark/light `28:33898`, `28:34991`). Use get_design_context and get_screenshot on each and implement them exactly, in both themes.
Do:
1. Mobile-first Tailwind: base = 375 layout, then `md` (768) and `lg`/`xl` (1200+) overrides. Use the tokens only.
2. Implement design.md §22 for everything the Figma frames do not cover: /projects, /projects/[slug], the contact modal (bottom sheet below 520px), maintenance and 404. Filter pills scroll horizontally on mobile, contact row is 2×2, identity row stacks, heatmap shows the last ~26 weeks or scrolls, rails hug the edge with a 16px inset, side index only ≥ 1200.
3. No horizontal page scroll at any width from 320 to 1920. Touch targets at least 44×44. Test with the mobile viewport meta and `100dvh` where used.
4. Verify with screenshots at 320, 375, 768, 1024, 1280 and 1440, dark and light, for /, /projects, a project page, the contact modal open, /maintenance and a 404. Compare against the Figma screenshots and fix visible differences. Add Playwright (or the existing test setup) checks that assert `document.documentElement.scrollWidth <= window.innerWidth` on each page at 320, 375 and 768.

## Fix 4: make the admin panel responsive
There are no Figma frames for this. Follow design.md §23 exactly. Summary:
- ≥ 1024 keeps the sidebar; 768–1023 and below use an off-canvas drawer with a hamburger in the topbar (overlay, focus trap, Esc, closes on navigation).
- Forms collapse to one column (Publish card first); a sticky bottom save bar on mobile.
- Tables become stacked cards below 768 (projects, skills, messages, media, dashboard tables); filters scroll horizontally; KPI tiles 2 columns; dialogs and the icon picker become bottom sheets.
- Drag-to-reorder must work on touch (long-press to start) and every sortable row also gets up/down buttons.
- No horizontal page scroll at 320 to 1440. Inputs 44 high on mobile.
Apply to every admin page: login, dashboard, projects (list, new, edit), skills, sections, banner, profile, messages (list, detail), settings, media. Verify with screenshots at 375, 768, 1024 and 1440 and list any page that needed special handling in docs/DECISIONS.md. Add the same scrollWidth check for each admin page.

## Fix 5: action feedback toasts
Symptom: nothing tells me an action succeeded, for example after uploading an image or saving changes.
Do (design.md §21):
1. Build `src/components/ui/Toaster.jsx` with a `ToastProvider` mounted once in the root layout and a `useToast()` hook exposing `toast.success(msg, opts)`, `toast.error(msg, opts)`, `toast.info(msg, opts)` and `toast.dismiss(id)`. Bottom-left, stacked (max 3), auto-dismiss 4s (errors 8s), pause on hover/focus, close button, optional action (UNDO), slide-up animation that respects prefers-reduced-motion, `aria-live="polite"` container, `role="alert"` for errors. On < 640px full-width at the bottom with safe-area padding.
2. Standardise server action and route-handler responses as `{ ok: true, message? }` or `{ ok: false, error, fieldErrors? }` and add a small `useActionToast(action)` helper (or a wrapper around useActionState / form actions) that shows the right toast automatically. Do not scatter ad-hoc alerts.
3. Wire it to every admin action, using the message table in design.md §21: image/file/resume/banner uploaded, changes saved, created, deleted (with UNDO where feasible), toggles (published, featured, visible, section, maintenance), order saved, message read/archived/deleted, URL copied, export ready, sign out, and every failure with a clear reason (network error, file too large, validation, unauthorised, rate limited). Also show a toast on the public contact form success/failure only if the modal's own success state is not enough (keep the modal's sent state as is).
4. Uploads: progress stays in the dropzone; the success toast ("Image uploaded") fires on completion, the error toast on failure.
5. Tests: provider renders and stacks, auto-dismiss and pause on hover, error uses role="alert", the action helper maps ok/error results to toasts, and one integration test per category (upload, save, delete, toggle).

## Finish
Run npm run lint && npm test && npm run build from a clean install. Walk through manually at 375 and 1440: add a skill "HTML" with slug html5, see the icon on the Stack chips, edit the profile and save (toast), upload an image (toast), toggle a project (toast), open the admin on a phone-size viewport and use the drawer. Update PROGRESS.md and docs/DECISIONS.md, commit each fix separately, and report: what was wrong (root cause per bug), what changed, test results, screenshots checked, and anything you had to design yourself.
```
