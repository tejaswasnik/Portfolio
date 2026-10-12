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
