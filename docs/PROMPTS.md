# Build prompts

Paste these into Claude Code one at a time, in order. Each assumes `CLAUDE.md` and `docs/` are already in the repo and the Figma MCP is connected. Finish and review one prompt before starting the next. Commit after each.

Figma file key: `KxTn1qYG7kzoGVYjbQM5Vh`. Node IDs are in `docs/figma-map.md`.

---

## 0. Scaffold
```
Read CLAUDE.md and everything in docs/. Then scaffold the project: Next.js (App Router) in plain JavaScript (create-next-app with --js, no TypeScript, add jsconfig.json with the @/ alias) + Tailwind + ESLint (next/core-web-vitals) + Prettier + Vitest, using npm (create-next-app with npm, keep package-lock.json). Add the folder structure from docs/ARCHITECTURE.md as empty folders with .gitkeep, a typed env loader that validates .env with Zod, security headers in next.config, and scripts for dev, build, lint and test. Add a GitHub Actions workflow running lint, test and build. Don't build any UI yet. Show me the final file tree and confirm npm run lint && npm test pass. Install only what the stack needs: mongodb, zod, jose, bcryptjs, nodemailer, imagekit, plus dev tooling.
```

## 1. Design tokens and theme
```
Implement the design system from docs/design.md in code. Use get_variable_defs on the Figma file (key KxTn1qYG7kzoGVYjbQM5Vh) to confirm token values. Create globals.css with all colour, radius, spacing and font tokens as CSS variables for both dark and light themes (light values come from the light home frames, 28:34991 / 28:35385 / 28:35765), wire them into tailwind.config.js, load Instrument Serif, Inter and JetBrains Mono with next/font, and add a no-flash theme toggle (data-theme on <html>, localStorage, system default). Then build the shared UI primitives from the Figma frames: Button (primary pill, dashed secondary, icon button), Chip (tech pill, dashed skill chip), Input/Textarea, Toggle, Dialog, hatched section divider, and the rails + crosshair page frame. Add a /dev/ui page that shows every primitive in both themes. No hard-coded hex values anywhere.
```

## 2. Database and schemas
```
Implement the data layer from docs/ARCHITECTURE.md: a cached Mongo client helper for serverless, collection helpers (JSDoc-annotated) on the official mongodb driver (no Mongoose) for users, siteSettings, profile, sections, skills, projects, messages, events, media and rateLimits, with the listed indexes (unique projects.slug, TTL on events and rateLimits) created by an ensureIndexes script, and one Zod schema per entity in src/lib/schemas shared by forms and API. Add a seed script that creates the default sections (Banner, Profile, About, Contact links, GitHub heatmap, Projects, Tech Stack, Let's talk), the single profile and siteSettings documents with the placeholder content shown in Figma, and sample skills and projects (Workspace, Fieldnote). Write unit tests for the Zod schemas and the project visibility query helpers (published / featured rules from the PRD).
```

## 3. Public home page
```
Build the public home page (/) to match Figma frame 5:5314, using get_design_context and get_screenshot on it first. Server components that read from the database through the helpers. Sections in the order and visibility stored in the sections collection: banner (placeholder when no GIF), profile header, About, contact links row (skip empty links), GitHub heatmap component (fetch contributions by username via GitHub GraphQL, revalidate every 6 hours, hide on failure), featured project cards (both preview variants from the design), tech stack chips, Let's talk, footer, nav (TW., Home, Projects, theme toggle) and the desktop-only side index with scroll-spy driven by the visible sections. Use tag-based caching. Make it responsive at 1280, 768 and 375 matching the Figma variants in both themes (nodes in docs/figma-map.md). Verify against screenshots at each width.
```

## 4. Projects pages
```
Build /projects (Figma 72:2) and /projects/[slug] (Figma 72:436). /projects lists all published projects with tag and status filters (URL search params, server-rendered). The details page renders markdown safely (sanitised), a screenshot gallery with an accessible lightbox (keyboard, focus trap, Esc to close; no Figma frame exists, so follow the design system), tech tags linked to skills, live and GitHub buttons, previous/next navigation, back to projects, and generateMetadata using the per-project SEO fields with cover-image fallback. Unpublished projects must return 404. Add tests for the visibility rules and slug lookup. Match both themes and the 768/375 widths using the home variants as reference.
```

## 5. Contact form
```
Build the contact flow from Figma frames 74:742 (form) and 74:1129 (sent state): a modal opened by the "Message me" contact cell and the "Let's Talk" button. Fields: name, email, optional subject, message, plus a hidden honeypot. Validate with the shared Zod schema on client and server. POST /api/contact: rate limit 3 per IP per hour using the Mongo-backed rateLimits collection with a TTL index (hash the IP, never store it raw), save the message first, then send the notification with Nodemailer using Gmail OAuth2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GMAIL_USER) to the notification email from siteSettings, in the Node runtime only; if sending fails keep the message and set emailFailed: true. Return clear errors for validation and rate limiting and show them in the modal. Add tests for validation, honeypot rejection, rate-limit and the email-failure path. Make the modal accessible (focus trap, Esc, aria labels).
```

## 6. Maintenance, 404, SEO
```
Build the maintenance page (Figma 74:2) and the 404 page (Figma 74:370). Middleware serves the maintenance page for public routes when siteSettings.maintenanceMode is true, while /admin keeps working. Add metadata, Open Graph, sitemap.xml (published projects included) and robots.txt, all driven by siteSettings. Add a favicon from the settings.
```

## 7. Auth and admin shell
```
Implement admin authentication and the shell. JWT auth with jose for a single admin user: bcryptjs password hashing, a signed HS256 JWT (about 30 min expiry, sliding on activity, includes users.tokenVersion) stored only in an HTTP-only, Secure, SameSite=Lax cookie, middleware that verifies it, and a requireAdmin() helper that re-verifies it and checks tokenVersion. Logout and password/email changes bump tokenVersion. Add login rate limiting with lockout after repeated failures (fields on users) and an Origin check for state-changing route handlers. Build /admin/login to match Figma 57:2 and the error state 57:70. Build the admin shell from Figma 53:2: 240px sidebar with the three groups, active state, unread-messages badge, signed-in card with sign-out, and the topbar with breadcrumb and "View site". Protect every /admin route in middleware AND with a server-side session check helper used by every server action and route handler. Add the seed:admin script. Test lockout, expired and tampered tokens, tokenVersion invalidation and the protection helper.
```

## 8. Admin content management
```
Build the admin content screens one at a time, each matching its Figma frame (IDs in docs/figma-map.md) and using server actions with Zod validation that call revalidateTag/revalidatePath: Projects list (search, filters, quick featured/published toggles) 65:11; New project 66:700 and Edit project 66:9 with markdown editor and preview, tech multi-select from skills, status, SEO fields, cover image and screenshots, delete with a confirmation dialog; Skills 67:7 with add/edit/delete/reorder/show-hide; Sections 67:836 with toggles and drag-to-reorder that updates the home page and side index; Profile & About 69:612 with all profile fields, resume upload, social links and heatmap settings. Do them in that order and stop for my review after each one.
```

## 9. Images: ImageKit and banner
```
Add ImageKit. Create /api/imagekit-auth (admin only) that signs upload tokens. Build a reusable Dropzone with client-side upload, preview, progress and error states, storing url and fileId so replaced files are deleted from ImageKit. Use it for the project cover and screenshots, profile photo, resume (PDF) and the banner. Build /admin/banner from Figma 69:7: preview, replace, remove, revert to placeholder, 760 × 100 guidance warning, 5 MB limit. Respect prefers-reduced-motion for the banner GIF on the public site.
```

## 10. Messages and settings
```
Build /admin/messages (Figma 70:7) and /admin/messages/[id] (Figma 70:720): list with search and unread/archived filters, unread badge, full view, mark read/unread, archive, delete (with confirmation) and reply via mailto, and a retry action for messages flagged emailFailed. Build /admin/settings (Figma 71:7): site title, description, OG image, favicon, notification email, change password, change admin email, maintenance toggle and JSON export of projects, skills, messages and settings. Test the export and the password change.
```

## 11. Analytics
```
Implement first-party analytics per docs/PRD.md section 3.2. A small client component sends a beacon to POST /api/track on route change and on tracked link clicks (GitHub, LinkedIn, Twitter, live links, project GitHub links, contact button, resume). The endpoint stores type, path, target, referrer, country (from geo headers), device, browser, OS and a daily-rotating hashed visitor ID (IP + user agent + ANALYTICS_SALT); no cookies, no raw IP; filter bots; skip events when the admin is signed in. Build the dashboard from Figma 53:2 with the date range selector (7/30/90/custom), comparison to the previous period, views-over-time line chart, top pages, referrers, countries, devices/browsers/OS, click breakdown, per-project stats, contact conversion and the recent activity feed, all via MongoDB aggregation pipelines. Test the hashing and the aggregations with fixture events.
```

## 12. Media library
```
Build /admin/media (Figma 71:646): grid of every ImageKit upload with thumbnail, size, date and where it's used (banner, project, profile). Delete unused files, block deletion of files in use with a warning, copy URL, and let any image field pick from the library instead of re-uploading. Keep the media collection in sync on every upload, replace and delete.
```

## 13. Polish and launch
```
Run a full quality pass: accessibility (axe on every page, keyboard navigation, contrast in both themes, alt text), Lighthouse 90+ on the home, projects and details pages, reduced-motion support, empty/loading/error states for every admin screen, graceful fallbacks for GitHub, ImageKit and email failures, and a check that nothing hard-codes colours or leaks secrets. Compare each page with its Figma frame at 1440, 1280, 768 and 375 and list every difference. Then write the Vercel deployment steps (env vars, Atlas network access, domain) into README.md and make sure npm run lint && npm test && npm run build all pass.
```

---

## Handy one-off prompts

**Match a single screen to Figma**
```
Open Figma node <ID> in file KxTn1qYG7kzoGVYjbQM5Vh with get_design_context and get_screenshot. Compare it with what we have at <route> at 1440 width and fix every visual difference (spacing, type, colours, borders, radius) using existing tokens and components only. List what you changed.
```

**Review before moving on**
```
Review the work since the last commit against docs/PRD.md and CLAUDE.md. Check the visibility rules, validation, auth protection, revalidation calls and accessibility. List problems by severity and fix the serious ones.
```

**Add a missing design**
```
There's no Figma frame for <screen>. Propose the layout using the existing components and tokens in docs/design.md, describe it in a short list, and wait for my approval before building it.
```
