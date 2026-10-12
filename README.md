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

### Environment variables

`MONGODB_URI` · `JWT_SECRET` · `ADMIN_EMAIL` · `IMAGEKIT_PUBLIC_KEY` · `IMAGEKIT_PRIVATE_KEY` · `IMAGEKIT_URL_ENDPOINT` · `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `GOOGLE_REFRESH_TOKEN` · `GMAIL_USER` · `GITHUB_TOKEN` · `ANALYTICS_SALT`

**Gmail OAuth2 setup (one time):** create an OAuth client in Google Cloud Console, enable the Gmail API, authorise the `https://mail.google.com/` scope once (for example via the OAuth Playground with your own client credentials) to get a refresh token, and put it in `GOOGLE_REFRESH_TOKEN`. Nodemailer exchanges it for access tokens automatically. Set the OAuth consent screen to *In production*, otherwise refresh tokens expire after 7 days.

Secrets live only in env files and the host's environment settings, never in the repo.

## Routes

| Public | Admin (`/admin`, protected) |
|---|---|
| `/` home · `/projects` · `/projects/[slug]` | `/login` · `/` dashboard · `/projects` (+ `/new`, `/[id]`) |
| Contact form (modal) · maintenance · 404 | `/skills` · `/sections` · `/banner` · `/profile` |
| | `/messages` (+ `/[id]`) · `/settings` · `/media` |

## Licence

TBD (add a `LICENSE` file; MIT is the usual default for personal projects).
