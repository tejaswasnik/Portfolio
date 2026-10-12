# Figma map

File: **Portfolio V2** · key `KxTn1qYG7kzoGVYjbQM5Vh`
Link pattern: `https://www.figma.com/design/KxTn1qYG7kzoGVYjbQM5Vh/Portfolio-V2?node-id=<id with : replaced by ->`
Variables collection: **Field Notes — Tokens** (mirrors `design.md` §2).

The canvas is organised into four sections: *0 Inspiration*, *1 Public site*, *2 Home responsive & themes*, *3 Admin panel*.

## Public site (1440 desktop)

| Route / state | Figma frame | Node | Notes |
|---|---|---|---|
| `/` | Personal portfolio — Field notes | `5:5314` | Banner, profile, About, Contact links, Activity, Projects, Stack, Let's talk, side index |
| `/projects` | Public — Projects | `72:2` | Tag and status filters, 2-column grid, footnote |
| `/projects/[slug]` | Public — Project details | `72:436` | Cover, About, Highlights, Screenshots (lightbox), Tech used, prev/next |
| Contact form modal | Public — Contact form | `74:742` | Opened by "Message me" and "Let's Talk" |
| Contact success | Public — Contact sent | `74:1129` | Replaces the form after submit |
| Maintenance | Public — Maintenance | `74:2` | Logo-only nav; shown when maintenance mode is on |
| 404 | Public — 404 | `74:370` | Go home / View projects |

## Home — responsive and themes

| Variant | Dark | Light |
|---|---|---|
| 1280 | `28:33898` | `28:34991` |
| 768 | `28:34292` | `28:35385` |
| 375 | `28:34672` | `28:35765` |

Interaction states (hover, focus, active): `28:36084`.

## Admin

| Route | Figma frame | Node |
|---|---|---|
| `/admin/login` | Admin — Login | `57:2` |
| `/admin/login` (error) | Admin — Login (error) | `57:70` |
| `/admin` | Admin — Dashboard | `53:2` |
| `/admin/projects` | Admin — Projects | `65:11` |
| `/admin/projects/new` | Admin — New project | `66:700` |
| `/admin/projects/[id]` | Admin — Edit project | `66:9` |
| `/admin/skills` | Admin — Skills | `67:7` |
| `/admin/sections` | Admin — Sections | `67:836` |
| `/admin/banner` | Admin — Banner | `69:7` |
| `/admin/profile` | Admin — Profile & About | `69:612` |
| `/admin/messages` | Admin — Messages | `70:7` |
| `/admin/messages/[id]` | Admin — Message detail | `70:720` |
| `/admin/settings` | Admin — Settings | `71:7` |
| `/admin/media` | Admin — Media library | `71:646` |

Admin shell: 240px sidebar (Overview, Content, Site groups; unread badge on Messages; signed-in card) plus a topbar with breadcrumb and "View site".

## Known gaps (not designed yet)

- Project-details screenshot **lightbox** state.
- Admin: delete-confirmation dialogs, empty states, loading and error states, mobile layout (admin is desktop-only in v1).
- Responsive variants of Projects, Project details, Contact, 404 and Maintenance (follow the 768/375 rules in `design.md` §10 and the home variants).
- Light theme for the new public pages (use the home light variants as the token reference).
- The 1440 home lacks the email-copy row and "Open to" line that the 1280 home has; follow the 1280 version.

## Deliberate differences from `design.md`

`design.md` was written from the first home screenshot. The Figma frames and the PRD supersede it: logo is **TW.** (not YN.), there is **no Notes** link, headings read "About" and "Stack", and the side index reads About, Contact, Activity (GitHub heatmap), Projects, Stack.
