# Baseline health summary

Commit: a795c7e6 (branch fixes-round-2). Node v22.23.1, npm 10.9.8, Windows 10.19045.

| Check | Result | Log |
|---|---|---|
| `npm ci` | PASS, exit 0, 428 packages | audit/01-npm-ci.log |
| `npm run lint` | PASS, exit 0, zero warnings/errors | audit/02-lint.log |
| `npm test` | PASS, 51 files / 338 tests, exit 0 | audit/03-test.log |
| `npm run build` | PASS, exit 0. Next 16.4.0/Turbopack prints no First Load JS size table (unlike webpack-era Next) — sizes approximated manually below. | audit/04-build.log |
| `npm audit --omit=dev` | 2 moderate (uuid <11.1.1, via `imagekit`'s own dependency) | audit/05-npm-audit.log |
| `npm audit` (all) | 7 total (2 moderate prod, 5 high dev-only: `braces`/`micromatch`/`fast-glob` via `eslint-config-next`'s own `@next/eslint-plugin-next` — lint-tooling DoS vector, not shipped) | audit/05b-npm-audit-full.log |
| `npm outdated` | `eslint` 9.39.5 → 10.12.0 (major, not applied), `vitest`/`zod` patch-level only | audit/06-npm-outdated.log |
| TODO/FIXME | none found in `src`/`scripts` | audit/07-code-smells.log |
| `console.log` | none found in `src` | audit/07-code-smells.log |
| `debugger` | none found | audit/07-code-smells.log |
| Hard-coded hex outside `icons.jsx`/tests/`globals.css` | none found | audit/07-code-smells.log |
| `eslint-disable` count | 21, all with an inline justification (mostly `@next/next/no-img-element` for remote ImageKit URLs) | audit/07b-eslint-disables.log |
| Secrets in git history | none found (`.env`/`.env.local` never committed; no API-key-shaped strings in any commit) | (scan run inline, no log file — command + empty output is the evidence) |
| Dev server hydration warnings | none observed on `/` and `/projects` (port 3001, separate from the main audit server) | audit/08-dev-server.log |

## Client bundle size (approximate — no First Load JS table from Turbopack's CLI output)

Total `.next/static/chunks`: 1.1 MB across all routes combined. Largest individual chunks:

```
224.4 KB  3dmm3v_fq28gc.js
128.4 KB  1sgwvm69hc9zb.js
110.0 KB  0cz1d0mv5g_q7.js
104.8 KB  1fluj73vnnt9d.js
 35.9 KB  27pqa2s8z4vh9.js
```

These are almost certainly React/React-DOM/Next-runtime framework chunks shared across every route, not route-specific bundles — Turbopack's non-content-hashed-by-route output makes per-route attribution hard to read directly from the build log. See PERF section of the main report for the `simple-icons`/`lucide-static`/`remixicon` client-leak check (done separately, confirmed clean).

## Isolated test environment (for every section after this one)

- A sibling MongoDB database **`portfolio_audit`** was created on the *same* Atlas cluster as production (same connection string, only the database-name path segment swapped), confirmed to accept writes/drops independently of the production `portfolio` database.
- `scripts/ensure-indexes.js` and `scripts/seed.js` were run against it (`MONGODB_URI` overridden via shell env, which Next.js's own `.env.local` loading does not override — process env always wins).
- A disposable admin user was created via `scripts/seed-admin.js`: `audit@test.local` / `AuditTest1234!`.
- The app was built and started (`npm run build && npm run start`) with `MONGODB_URI`/`ADMIN_EMAIL` overridden to point at `portfolio_audit`, running at `http://localhost:3000` for the remainder of this audit.
- **Production (`portfolio` database, real ImageKit account, real Gmail account) was never written to.** Every write/delete/update exercised during this audit targets `portfolio_audit` only.
