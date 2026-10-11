# Roadmap

Check items off as they ship. Each item names the Figma frame to build from (see `figma-map.md`). Tests accompany each feature; don't defer them.

## Phase 0 — Foundation
- [ ] Create Next.js + TypeScript + Tailwind app, lint, typecheck, test setup, CI
- [ ] Tokens, fonts and light/dark theme from `design.md` (`globals.css`, `tailwind.config.ts`)
- [ ] Mongo client helper, Zod schemas, collection helpers and indexes
- [ ] Env validation, `.env.example`, security headers
- [ ] Shared UI: buttons, chips, inputs, toggle, dialog, icons, hatched divider, rails and crosshair layout

## Phase 1 — MVP
**Public**
- [ ] Layout shell: nav (TW., Home, Projects, theme toggle), rails, footer — `5:5314`
- [ ] Home sections: banner, profile, about, contact row, heatmap, projects, stack, let's talk — `5:5314`
- [ ] Side index with scroll-spy and hidden-section handling
- [ ] Responsive home at 1280 / 768 / 375, both themes — `28:*`
- [ ] `/projects` with tag and status filters — `72:2`
- [ ] `/projects/[slug]` with markdown, gallery + lightbox, prev/next, per-project SEO — `72:436`
- [ ] Contact modal, validation, honeypot, rate limit, save, email, success state — `74:742`, `74:1129`
- [ ] 404 and maintenance pages — `74:370`, `74:2`
- [ ] SEO: metadata, Open Graph, sitemap, robots

**Admin**
- [ ] Auth: login, session, lockout, inactivity logout — `57:2`, `57:70`
- [ ] Admin shell: sidebar, topbar, unread badge — `53:2`
- [ ] Projects: list, create, edit, delete, featured/published toggles — `65:11`, `66:700`, `66:9`
- [ ] Skills CRUD, reorder, show/hide — `67:7`
- [ ] Sections toggles and drag-to-reorder — `67:836`
- [ ] Banner upload via ImageKit with preview, replace, remove — `69:7`
- [ ] Profile and content editor, resume upload, social links, heatmap username — `69:612`
- [ ] Messages inbox and detail — `70:7`, `70:720`
- [ ] Settings: SEO, notification email, change password/email — `71:7`
- [ ] Analytics: tracking endpoint, dashboard widgets — `53:2`

**Quality**
- [ ] Accessibility pass, Lighthouse pass, reduced-motion
- [ ] Deploy to Vercel, Atlas allow-list, env vars

## Phase 2
- [ ] Media library with usage tracking and safe delete — `71:646`
- [ ] Drag-to-reorder projects
- [ ] Click-tracking breakdowns
- [ ] JSON data export and maintenance mode toggle — `71:7`

## Later
Notes/blog, resume download tracking, testimonials, scheduled publish, weekly analytics email.

## Open decisions
- Vercel vs Netlify · Turnstile later? · single or per-theme banner
- Design gaps listed in `figma-map.md` (lightbox, empty/error states, responsive admin)
