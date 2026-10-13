# Portfolio V2 — Tejas Wasnik

A personal portfolio with a private admin panel, built with Next.js. The public site follows the **"Field Notes"** design: one narrow column between dashed drafting rails, serif headings, mono annotations and a single sage accent. The admin panel lets the owner manage content, projects, skills, messages and analytics without redeploying.

- **Product spec:** `docs/PRD.md` (source: *Portfolio Website PRD*, v1.0)
- **Designs:** all screens are already designed in Figma → see [`docs/figma-map.md`](docs/figma-map.md)
- **Design tokens and components:** [`docs/design.md`](docs/design.md)
- **Architecture, data model, API:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Build order:** [`docs/ROADMAP.md`](docs/ROADMAP.md) · **Prompts:** [`docs/PROMPTS.md`](docs/PROMPTS.md) · **Run it all:** [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md)
- **Agent instructions:** [`CLAUDE.md`](CLAUDE.md)

## Stack

Next.js (App Router) + **JavaScript (no TypeScript)** · Tailwind CSS · MongoDB Atlas (official `mongodb` driver) · JWT auth (`jose`, HTTP-only cookie, single admin) · ImageKit · Nodemailer with Google OAuth2 (Gmail) · Zod · npm

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run seed:admin` | Create the admin user from `ADMIN_EMAIL` and a prompted password |
| `npm run seed:interests` | Opt-in, idempotent: add 7 starter "Interest images" placeholders (no-op if any already exist) |

### Environment variables

`MONGODB_URI` · `JWT_SECRET` · `ADMIN_EMAIL` · `IMAGEKIT_PUBLIC_KEY` · `IMAGEKIT_PRIVATE_KEY` · `IMAGEKIT_URL_ENDPOINT` · `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `GOOGLE_REFRESH_TOKEN` · `GMAIL_USER` · `GITHUB_TOKEN` · `ANALYTICS_SALT` · `SITE_URL` (absolute origin for sitemap.xml/robots.txt/OG images, e.g. `https://tejaswasnik.dev`; defaults to `http://localhost:3000`)

**Gmail OAuth2 setup (one time):** create an OAuth client in Google Cloud Console, enable the Gmail API, authorise the `https://mail.google.com/` scope once (for example via the OAuth Playground with your own client credentials) to get a refresh token, and put it in `GOOGLE_REFRESH_TOKEN`. Nodemailer exchanges it for access tokens automatically. Set the OAuth consent screen to *In production*, otherwise refresh tokens expire after 7 days.

Secrets live only in env files and the host's environment settings, never in the repo.

### Interest images (admin → "Interest images")

Scattered decorative photos in the margins either side of the 760px column, desktop only (hidden below 1200px). Recommended source size: **at least 240px on the longest side** — smaller uploads still work but the admin UI warns that they may look soft once placed, since the layer renders them up to 400px CSS-wide. JPG, PNG, WebP or AVIF, 5 MB max per file. Up to 24 images; new ones are auto-placed in the margins (never over the 760px column or the side index) and can be repositioned, resized or rotated from the gallery's per-item edit panel.

## Deployment (Vercel)

1. **Push the repo to GitHub** (or GitLab/Bitbucket) and [import it on Vercel](https://vercel.com/new) — framework preset `Next.js`, build command `next build`, output left as default. No other config is needed; `next.config.mjs`'s security headers and the `middleware.js` admin/maintenance gate both work as-is on Vercel.
2. **MongoDB Atlas network access:** in Atlas → *Network Access*, add an IP allowlist entry for `0.0.0.0/0` (Vercel's serverless functions run on a changing pool of IPs, so a fixed-IP allowlist isn't practical — use Atlas's own database user credentials, not IP restriction, as the access control). Use a dedicated Atlas database user (not the Atlas account owner) scoped to read/write on this one database.
3. **Environment variables:** in the Vercel project → *Settings → Environment Variables*, add every variable from `.env.example` (see the table above for what each one is and where to get it) to both the **Production** and **Preview** environments. Set `SITE_URL` to the real production domain (step 5) — it drives `sitemap.xml`, `robots.txt` and Open Graph URLs, so a preview deploy left on `http://localhost:3000` will emit wrong absolute URLs.
4. **Seed the admin user** once, against the production database: run `npm run seed:admin` locally with `.env.local` pointed at the production `MONGODB_URI` and `ADMIN_EMAIL` (or run it from a one-off `vercel env pull` + local invocation) — this only needs to happen once per database, not on every deploy.
5. **Custom domain:** in the Vercel project → *Settings → Domains*, add the domain and follow Vercel's DNS instructions (an `A`/`ALIAS` record at the apex, or a `CNAME` on a subdomain, pointed at Vercel). Once it's verified, update `SITE_URL` to match and redeploy so sitemap/OG/robots pick up the final domain.
6. **Gmail OAuth2 in production:** the Google Cloud OAuth consent screen must be *In production* (not *Testing*) before deploying, or `GOOGLE_REFRESH_TOKEN` silently expires after 7 days and the contact form starts saving messages with `emailFailed: true` instead of sending them (the message itself is never lost — see `docs/ARCHITECTURE.md`'s contact flow).
7. **ImageKit:** no extra production config — the same public/private keys and URL endpoint work from any deploy; just make sure the dashboard's allowed origins (if configured) include the production domain.
8. **Verify after deploy:** visit `/`, `/projects`, log into `/admin`, toggle maintenance mode on and off (confirms the public site swaps to the maintenance page while `/admin` stays reachable), and submit the contact form once.

## Routes

| Public | Admin (`/admin`, protected) |
|---|---|
| `/` home · `/projects` · `/projects/[slug]` | `/login` · `/` dashboard · `/projects` (+ `/new`, `/[id]`) |
| Contact form (modal) · maintenance · 404 | `/skills` · `/sections` · `/banner` · `/profile` |
| | `/messages` (+ `/[id]`) · `/settings` · `/media` |

## Licence

TBD (add a `LICENSE` file; MIT is the usual default for personal projects).
