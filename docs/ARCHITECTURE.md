# Architecture

## Overview
Next.js App Router app. Public pages are server components, statically rendered or ISR, with tag-based revalidation. The admin panel under `/admin` uses server actions and route handlers. MongoDB Atlas stores everything; ImageKit stores files; Nodemailer (Gmail OAuth2) sends the contact notification; the admin session is a signed JWT in an HTTP-only cookie.

## Folder structure
```
src/
  app/
    (public)/            page.tsx, projects/, projects/[slug]/, maintenance/, not-found.tsx
    admin/
      login/  (dashboard)/  projects/  skills/  sections/  banner/  profile/  messages/  settings/  media/
    api/
      track/  contact/  imagekit-auth/  admin/*
  components/
    ui/        buttons, chips, inputs, toggle, dialog, icons
    public/    nav, banner, profile, about, contact-row, heatmap, project-card, stack, cta, footer, side-index, contact-modal
    admin/     sidebar, topbar, data-table, forms, charts, dropzone
  lib/
    db/        client.ts (cached Mongo client), models/*
    schemas/   Zod schemas shared by forms and API
    auth/      JWT sign/verify (jose), cookie helpers, bcrypt, lockout, requireAdmin()
    analytics/ track client, hashing, aggregation pipelines
    imagekit/  signing, upload helpers, delete
    github/    contributions fetch + cache
    mail/      Nodemailer transport (Gmail OAuth2) + sendMail()
    rate-limit/ Mongo-backed limiter (rateLimits collection, TTL index)
  styles/      globals.css (tokens from design.md §11), tailwind.config.ts
middleware.ts  protects /admin/*, serves maintenance mode
```

## Data model (MongoDB)
| Collection | Fields |
|---|---|
| `users` | email, passwordHash, failedAttempts, lockedUntil, tokenVersion, createdAt |
| `rateLimits` | key (hashed), count, expiresAt (TTL) |
| `siteSettings` (1 doc) | title, description, ogImage, favicon, notificationEmail, maintenanceMode, footerText, githubUsername |
| `profile` (1 doc) | name, tagline, location, photoUrl, about (markdown), footnote, socialLinks, bannerUrl, bannerFileId, resumeUrl, resumeFileId, letsTalkHeading, letsTalkSubtext |
| `sections` | key, label, visible, order |
| `skills` | name, icon, category, visible, order |
| `projects` | name, slug, shortDescription, longDescription, coverImage, screenshots[], liveUrl, githubUrl, techIds[], status (ongoing/completed), featured, published, order, seo, createdAt, updatedAt |
| `messages` | name, email, subject, message, read, archived, emailFailed, ipHash, createdAt |
| `events` | type (view/click), path, target, referrer, country, device, browser, os, visitorHash, createdAt |
| `media` | fileId, url, name, type, size, usedIn, createdAt |

**Indexes:** unique `projects.slug` · `events.createdAt` + `events.path` · `messages.createdAt` · TTL on `events.createdAt` (12–24 months).

## Authentication (JWT)
- Login: validate with Zod, check lockout, verify bcrypt hash, then sign a JWT (`sub`, `ver` = `users.tokenVersion`, `exp` ≈ 30 min) and set it as an HTTP-only, Secure, SameSite=Lax cookie.
- Sliding expiry: re-issue the cookie on admin activity; no activity for the lifetime means the next request redirects to `/admin/login`.
- Verification: `middleware.ts` verifies the signature and expiry with `jose` (edge-safe); `requireAdmin()` re-verifies and checks `ver` against the database in every server action and route handler.
- Logout and "change password/email" bump `tokenVersion`, which invalidates all existing tokens (plain JWTs cannot be revoked otherwise).
- State-changing admin requests are also protected against CSRF (SameSite cookie plus an Origin check on route handlers).

## Visibility rules
- Published = visible anywhere. Unpublished = admin only.
- Featured = home page and `/projects`. Not featured = `/projects` only.
- Hidden sections are removed from the home page and the side index; section order drives both.

## API surface
| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/track` | none, bot-filtered | Store a view/click event |
| `POST /api/contact` | none, honeypot + rate limit | Validate, save, email, return success |
| `GET /api/imagekit-auth` | admin | Signed upload token |
| Admin CRUD | admin | Server actions or `/api/admin/*` for projects, skills, sections, profile, banner, messages, settings, media, export |

Admin mutations call `revalidateTag` / `revalidatePath`.

## Analytics
A small client component posts a beacon on route change and on tracked link clicks. Visitor ID is a hash of IP + user agent + a daily-rotating salt, so no cookies and no raw IPs are stored. Bots and the signed-in admin are excluded. The dashboard reads through aggregation pipelines for views, visitors, top pages, referrers, countries, devices, click targets, per-project stats and contact conversion.

## Integrations
- **ImageKit:** the server signs tokens (admin only); keep `fileId` so replaced files can be deleted.
- **GitHub heatmap:** server-side GraphQL fetch by username, revalidate every 6–12 hours, hide the section on failure.
- **Email:** Nodemailer using Gmail OAuth2 (client id, client secret, refresh token, sender address). Node runtime only. If sending fails, the message stays saved with `emailFailed: true` for retry.
- **Spam:** honeypot field plus a MongoDB-backed rate limit (3 per hashed IP per hour, TTL-expiring docs). Cloudflare Turnstile can be added later.

## Theming
CSS variables for all tokens; `data-theme="light|dark"` on `<html>` set before paint (no flash), stored in `localStorage`, defaulting to the system preference. Keep token names identical in both themes.

## Non-functional targets
Lighthouse 90+; home loads under 2 s on mid-range mobile; dashboard under 2 s for a 30-day range; WCAG AA; sanitised markdown rendering; security headers; secrets in env only.
