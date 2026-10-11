# CLAUDE.md

Personal portfolio (Next.js + admin panel) for Tejas Wasnik. **Every screen is already designed in Figma. Implement the design; do not invent or redesign UI.**

## Read first
1. `docs/figma-map.md` — which Figma frame matches which route.
2. `docs/design.md` — tokens, type scale, spacing, components.
3. `docs/PRD.md` — behaviour and rules. `docs/ARCHITECTURE.md` — structure and data model.

## Working from the Figma file
- File key: `KxTn1qYG7kzoGVYjbQM5Vh` (Portfolio V2). Node IDs per page are in `docs/figma-map.md`.
- Before building a screen, fetch its frame with the Figma MCP (`get_design_context`, `get_screenshot`) and match it. Reuse existing components; do not hand-roll look-alikes.
- Colours, spacing and fonts come from the tokens in `tailwind.config.ts` / `globals.css` (mirroring `docs/design.md` §11). **Never hard-code hex values.**
- Where Figma and `design.md` disagree, **Figma wins**. Where Figma and the PRD disagree on scope, the **PRD wins** (e.g. no Notes link, logo is "TW.").
- Figma uses sample content (project names, messages, stats). Replace it with real data from the database.

## Stack and commands
Next.js App Router, TypeScript (strict), Tailwind, MongoDB (official `mongodb` driver), JWT auth with `jose`, ImageKit, Nodemailer + Google OAuth2, Zod. Package manager: **npm** (commit `package-lock.json`; don't add other lockfiles).
`npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test`

## Conventions
- Server components by default; add `"use client"` only for interactivity (theme toggle, forms, scroll-spy, drag-reorder).
- One Zod schema per entity in `src/lib/schemas/`, shared by forms and API routes. Validate every input on the server.
- Auth: single admin; password hashed with bcrypt; session is a signed JWT (`jose`, HS256) in an HTTP-only, Secure, SameSite=Lax cookie with a short expiry that slides on activity (this is the inactivity logout). Middleware verifies the JWT on the edge; every server action and route handler re-verifies it. Never put the JWT in localStorage or a client-readable cookie.
- All admin routes sit under `/admin` and are protected twice: middleware and a server-side session check in each action or route handler.
- Email goes through one `sendMail()` helper in `src/lib/mail/` using Nodemailer with Gmail OAuth2 (`type: 'OAuth2'`). Nodemailer needs the Node runtime, so never import it in middleware or edge routes.
- Rate limiting is backed by MongoDB (a `rateLimits` collection with a TTL index), not Redis.
- After every admin mutation call `revalidateTag` / `revalidatePath` so the public site updates immediately.
- Database access only through `src/lib/db/` helpers that reuse the Mongo client across serverless invocations.
- Fonts: Instrument Serif (headings), Inter (body), **JetBrains Mono** (all mono; the Figma file mixes in IBM Plex Mono for some labels, so use one).
- Heading section titles are 24px serif; "Stack" matches the others.
- Files stay small and single-purpose; components in `src/components/{public,admin,ui}/`.

## Hard rules from the PRD
- No Notes/blog in v1. Navbar: `TW.` logo, Home, Projects, theme toggle.
- Analytics are cookie-free: store a daily-rotating hash of IP + user agent + salt, never the raw IP. Skip bots and the logged-in admin.
- Contact form: honeypot + Mongo-backed rate limit (3 per hashed IP per hour). Always save the message first; if the email fails set `emailFailed`.
- Unpublished projects never appear on the public site. "Featured" controls the home page only; `/projects` shows all published.
- Graceful fallbacks for GitHub, ImageKit and email failures; maintenance mode shows the maintenance page to the public while `/admin` keeps working.
- Accessibility: WCAG AA contrast, keyboard navigation, alt text, `prefers-reduced-motion` for the banner GIF and transitions.

## Definition of done
Matches the Figma frame at 1440, 1280, 768 and 375 where those exist; dark and light themes both work; `npm run lint && npm run typecheck && npm test` pass; no hard-coded colours; no secrets committed.
