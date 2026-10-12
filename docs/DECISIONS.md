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
