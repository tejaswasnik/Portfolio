# Decisions

Deviations from the docs and ambiguous calls made while executing `docs/PROMPTS.md`, with alternatives and reasoning.

## Step 0 — Scaffold

**Tailwind v4, no `tailwind.config.js`.** `docs/ARCHITECTURE.md` mentions `tailwind.config.js`, but Tailwind v4 (what `create-next-app` installs today) configures tokens in CSS via `@theme` inside `globals.css` instead of a JS config file. Alternative: pin Tailwind v3 to keep a config file. Chose v4 to stay on the current `create-next-app` template; design tokens will live in `src/styles/globals.css` in step 1.

**`imagekit` package kept despite deprecation notice.** npm warns that `imagekit@6` is deprecated in favour of `@imagekit/nodejs`. Kept `imagekit` because it was explicitly named in the step 0 prompt's dependency list; revisit if its API becomes a blocker in step 9.

**`next.config.mjs` experimental flags removed.** The default Next 16 template enables `cacheComponents`/`partialPrefetching`, which use `"use cache"` directives instead of the classic `fetch`-cache + `revalidateTag`/`revalidatePath` model that `docs/ARCHITECTURE.md` and `docs/PRD.md` assume. Removed both flags to keep the documented revalidation model simple and predictable.

**No CSP header yet.** Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and `Strict-Transport-Security` in `next.config.mjs`. Held off on `Content-Security-Policy` until the external origins (ImageKit CDN, Google Fonts, GitHub API) are finalized in later steps, to avoid a header that blocks features before they exist.

**Env loader is a lazy `getEnv()` function, not a top-level throw on import.** Importing `src/lib/env.js` anywhere would otherwise fail `npm run build`/`npm test` before `.env.local` exists. `getEnv()` validates and caches on first call, so it's safe to import now and wire into `src/lib/db`, `src/lib/mail`, etc. in later steps.

**`"type": "module"` added to `package.json`.** Needed to silence a Vitest warning about loading an ESM config file (`vitest.config.js`) as CommonJS. Verified `npm run lint && npm test && npm run build` all still pass with it set.

**`package-lock.json` / npm audit.** 7 advisories remain (high: `braces` via `eslint-config-next`'s own tooling deps; moderate: `uuid` via `imagekit`). `npm audit fix --force` would downgrade `eslint-config-next` to 14.2.35 and `imagekit` to 1.5.0 — both worse than what's installed. Left as-is; both are dev-time/non-exploitable in this app's actual request path. Revisit if newer non-breaking patches land.

**Admin route group named `(dashboard)` kept literal per `docs/ARCHITECTURE.md`**, even though it reads like a comment in the diagram — it's a real Next.js route group folder under `src/app/admin/`.

## Step 1 — Design tokens and theme

**No `tailwind.config.js` to wire tokens into (continuation of the step 0 decision).** All dark/light tokens live in `src/styles/globals.css` as CSS variables (`:root`, `:root[data-theme="light"]`), exposed to Tailwind utilities via `@theme inline`. Verified the generated CSS inlines `var(--token)` directly into utility rules (e.g. `.text-accent { color: var(--accent) }`) rather than hard-coding hex, by inspecting the compiled Turbopack CSS chunk.

**Fine hatching has no exported fill, confirmed directly.** `get_design_context` on node `5:5637` ("Fine hatching") returns an `<img>` pointing at an SVG whose `<g id="Fine hatching">` is empty — the asset genuinely carries no content, matching `docs/design.md` §12's note. Built `SectionDivider` from the CSS `repeating-linear-gradient` recipe design.md §5 already suggests, using `--border-subtle` instead of a literal hex.

**Light theme tokens: Figma variables only exposed text colors.** `get_variable_defs` returned `{}` for the dark home frame (`5:5314`) and only a text-token subset (`Portfolio/Text/Light/Primary|Secondary|Muted`, plus two "Dark" text values used inside the always-dark project-preview mockups) for the light frame (`28:34991`) — no surface/border/accent variables were bound at a queryable node. Used those three confirmed text values verbatim (`#171C19` / `#424E47` / `#56625B`) and derived the remaining light surfaces/borders/accent by inspecting the light home screenshot (`28:34991`) against design.md §9's explicit instruction ("invert the ramps, darken the accent for contrast"). These derived values (`--bg`, `--surface-*`, `--border-*`, `--accent` on `[data-theme="light"]`) are a visual approximation, not Figma-confirmed exact hex — flagging for a follow-up pass once/if the Figma file exposes full light-mode variables.

**`--cta-bg`/`--cta-text` kept constant across themes**, not inverted with the rest of the ramp. The light-theme screenshot shows the "Let's Talk" CTA still rendering with the same light fill/dark text as the dark theme (just reading as an outlined pill against the lighter page background) — confirms design.md §2's separate "Inverse (CTA)" token section is intentionally fixed, not part of the per-theme surface/text ramp.

**Added `--border-hover` token (dark `#3A4045`, light `#B8B5AC`).** The icon-button hover border color is specified in design.md §8's interaction table but wasn't in the core §11 token starter. Added it as a real token rather than hard-coding the hex in `Button.jsx`, to keep "no hard-coded hex values" actually true.

**Dialog has no Figma frame of its own**, but the contact form modal (`74:742` → `74:1105` "Contact modal") gave real chrome values (panel radius, header layout, ESC-close label, Input/Textarea styling at `74:1112`/`74:1124`) reused for the generic `Dialog` primitive. The focus-trap/Esc/aria wiring itself has no design reference and is listed in `docs/PROGRESS.md` under "Designed by me".

**`Toggle` (switch) has no Figma frame anywhere in the file** (home page has no toggle; admin sections/skills toggles come in step 8). Built from tokens only — listed in `docs/PROGRESS.md` under "Designed by me"; revisit against the real admin Sections (`67:836`) frame when step 8 is implemented.

**`AGENTS.md` at the repo root is generated by `next dev` itself** (not `create-next-app` — confirmed by its own header comment pointing at `node_modules/next/dist/server/lib/generate-agent-files.js`), which says committing it avoids a recurring uncommitted diff. Committed as instructed.

## Step 2 — Database and schemas

**`projectSchema.status` stored lowercase (`"ongoing"` / `"completed"`).** docs/PRD.md §3.5 displays "Ongoing / Completed" in the admin form, but the schema stores the lowercase values; the admin UI (step 8) can capitalize for display. Keeps enum values consistent with the rest of the schemas (`eventSchema.type`, `sectionSchema.key`, etc., which are all lowercase/kebab-case).

**`src/lib/db/client.js` imports `../env.js`, a relative path, not the `@/` alias.** The `@/` alias is resolved by Next's bundler (via `jsconfig.json`) and by Vitest (via `vitest.config.js`'s own alias), but `scripts/ensure-indexes.js` and `scripts/seed.js` run under plain `node` (via `npm run db:ensure-indexes` / `db:seed`), which doesn't know about either config. A relative import works in every context; keep `src/lib/db/**` relative-only for anything a plain-`node` script might import.

**`scripts/ensure-indexes.js` / `scripts/seed.js` use `node --env-file=.env.local`**, not a `dotenv` dependency — Node 20.6+ supports `--env-file` natively, and the project's stated Node baseline (CI pins 20.x) and local toolchain both satisfy that, so no new dependency was needed to stay within "install only what the stack needs" from step 0.

**Events TTL set to 24 months** (the upper end of docs/PRD.md §3.2's "12–24 months" range), as a single `expireAfterSeconds` index on `events.createdAt`. A second, non-TTL compound index `{ path: 1, createdAt: -1 }` covers the `top pages over a date range` aggregation query from step 11 — MongoDB allows multiple indexes on overlapping fields as long as the specs differ.

**Collection helpers are thin accessors + a handful of read helpers, not full CRUD.** ARCHITECTURE.md asks for "collection helpers" per entity; built `xCollection(db)` accessors for every entity plus the specific read helpers step 2 actually needs (`findPublicProjects`, `findPublicProjectBySlug`, `buildPublicProjectFilter`, `findUserByEmail`, singleton getters for `profile`/`siteSettings`, visible/all finders for `sections`/`skills`). Write/update/delete helpers are deferred to the steps that need them (admin CRUD in step 8, contact save in step 5, tracking in step 11) to avoid speculative API surface now.

**Zod schemas validate only what's genuinely user/API input or a meaningfully-shaped stored document; collection helpers don't re-validate on every read.** E.g. `messageSchema` documents the full stored shape (useful for admin update actions later) separately from `contactFormSchema` (the actual form/API input, including the honeypot). Validation happens at the boundary (forms, `/api/*` handlers) per CLAUDE.md, not on every database read.

**A real `.env` appeared on disk during this step** (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, ImageKit keys, `GMAIL_USER` are filled in; `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REFRESH_TOKEN`/`GITHUB_TOKEN`/`ANALYTICS_SALT` are still blank). Confirmed it's gitignored (`git check-ignore -v .env` → matched by `.gitignore:34`). Did not run `db:ensure-indexes`/`db:seed` against it: `getEnv()`'s schema requires every variable, so both scripts would still fail fast on the blank ones, and even once complete, `db:seed`'s `deleteMany` calls on `sections`/`profile`/`siteSettings`/`skills` are a real, hard-to-reverse write against a live Atlas cluster that nothing here confirmed is safe to overwrite — left for an explicit decision once all credentials are in and the cluster's current state is known.

## Step 3 — Public home page

**Home page reads actually hit the real `.env` Mongo cluster at build time, read-only.** Next prerenders `/` as a static page, which runs the async `Home()` server component — and its `getPublic*` calls — during `npm run build`, not just at request time. Since a real `MONGODB_URI` exists in `.env` (not `.env.local`, but Next loads `.env` too), every `npm run build` in this environment makes a live, read-only `find`/`findOne` against the real cluster. Every `getPublic*` helper (`src/lib/db/cache.js`) fails closed (`try`/`catch` → `null`/`[]`), so an unreachable or empty cluster degrades to an empty page rather than failing the build — confirmed by inspecting the rendered dev-server HTML (nav renders; no section markup, since `sections`/`profile`/etc. are still unseeded). No writes happen anywhere in this step's code path.

**Banner/Profile split out of a single "Profile introduction" block into independently toggleable pieces.** The Figma frame (5:5315) draws nav+banner+identity as one visual block, but `sectionSchema`'s 8 keys (step 2) include `banner` and `profile` as separately toggleable sections (PRD §3.3) — `src/components/public/BannerSection.jsx` and `ProfileIdentity.jsx` are now independent, each gated by its own entry in `visibleSections`, while `Nav` always renders (it isn't a toggleable section).

**Project cards render `coverImage`, not bespoke per-project illustration.** The "two preview variants" the step 3 prompt mentions turned out to be hand-illustrated mockup UIs unique to the two Figma sample projects (a dashboard for "Workspace", a document editor for "Fieldnote") — not a reusable data-driven variant a real admin-entered project could select. `ProjectCard` shows `project.coverImage` in that slot (object-cover) with a token-based gradient placeholder (`from-surface-3 to-surface-2`) when none is set yet.

**Icons are inlined as React components with `stroke="currentColor"`, not `<img src>` tags referencing the downloaded Figma SVGs.** Figma's exported SVGs bake a fixed hex stroke (e.g. `#B5D4BF` on the mail icon) that would look wrong in the theme it wasn't exported for (dark accent vs. light accent differ). Downloaded the real assets (`mail`, `github`, `linkedin`, `twitter`, `arrow-up-right`, `arrow-right`, `coffee`, `upload`) via the Figma MCP, copied their exact path data verbatim into `src/components/ui/icons.jsx` with `stroke="currentColor"` substituted for the baked hex, and deleted the downloaded files — the shapes are unmodified, only the color binding changed, so each icon now inherits its wrapper's themed text color.

**"Message me" and the "Let's Talk" CTA degrade to `mailto:` links, not an inert button.** Both open the contact modal once step 5 builds it. Until then, rendering a non-functional `<button>` felt worse than a working (if lesser) mailto fallback against `profile.socialLinks.email` — and when that's unset, "Message me" simply doesn't render, consistent with "empty links aren't rendered" (PRD 2.2.4).

**A few small pieces of UI reuse step 1's token *classes* via locally-duplicated class strings instead of importing `Button`,** specifically everywhere a link (`<a href>`) needed to look like a button — `Button` only renders a `<button>`, and nesting an anchor inside one (or a button inside an anchor) is invalid HTML. Editing `Button.jsx` to support `href`/`asChild` was out of scope for this step (steps 0–2's committed files). Each duplicated class string is commented with where the canonical variant lives, so a later step can fold them back into `Button` once it supports rendering as a link.

**GitHub heatmap heading text ("Activity") has no confirmed Figma frame** — `get_design_context` on the Activity section's editorial column (`10:11`) was truncated by the tool's own output-size limit before any heading node appeared (the contribution-calendar grid alone is ~180 day cells). Used "Activity" to match the side index's own label for this section (confirmed from `10:1057`). Logged under "Designed by me" in PROGRESS.md.

**Avatar's "YOUR PHOTO" caption and the banner's "Upload GIF banner" copy are editor-facing hints in the Figma file, not public copy** — both read as instructions to the person filling the field in, not something a site visitor should see. The public empty states instead show just the initials avatar (no caption) and a neutral "Banner coming soon" line.

## Step 4 — Projects pages

**`markdown-it` chosen for sanitised markdown rendering**, one dependency instead of a parser + separate sanitizer. `html: false` (the default-off setting kept explicit) makes it escape any raw HTML in the source as literal text rather than render it — the PRD's "sanitised markdown rendering" requirement, with no DOM-based sanitizer (e.g. DOMPurify, which needs jsdom server-side) needed.

**Tag filter uses the skill's Mongo id as the `?tag=` value, not a slug.** `skillSchema` (step 2) has no slug field, and adding one is a schema change outside this step's scope. `/projects?tag=<skillId>` works identically to a slug for filtering/linking purposes; it's just less readable in the address bar. Revisit if skills ever get a slug for other reasons.

**Lightbox has no Figma frame** (confirmed in `docs/figma-map.md`'s "Known gaps"). Built `src/components/public/Lightbox.jsx` reusing the same focus-trap/Esc interaction pattern as `Dialog` (step 1), plus Left/Right arrow-key navigation between screenshots — the gallery grid and caption-row chrome *do* follow the real frame (`72:536`/`72:564`). Listed under "Designed by me".

**Screenshot captions are index-only ("01 · N total"), not per-image captions like Figma's sample "01 · Editor".** `project.screenshots` (step 2 schema) is a plain `string[]` of URLs with no caption field — Figma's captions are illustrated-mockup sample copy, not real data the admin enters. Revisit if a future step adds per-screenshot captions to the schema.

**Prev/next ordering uses the same `order` field the list/home page already sort by** (`getPublicAllProjects`, step 2/3), found by index around the current slug in that same array — not a separate query. Keeps one definition of "project order" across the whole site.

**`/projects` and `/projects/[slug]` reuse `LetsTalkSection` (step 3) as their footer**, fed the same `profile`/`siteSettings` fields as the home page. Figma's "Connect and footer" frame on both pages (`72:391`, `72:700`) has the identical heading-block/CTA/colophon structure as the home page's version — confirmed by metadata shape, not a re-fetch of the full frame (to stay under the per-call token budget established in steps 1/3).

**`/projects` grid reuses `ProjectCard` (step 3) directly**, in a `grid grid-cols-1 sm:grid-cols-2` layout instead of the home page's `flex` row — PRD 2.3 explicitly calls for "same card design" on this page.

**More internal nav links duplicate `Button`'s dashed/primary class strings as `<a>`/`Link`** (live-site/GitHub buttons, pager cards, back-to-projects), continuing the step 3 precedent rather than adding `href`/`asChild` support to the `Button` primitive, which is still out of this step's scope.

**`BackIcon`/`ExpandIcon` added to `src/components/ui/icons.jsx`**, path data downloaded verbatim from Figma (`72:453` icon/back, `72:566` icon/expand) with the baked stroke hex swapped for `currentColor`, matching the step 3 icon convention exactly.

**`/projects` and `/projects/[slug]` render dynamically (`ƒ`), not statically prerendered** — confirmed in the `next build` route output. Unlike `/` (static, step 3), these read `searchParams`/`params` at request time, so they don't hit the live Mongo cluster during `npm run build`/CI the way the home page currently does.

## Step 5 — Contact form

**Fixed a real bug in `src/lib/env.js` before this step could work at all: `getEnv()` required every env var, so the Mongo client (and anything else calling `getEnv()`) already threw with the current real `.env` (Google OAuth/GitHub token/analytics salt blank) — not just the mail feature.** CLAUDE.md explicitly calls for graceful fallbacks on GitHub/ImageKit/email specifically, which an all-or-nothing env schema can't support. Split `envSchema` into a required core (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`) and feature-specific vars that default to `""` (ImageKit, Google OAuth, `GMAIL_USER`, `GITHUB_TOKEN`, `ANALYTICS_SALT`) — each consumer (`sendMail.js`, the GitHub fetch, future ImageKit/analytics code) checks for a non-empty value itself before using one. Added a test confirming `getEnv()` now succeeds with only the core three set. This also means `src/lib/db/client.js` (steps 2-3) now actually connects in this environment instead of always throwing — verified empirically with `node --env-file`.

**IP-hash salt reuses `ANALYTICS_SALT` when set, else `JWT_SECRET`, else a fixed fallback string** (`src/lib/rate-limit/hash.js`) — not a dedicated rate-limit-only secret, since the requirement is "never store it raw," not cryptographic unlinkability from the (not-yet-built) analytics hash. Revisit if step 11's analytics hashing wants to *not* share a salt with this.

**Rate limiting is one atomic `findOneAndUpdate` with `$inc`/`$setOnInsert`/`upsert: true`**, not a separate find-then-branch-then-write — avoids a race where two concurrent requests from the same hashed key both read "under the limit" and both proceed. Confirmed `mongodb@7`'s `findOneAndUpdate` returns the document directly (not wrapped in `.value`), since `includeResultMetadata` now defaults to `false` — checked the driver's own source rather than assuming the older API shape.

**A filled honeypot returns `{ ok: true }` (silent pretend-success), not an error** — a bot that gets a 400 learns to leave that field empty next time; a bot that gets the same "success" response as a real submission learns nothing, while the server saves and emails nothing.

**The client always sees success once the message is saved, even when the notification email fails or `siteSettings.notificationEmail` is unset** — matches CLAUDE.md's "Always save the message first; if the email fails set emailFailed" read literally: the *message* succeeded; the *notification* is the admin's problem to retry (step 10's inbox).

**`ContactModalProvider` is mounted inside `src/components/ui/PageFrame.jsx`**, not duplicated in each of the three page files that need it (`/`, `/projects`, `/projects/[slug]`) — a one-time layering exception (a `ui/` primitive importing from `public/`) to avoid repeating the same three lines of modal-wiring boilerplate per page. `PageFrame` itself stays a server component; it only renders the client provider as a child.

**`ContactLinksRow`'s "Message me" cell and `LetsTalkSection`'s CTA no longer gate on `profile.socialLinks.email`** — both now always open the real contact modal unconditionally, since the modal emails `siteSettings.notificationEmail`, not the visitor-facing social email. This also changes `src/app/(public)/page.js`'s `contact-links` section visibility from "visible section AND any social link present" to just "visible section" (Message me needs no social link at all now). The `email` prop was removed from every `LetsTalkSection` call site since the component no longer takes one.

**No live end-to-end test of a fully valid submission** (one that would actually insert into the real `.env` Mongo cluster and attempt a real email) — per docs/MASTER_PROMPT.md §5 ("never use real third-party services in automated tests") and out of caution about writing an unrequested document into the user's live database. Verified the save/email-success, save/email-failure, missing-`notificationEmail`, rate-limit-429, and DB-unreachable-503 paths entirely through `src/app/api/contact/route.test.js` with every dependency mocked; verified validation and the honeypot path for real against the running dev server (safe: neither path touches the database).
