# Portfolio Website — Product Requirements (v1.0, Draft)

Next.js portfolio with a private admin panel. Public site follows the Field Notes design (see `figma-map.md`). The admin panel manages content, projects, skills, section visibility, banner, messages and analytics without redeploying.

**Goals:** present the best work clearly and quickly · give the owner full control over content and visibility · capture visitor insights and inbound messages in one place.
**Non-goals (v1):** notes/blog · multi-user admin, comments, newsletters, e-commerce · multi-language.

**Users:** *Visitor* (recruiter, client, peer): fast load, clear projects, easy contact. *Admin* (single authenticated owner): edit content, control visibility, read messages, view analytics.

## 1. Tech stack
| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), JavaScript only |
| Styling | Tailwind CSS, dark/light tokens |
| Database | MongoDB Atlas (official `mongodb` driver) |
| Auth | JWT (`jose`) in an HTTP-only cookie, single admin, bcrypt-hashed password |
| Images | ImageKit |
| Email | Nodemailer with Google OAuth2 (Gmail) |
| Hosting | Vercel (recommended) or Netlify |
| Spam | Honeypot + MongoDB-backed rate limiting |
| Validation | Zod, shared by client and API |

## 2. Public site
### 2.1 Global
- Navbar: logo "TW.", Home, Projects, theme toggle. No Notes link.
- Centered column with dashed grid lines and corner markers.
- Right-side index (desktop only): visible sections (About, Contact, GitHub, Projects, Tools) with scroll-spy; hidden sections drop out automatically.
- Mobile-first; index hidden on small screens; project grid collapses to one column.
- SEO: title, description, OG image, sitemap, robots, all editable in admin. Lighthouse 90+ in all categories.

### 2.2 Home sections (each can be shown/hidden)
1. **Banner:** looping GIF, 760 × 100 via ImageKit; placeholder fallback.
2. **Profile header:** photo, name, tagline, location, Resume button when a resume is uploaded.
3. **About:** heading, rich-text paragraphs, footnote line.
4. **Contact links:** Message me (opens contact form), GitHub, LinkedIn, X. Empty links aren't rendered.
5. **GitHub heatmap:** real data by username, cached 6–12 h, admin toggle and username; hidden if the fetch fails.
6. **Projects (featured):** only featured projects; cover, status badge, name, description, tech tags, GitHub and live buttons, View details.
7. **Tech Stack:** chips from the admin skills list.
8. **Let's talk:** heading, subtext, button that opens the contact form.
9. **Footer:** editable copyright text.

### 2.3 `/projects`
All published projects (featured or not), same card design, optional filter by tech tag and status. Hidden projects never appear.

### 2.4 `/projects/[slug]`
Cover and status badge · name, short and long (markdown) description · screenshot gallery with lightbox · tech tags linked to skills · live and GitHub links · previous/next and back to projects · per-project SEO (falls back to cover image).

### 2.5 Contact form
Fields: name, email, subject (optional), message. Client and server validation; honeypot plus rate limit (3 per IP per hour). On submit: save to MongoDB, email the admin, show success. If email fails, the message is still saved and flagged `emailFailed` for retry.

## 3. Admin panel (`/admin`, protected by middleware and server-side session checks)
### 3.1 Authentication
Email + password login · single account, bcrypt · signed JWT in a secure HTTP-only cookie · auto-logout on inactivity · login rate limiting and lockout · change password and admin email in settings.

### 3.2 Dashboard and analytics
Date range (7 / 30 / 90 days, custom). Widgets: page views and unique visitors vs previous period · views over time · top pages · top referrers · countries · devices, browsers, OS · click tracking (GitHub, LinkedIn, X, live links, project GitHub links, contact button, resume downloads) · per-project views and clicks · contact conversions · recent activity and unread count.

**How it works:** a tiny client component beacons `/api/track` on route change and tracked clicks. An event stores type, path, referrer, country, device, browser, OS, timestamp and a daily-rotating hashed visitor ID (IP + user agent + salt). No cookies, no raw IPs. Bots filtered; admin visits excluded. Dashboard uses aggregation pipelines; TTL index removes raw events after 12–24 months.

### 3.3 Section visibility
List of all home sections (Banner, Profile, About, Contact links, GitHub heatmap, Projects, Tech Stack, Let's talk) with on/off toggles, applied immediately via revalidation. Drag-to-reorder applies to the home page and the side index.

### 3.4 Skills
Add (name, icon from library or ImageKit upload, optional category, display order), edit, delete, reorder, show/hide. Skills render under Tech Stack and are reused as tags in the project form.

### 3.5 Projects
Create, edit, delete, reorder.
| Field | Type | Notes |
|---|---|---|
| Name | string | Required |
| Slug | string | Auto-generated, unique, editable |
| Short description | string | Cards, max ~160 chars |
| Long description | markdown | Details page |
| Cover image | ImageKit | Cards |
| Screenshots | multiple ImageKit | Reorderable gallery |
| Live link / GitHub link | URL | Optional |
| Tech used | multi-select from skills | Tags |
| Status | Ongoing / Completed | |
| Featured on portfolio | boolean | Home page only |
| Published | boolean | Drafts hidden everywhere |
| Order | number | Display order |
| SEO | optional | Title, description, OG image |

Rules: Featured = home and `/projects` · Not featured = `/projects` only · Unpublished = admin only. List view has search, filters (status/featured/published) and quick toggles.

### 3.6 Banner
Client-side upload to ImageKit via a server-signed endpoint · preview before saving · 760 × 100 guidance warning · size limit (e.g. 5 MB) · replace, remove or revert to placeholder.

### 3.7 Profile and content editor
Name, tagline, location, photo, about, footnote, footer text, resume (PDF) · social links (email, GitHub, LinkedIn, X) · GitHub username and heatmap toggle · "Let's talk" heading and subtext.

### 3.8 Messages
List (name, email, subject, preview, date, read/unread) · full view with mark read/unread, archive, delete, reply (mailto) · search and filters (unread, archived) · unread badge in the sidebar · configurable notification email.

### 3.9 Settings
Site title, description, OG image, favicon · notification email · maintenance mode (public sees a simple message, admin keeps working) · JSON export of projects, skills, messages and settings.

### 3.10 Media library
Browse every ImageKit upload (banner, photo, resume, covers, screenshots) with thumbnail, size, date and usage · delete unused files (files in use are protected with a warning) · copy URL · pick from the library in any image field.

## 4. Data model, API, environment
See `ARCHITECTURE.md`. Environment variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GMAIL_USER`, `GITHUB_TOKEN`, `ANALYTICS_SALT`.

## 5. Non-functional
Security: input validation everywhere, CSRF-safe auth, rate limiting, sanitised markdown, security headers, secrets in env · Privacy: no analytics cookies, no raw IPs · Performance: static/ISR public pages, lazy images, small first-load JS · Accessibility: WCAG AA, keyboard nav, alt text, reduced-motion for the GIF · Reliability: fallbacks for GitHub, ImageKit, email · Maintainability: JavaScript throughout (JSDoc where useful), shared Zod schemas.

## 6. Release plan
**Phase 1 (MVP):** public home, projects, details · admin auth, projects CRUD with featured/published toggles, skills CRUD, section toggles, banner upload · contact form with DB save, email and inbox · first-party analytics with core widgets · GitHub heatmap with toggle, profile editor with resume, SEO settings, section reordering.
**Phase 2:** media library, drag-to-reorder projects, click-tracking breakdowns, data export, maintenance mode.
**Future:** notes/blog, resume download tracking, testimonials, scheduled publish, weekly analytics email.

## 7. Success metrics
Admin can update any content and see it live in under a minute, no redeploy · home loads under 2 s on mid-range mobile · every contact submission stored and ≥ 99% trigger an email · dashboard loads under 2 s for a 30-day range.

## 8. Open questions
Vercel vs Netlify · Cloudflare Turnstile later? · single banner or one per theme.
