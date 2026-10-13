# Design System — Portfolio "Field Notes" (v2)

> Covers the **public site, the contact modal, utility pages and the admin panel**. Source of truth is the Figma file *Portfolio V2* (`KxTn1qYG7kzoGVYjbQM5Vh`); frame IDs are in `figma-map.md`. Where this file and Figma disagree, Figma wins. Where the PRD and Figma disagree on scope, the PRD wins.

A dark, editorial, blueprint-flavoured portfolio. A single narrow content column sits between dashed "drafting" rails, with serif headings, monospace annotations, and one soft sage accent. Everything is quiet, low-contrast, and precise.

---

## 1. Principles

1. **One column, lots of air.** All content lives in a 760px column; the rest of the canvas is empty ruled space.
2. **Drafting-table aesthetic.** Dashed rails, `+` crosshair marks at intersections, hatched section dividers, mono "annotation" captions.
3. **Serif for voice, mono for metadata, sans for reading.**
4. **One accent.** Sage green `#B5D4BF` is used for state, emphasis, and affordance. Project previews are the only place with saturated colour.
5. **Hierarchy through luminance, not size.** Three text greys do most of the work.

---

## 2. Color

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#090A0B` | Page background, contact-item background, inset icon wells |
| `--surface-1` | `#0F1113` | Project card background |
| `--surface-2` | `#101214` | Banner upload area, avatar, mockup summary tiles |
| `--surface-3` | `#1A1D20` | Chips, action buttons, icon containers, empty heatmap cell |
| `--surface-chip` | `#0E0F10` | Skill chips (dashed) |
| `--surface-icon-alt` | `#16191B` | Secondary contact icon containers |
| `--border-subtle` | `#1E2226` | Card borders, contact row rules and partitions |
| `--border-default` | `#2E3337` | Chip / button / label borders, dashed CTA border |
| `--border-icon` | `#232729` | Secondary icon container border |
| `--border-mockup` | `#272A2D` | Mockup frame, mockup skeleton lines |
| `--border-chip-dashed` | `#272727` | Skill chip dashed border |
| `--rail` | `#9F9FA9` @ 20% | Dashed rails and section dividers |
| `--rail-node` | `#9F9FA9` @ 70% | Crosshair intersections |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#ECEEED` | Headings, name, active nav, labels |
| `--text-secondary` | `#ACB2B0` | Body copy, role, icons, inactive contact labels |
| `--text-muted` | `#737B79` | Annotations, captions, inactive nav, location, arrows |
| `--text-chip-muted` | `#A1A1A1` | Skill chip labels and monochrome logos |

### Accent

| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#B5D4BF` | Initials, "Message me", orbit dot, active index, live-link arrow, CTA arrows, highest heatmap level, status label (Ongoing) |

### Contribution heatmap ramp (5 levels)

`#1A1D20` → `#28342C` → `#3B5142` → `#6A8973` → `#B5D4BF`

### Inverse (CTA)

| Token | Hex |
|---|---|
| `--cta-bg` / border | `#ECEEED` |
| `--cta-text` | `#090A0B` |

### Project preview gradients (content-specific)

| Project | Gradient (90deg) |
|---|---|
| Purple | `#3B2F8C 0%` → `#5B4FCF 45%` → `#7B6AE0 100%` |
| Amber | `#D65C05 0%` → `#E8A814 55%` → `#CF4D05 100%` |

### Brand logo colours (only in project stack pills)

Next.js `#000` / `#FFF` · TypeScript `#3178C6` / `#FFF` · PostgreSQL `#336791` · React `#61DAFB`.
In the Stack section all logos are desaturated to greys (`#A1A1A1`, `#4B4B4B`, `#232323`, etc.).

---

## 3. Typography

### Families

| Role | Family | Notes |
|---|---|---|
| Display / headings | **Instrument Serif** | Regular 400 only |
| Body / UI | **Inter** | 400, 500, 600 |
| Annotation / meta | **JetBrains Mono** | Use JetBrains Mono for **all** mono text in code. The original home frame also mixes in IBM Plex Mono (nav, upload copy, months, mockup text); treat those as JetBrains Mono. |

### Scale

| Style | Font | Size / Line | Weight | Tracking | Colour | Used for |
|---|---|---|---|---|---|---|
| Name | Instrument Serif | 38 / 38 | 400 | -0.025em | primary | Profile name |
| Section title (large) | Instrument Serif | 30 / 36 | 400 | +0.025em | primary | Unused: all section titles are 24 |
| CTA title | Instrument Serif | 32 / 40 | 400 | 0 | primary | "Let's talk." (centered) |
| Section title | Instrument Serif | 24 / 32 | 400 | +0.025em | primary | "About", "Projects", "Stack" |
| Card title | Instrument Serif | 22 / 29 | 400 | 0 | primary | Project names |
| Avatar initials | Instrument Serif | 30 / 39 | 400 | 0 | accent | "TW" |
| Logo mark | Instrument Serif | 20 / 26 | 400 | +0.025em | primary | "TW." |
| Body | Inter | 14.5 / 24 (162.5%) | 400 | 0 | secondary | About copy, CTA subtitle (163%) |
| Card body | Inter | 13 / 21 (162.5%) | 400 | 0 | secondary | Project description |
| Contact label | Inter | 13 / 18 | 600 | 0 | accent (Message me) / secondary (others) | Contact row |
| Skill chip | Inter | 14 / 20 | 400 | 0 | `#A1A1A1` | Stack chips |
| CTA label | Inter | 14 / 17 | 500 | +0.005em | `#090A0B` | "Let's Talk" |
| Mockup heading | Inter | 10 / 12 | 500 | 0 | primary | Inside app mockups |
| Role | JetBrains Mono | 13 / 20 | 400 | 0 | secondary | "Developer & curious maker." |
| Location | JetBrains Mono | 11 / 16 | 400 | 0 | muted | "Your location" |
| Nav link | JetBrains Mono | 11 / 14 | 400 | 0 | primary (active) / muted | Nav |
| Annotation | JetBrains Mono | 11 / 16 | 400 | 0 | muted | "Usually found with a notebook…" |
| Upload title | JetBrains Mono | 11 / 14 | 500 | 0 | primary | "Upload GIF banner" |
| Caption | JetBrains Mono | 10 / 15 | 400 | 0 | muted | Calendar caption, colophon, upload hint |
| Stack pill | JetBrains Mono | 10 / 15 | 400 | 0 | primary | Technology pills in cards |
| Button label | JetBrains Mono | 11 / 15 | 700 | 0, UPPERCASE | primary | "VIEW DETAILS" |
| Status tag | JetBrains Mono | 8 / 11 | 700 | UPPERCASE | accent (Ongoing) / primary (Completed) | Card category label |
| Month label | JetBrains Mono | 9 / 14 | 400 | 0 | muted | Heatmap months |
| Legend text | JetBrains Mono | 9 / 14 | 400 | 0 | muted | "Less / More" |
| Index label | JetBrains Mono | 9 / 24 | 400 | +0.2em | muted | "INDEX" |
| Index entry | JetBrains Mono | 10 / 20 | 400 | 0 | accent (active) / muted | Side index |
| Avatar annotation | JetBrains Mono | 8 / 10 | 400 | 0 | muted | "YOUR PHOTO" |

---

## 4. Spacing & Layout

### Canvas

- Design width **1440px**, total height ~1932px, centered.
- **Content column: 760px** wide (x = 340 → 1100), horizontally centered.
- **Column padding: 24px** → inner content width **712px**.
- Nav row and "Editorial column" both use the same 760 column.

### Spacing scale (observed)

`2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 24 · 32 · 56`

| Context | Value |
|---|---|
| Section vertical padding | 24px (standard), 56px 24px (footer CTA) |
| Gap between heading and content | 24px (about, activity), 32px (projects), 16px (skills) |
| Paragraph gap | 12px |
| Card padding | 16px, internal gap 16px |
| Card grid gap | 16px (two equal columns, 348px each) |
| Chip gap | 6px (project pills), 8px (skill chips) |
| Identity row | padding 24, gap 24 |

### Section map (top to bottom)

| Section | Height | Notes |
|---|---|---|
| Navigation | 64 | Sits above first dashed divider |
| Profile (banner + identity) | 309 | Banner 157, identity 152 |
| About | 265 | Heading, two paragraphs, personal note |
| Contact row | 68 | Four equal cells with 1px partitions |
| Activity (heatmap) | 203 | |
| Projects | 539 | Two-column card grid |
| Stack | 176 | Wrapping chip grid |
| Connect + footer | 308 | Centered CTA + colophon |

### Radius

| Token | Value | Used on |
|---|---|---|
| `--r-xs` | 1px | Heatmap cells |
| `--r-sm` | 3px | Status tag |
| `--r-md` | 6px | Skill chips, action buttons, mockup frame |
| `--r-lg` | 8px | Banner, icon containers, dashed button |
| `--r-xl` | 10px | Project preview |
| `--r-2xl` | 12px | Project cards, avatar |
| `--r-pill` | 20px / 100px | Stack pills / CTA |
| Circle | 50% | Upload icon (32px) |

---

## 5. Signature Decorative System

These "blueprint" elements give the page its character. Keep them subtle.

### Dashed rails
- **Vertical rails** at x = 340 and x = 1100, running the full page height (starting at y=64). `1px dashed #9F9FA9`, opacity **0.2**.
- **Horizontal dividers** span the full 1440px width at each section boundary. Same dashed style, opacity 0.2.
- Divider y-positions: 64, 373, 638, 706, 909, 1448, 1624, 1931.5.

### Crosshair intersections
Where a rail meets a divider, draw a **`+` mark**:
- Backdrop square 14×14 filled `--bg` (to break the dashed lines).
- Horizontal stroke 10px × 1px, vertical stroke 10px × 1px, `#9F9FA9` at **70%** opacity.
- Positions: centered on x = 340 and x = 1100.
- Section-level 16px crosses (`cross-h` / `cross-v`, 16×1 and 1×16) also appear at the top-left/right of each section (at x = 332/340 and 1092/1100). In the footer section these are 20% opacity.

### Section divider (hatching)
- 12px-tall, full-width strip (`Fine hatching`) at the top of each section. Render as a subtle diagonal-line pattern, low contrast (e.g. `repeating-linear-gradient(135deg, #1E2226 0 1px, transparent 1px 4px)` is a good starting point; the Figma export didn't include the fill).

### Orbit point
- A 6×6 `#B5D4BF` dot floating in the banner (right side, ~x 687, y 47). Intended as a tiny animated accent.

---

## 6. Components

### 6.1 Navigation
- Height 64, inner width 760, padding `0 24px`, `justify-content: space-between`.
- **Left:** identity mark "TW." (Instrument Serif 20).
- **Right:** links (gap 24): `Home` (primary, active), `Projects` (muted), 1×16 separator, 16px sun icon (theme toggle, stroke `#ACB2B0`, 1px).
- Mono 11px for links.

### 6.2 Banner upload area
- 742×138 inside a 760 column, `--surface-2`, radius 8.
- Centered stack, gap 12, padding 16.
- 32px circle (`--bg`) with 16px upload icon (2px stroke `#ACB2B0`).
- Title: "Upload GIF banner" (mono 11/500). Hint: "Reserved for a looping GIF image · 760 × 100" (mono 10, muted).
- Placeholder state for a 760×100 looping GIF.

### 6.3 Identity (profile header)
- Row, padding 24, gap 24, vertically centered.
- **Avatar:** 104×104, `--surface-2`, radius 12, initials "TW" (serif 30, accent), tiny annotation "YOUR PHOTO" (mono 8, muted) at the bottom.
- **Text stack** (gap 8): Name (serif 38) → Role (mono 13, secondary) → Location (mono 11, muted).

### 6.4 About
- Heading "About" (serif 24).
- Two paragraphs (Inter 14.5/24, secondary), gap 12.
- **Personal note:** 14px coffee icon (1px stroke secondary) + annotation (mono 11, muted), gap 8.

### 6.5 Contact row
- Full-width row bounded by 1px `#1E2226` rules above and below; inner 760 column.
- Four **equal-width cells** (`flex: 1`, ~189px, height 66), each `padding: 0 20px; gap: 10; justify-content: center`, background `--bg`, separated by 1px × 66 partitions `#1E2226`.
- **Icon container:** 32×32, radius 8, 1px border.
  - Primary (Message me): bg `#1A1D20`, border `#2E3337`, icon `#B5D4BF`.
  - Secondary (GitHub, LinkedIn, Twitter): bg `#16191B`, border `#232729`, icon `#ACB2B0`.
- **Label:** Inter 13/600. Primary = accent; others = secondary.
- External links append a 14px **arrow-up-right** (1px stroke, muted).
- Icons are 16px (Twitter 14px).

### 6.6 Contribution calendar
- Months row: 6 labels (APR → SEP), mono 9, muted, `space-between`.
- Grid: **51 week columns × 7 day rows**, cells **10×10**, gap **4px**, radius 1.
- 5-level ramp (see Color). Highest level (`#B5D4BF`) is used sparingly as highlights.
- Caption row (`space-between`): left "A season of building · Sample contribution data" (mono 10, muted); right legend: "Less" + five 8×8 squares + "More" (mono 9, gap 4).
- Section gap 10 between months, grid, caption.

### 6.7 Project card
- Width 348 (flex 1 of 2), padding 16, gap 16, bg `--surface-1`, border `1px #1E2226`, radius 12.
- **Preview** (316×200, radius 10, gradient background, isolated stacking):
  - **Status tag** top-left (12,12): padding `4px 8px`, bg `#1A1D20`, 1px `#2E3337`, radius 3; text mono 8/700 uppercase. "Ongoing" = accent; "Completed" = primary.
  - **App mockup** (276×150 at 20,36): bg `--bg`, 1px `#272A2D`, radius 6.
    - Window bar 24px: three 4×4 muted squares + mono 7px title (e.g. "workspace / overview").
    - Body: 58px sidebar (accent brand marker 14×5, nav bars 3px tall: first `#ACB2B0`, rest `#272A2D`) + main view (padding 12).
    - Variant A (dashboard): heading, three summary tiles (`#101214`, muted bar + mono 11 value), line chart (1.5px accent stroke).
    - Variant B (editor): heading, accent mono metadata (6px), 5 skeleton lines (3px, `#272A2D`), editor hint (mono 7, muted).
- **Details** (gap 12):
  - Title row: name (serif 22) + actions (gap 6).
  - **Actions:** two 28×28 buttons, bg `#1A1D20`, 1px `#2E3337`, radius 6. GitHub icon (`#ECEEED`, 14px) and live-link arrow-up-right (`#B5D4BF`).
  - Description (Inter 13/21, secondary, ~2 lines).
  - **Stack pills** (wrap, gap 6): height 25, padding `5px 8px`, gap 5, bg `#1A1D20`, 1px `#2E3337`, radius 20. 14px brand logo (optional) + mono 10 label (primary).
- **View details button:** full width, height 35, padding `10px 14px`, gap 8, **1px dashed `#2E3337`**, radius 8. Label mono 11/700 uppercase + 14px arrow-right (2px accent stroke).

### 6.8 Tech stack chips
- Wrap row, gap 8.
- Chip: height 28, padding `4px 12px 4px 8px`, gap 6, bg `#0E0F10`, **1px dashed `#272727`**, radius 6.
- 14px monochrome logo + Inter 14 label, colour `#A1A1A1`.
- Items: TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Git, Figma.

### 6.9 Connect / footer
- Padding `56px 24px`, gap 24, centered.
- Heading "Let's talk." (serif 32, centered), subtitle (Inter 14.5/24, secondary).
- **CTA:** pill, 145×45, padding `14px 32px`, bg and border `#ECEEED`, text `#090A0B` Inter 14/500 with +0.005em tracking, trailing arrow.
- Colophon: "© 2026 Tejas Wasnik · Built with care." (mono 10, muted, centered).

### 6.10 Side index (floating)
- Absolutely positioned at **left 1120, top 360** (just outside the right rail), width ~96. Intended as a sticky scroll-spy.
- Label "INDEX" (mono 9, +0.2em tracking, muted).
- Entries: About, Contact, Activity (heatmap), Projects, Stack. Each row 20px tall, gap 8, begins with a 16×1 indicator.
  - **Active:** indicator `#B5D4BF`, label accent.
  - **Inactive:** indicator transparent (`opacity: 0`), label muted.

---

## 7. Iconography

- Style: **outline icons** (Lucide-style), 16px default, 14px in compact contexts.
- Stroke: 1px for UI icons; 2px for upload, arrow-right, twitter (emphasis).
- Icons used: `sun`, `upload`, `coffee`, `mail`, `github`, `linkedin`, `twitter`, `arrow-up-right`, `arrow-right`.
- Colour follows the text token of its context (secondary by default, muted for trailing arrows, accent for primary affordances).

---

## 8. Interaction & States (suggested — not in the static design)

| Element | Hover | Active / Focus |
|---|---|---|
| Nav link | muted → primary | accent underline or primary text |
| Contact cell | bg `#0F1113` | 1px accent outline inset |
| Project card | border `#2E3337` | — |
| Action buttons | bg `#232729`, border `#3A4045` | accent focus ring (2px, offset 2) |
| View details button | border → `#B5D4BF` at 50%, arrow translates 2px right | |
| CTA | bg `#FFFFFF`, arrow nudges right | focus ring accent |
| Skill chip | border solid, text → secondary | — |
| Side index | label → secondary | active tracks scroll position |
| Orbit dot | slow circular drift or pulse | |

Transitions: `150–200ms ease-out`. Respect `prefers-reduced-motion`.

---

## 9. Theming

Dark is default; the nav toggle (sun icon) switches to light. Both use the **same token names** (see §13 for light values). Set `data-theme` on `<html>` before paint, persist in `localStorage`, default to `prefers-color-scheme`. Rails, hatching and crosshairs keep the same structure in both themes.

---

## 10. Responsive Guidance (suggested)

| Breakpoint | Behaviour |
|---|---|
| ≥ 1200 | As designed; side index visible |
| 768–1199 | Column `min(760px, 100% - 48px)`; hide side index; rails move to column edges |
| < 768 | Column padding 16; project cards stack to one column; contact row becomes 2×2 grid; heatmap scrolls horizontally or shows last ~26 weeks; identity row stacks (avatar above text); hide crosshair details beyond the main column edges |

---

## 11. CSS Token Starter

```css
:root {
  /* surfaces */
  --bg: #090A0B;
  --surface-1: #0F1113;
  --surface-2: #101214;
  --surface-3: #1A1D20;
  --surface-chip: #0E0F10;
  --surface-icon-alt: #16191B;

  /* borders */
  --border-subtle: #1E2226;
  --border-default: #2E3337;
  --border-icon: #232729;
  --border-mockup: #272A2D;
  --border-chip-dashed: #272727;
  --rail: rgb(159 159 169 / 0.2);
  --rail-node: rgb(159 159 169 / 0.7);

  /* text */
  --text-primary: #ECEEED;
  --text-secondary: #ACB2B0;
  --text-muted: #737B79;
  --text-chip: #A1A1A1;

  /* accent */
  --accent: #B5D4BF;

  /* heatmap */
  --heat-0: #1A1D20;
  --heat-1: #28342C;
  --heat-2: #3B5142;
  --heat-3: #6A8973;
  --heat-4: #B5D4BF;

  /* type */
  --font-serif: 'Instrument Serif', serif;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;

  /* layout */
  --column: 760px;
  --gutter: 24px;

  /* radius */
  --r-xs: 1px; --r-sm: 3px; --r-md: 6px; --r-lg: 8px;
  --r-xl: 10px; --r-2xl: 12px; --r-pill: 100px;
}
```

---

## 12. Public pages

All public pages share the shell: 64px nav, 760 column with 24px padding, dashed rails at x = 340 / 1100, 12px hatched dividers, crosshairs at every rail × divider crossing, then the "Let's talk" + footer block. Frames: `figma-map.md`.

### 12.1 Projects (`/projects`)
- Header: title "Projects" (serif 48/52), caption "Everything I have published · N projects" (mono 11 muted).
- **Filter pills:** row 1 tech tags (All, Next.js, React, TypeScript, Node.js, PostgreSQL), row 2 "STATUS" label + All / Ongoing / Completed. Pill height 28, padding 0 12, radius 100, mono 10–11. Inactive: 1px `--border-default`, muted text. Active: 1px accent-tinted border, `--text-primary`, fill `--surface-3`.
- Grid: project cards (§6.7), two columns, 16 gap, last odd card sits left. Footnote below (mono 10 muted): "Unpublished drafts never appear here. Featured projects also show on the home page."
- Preview gradients rotate through purple, amber, teal, blue, green, rose (see §14).

### 12.2 Project details (`/projects/[slug]`)
1. Header: "← All projects" and route caption (mono 11 muted), title (serif 40) + status badge, short description (Inter 14.5), buttons: **Visit live site** (CTA pill) and **View on GitHub** (dashed mono).
2. Cover: full-width gradient preview with status tag, same mockup as the card, scaled up (rounded 16).
3. About this project: serif 24 heading, body paragraphs, "Highlights" (serif 18) as dash-bulleted list, pull quote with 2px accent left rule (serif 18).
4. Screenshots: heading + "N images · click to enlarge" caption, 2×2 grid of preview tiles with caption row ("01 · Editor") and an expand icon. Click opens the lightbox (not yet designed: dim overlay `rgb(0 0 0 / .8)`, centered image, prev/next, close, Esc, focus trap).
5. Tech used: serif 24 heading, skill chips (§6.8).
6. Pager: two cards, "← PREVIOUS" / "NEXT →" mono 10 muted above the project name (serif 18); full-width dashed "BACK TO PROJECTS" button below.

### 12.3 Contact modal (form and sent states)
- Overlay: `rgb(0 0 0 / 0.7)` over the dimmed page.
- Panel: 520 wide, padding 32, gap 20, `--surface-1`, 1px `--border-default`, radius 16, centered vertically.
- Header: "Let's talk." serif 36 + "ESC ✕" mono 11 muted. Intro Inter 14/22 secondary.
- Fields: label mono 11 uppercase muted (+ "(OPTIONAL)" for subject); input 44 high, `--bg` fill, 1px `--border-default`, radius 8, padding 12/14, placeholder muted; message textarea 120 high. Focus: border `--accent`.
- Submit: full-width CTA pill, 44 high. Footnote (mono 10 muted): honeypot + rate-limit notice.
- **Sent state:** 48px circular check mark (accent), "Message sent." serif 36, Inter 14 confirmation, Close button.
- Error: field-level message mono 11 in a warm error colour (§14), rate-limit message at the top of the form.

### 12.4 Maintenance (`/maintenance` served for all public routes)
Logo-only nav; centered column: dashed pill "MAINTENANCE MODE" (mono 11), "Back soon." serif 80/88, body Inter 16/26 secondary (max 460 wide), mono "— TW." signature. No footer.

### 12.5 404
Centered: "ERROR 404" mono 11 chip colour, "404" serif 140 `--text-muted`, "This page wandered off." serif 40, body Inter 16 secondary, buttons **Go home** (CTA pill) and **VIEW PROJECTS** (dashed mono pill), then the standard Let's talk + footer.

## 13. Light theme tokens

Derived from the light home frames (`28:34991`, `28:35385`, `28:35765`). Confirm against Figma when building; keep the token names identical.

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#090A0B` | `#F7F8F5` |
| `--surface-1` (cards) | `#0F1113` | `#FFFFFF` |
| `--surface-3` (chips, buttons) | `#1A1D20` | `#ECEFEB` |
| `--border-subtle` | `#1E2226` | `#E2E7E0` |
| `--border-default` | `#2E3337` | `#CED5CE` |
| `--text-primary` | `#ECEEED` | `#171C19` |
| `--text-secondary` | `#ACB2B0` | `#424E47` |
| `--text-muted` | `#737B79` | `#56625B` |
| `--accent` | `#B5D4BF` | `#356047` |
| heat 1 → 4 | `#28342C` … `#B5D4BF` | `#D1DFD1`, `#9DBA9E`, `#698F72`, `#356047` |
| CTA bg / text | `#ECEEED` / `#090A0B` | `#171C19` / `#F7F8F5` |

Light mode keeps the saturated project preview gradients unchanged; the mockup inside stays dark.

## 14. Extra colours (outside the original palette)

| Token | Value | Use |
|---|---|---|
| Gradient teal | `#0F6B5C → #2BB5A0 → #1E8F7E` | Project preview |
| Gradient blue | `#1E3A8A → #3B6FD9 → #60A5FA` | Project preview |
| Gradient green | `#14532D → #22A559 → #4ADE80` | Project preview |
| Gradient rose | `#7F1D3A → #D6457A → #F472A8` | Project preview (screenshots) |
| `--danger` | `#E5827A` | Errors, delete actions, "EMAIL FAILED" tag text (dark); `#B3392F` (light) |
| `--warning` | `#D9B26A` | Warnings such as banner size guidance (dark); `#8A6420` (light) |

Danger/warning backgrounds are the colour at 12% opacity with a 1px border at 30%. Never use them for decoration.

## 15. Admin panel

Frames are 1440 wide; mobile and tablet behaviour is specified in §23. Same tokens, fonts and dashed/hatched language as the public site, but denser.

### 15.1 Shell
- **Sidebar** 240 wide, `--bg`, right edge dashed rail. Top: "TW." logo + "ADMIN" tag (mono 9, 1px border, accent text). Groups with mono 10 uppercase muted headings: **Overview** (Dashboard, Messages + unread badge), **Content** (Projects, Skills, Profile & About, Banner, Media library), **Site** (Sections, Settings). Item: height 34, padding 0 10, icon 16 + Inter 13 label. Active: `--surface-3` fill, 1px `--border-subtle`, primary text. Bottom: signed-in card (avatar "TW", "Admin", "Signed in · owner", sign-out icon).
- **Topbar** 56: breadcrumb (mono 11: `ADMIN / SECTION / ITEM`, last segment primary) left, **VIEW SITE ↗** secondary button right. Hatched divider underneath.
- **Page header:** title serif 40/44, caption mono 11 muted, actions right-aligned (secondary mono buttons; primary = CTA pill style at 36 high).
- **Content:** padding `24 32 32 32`, vertical gap 16, max width fills the 1200 main area.

### 15.2 Cards and panels
Card: `--surface-1`, 1px `--border-subtle`, radius 12, padding 20. Header row: serif 20 title left, mono 10 uppercase muted hint right. Two-column forms: 2fr / 1fr with 16 gap; right column holds Publish, Cover image and Screenshots cards.

### 15.3 Form controls
- Label: mono 10 uppercase muted, 6px above field.
- Input: height 40, `--bg` fill, 1px `--border-default`, radius 8, padding 0 12, Inter 14. Focus: 1px `--accent` border (no glow). Disabled: 50% opacity. Suffix hint (mono 10 muted) inside the field, e.g. "UNIQUE · EDITABLE".
- Textarea: min 80 high. Markdown editor: toolbar (B, I, H2, LINK, CODE, QUOTE, LIST mono 10 buttons), WRITE / PREVIEW segmented control, body in mono 12/20.
- Select: input style + chevron. Segmented control (status, filters): 1px `--border-default` container, radius 8, active segment `--surface-3` with primary text, mono 10 uppercase.
- **Toggle:** 36×20 pill. Off: `--surface-3`. On: `--accent` at 30% fill, 1px accent border, accent knob. Always paired with a label and a one-line helper (Inter 12 muted).
- Tag input (tech used): chips with ✕, plus dashed "+ Add from skills".
- Dropzone: dashed 1px `--border-default`, radius 10, upload icon, "Drop a file or browse", constraints in mono 10 muted. Uploaded state shows thumbnail with REPLACE / REMOVE buttons.

### 15.4 Buttons
| Type | Spec |
|---|---|
| Primary | Pill, 36 high, `--cta-bg`, `--cta-text`, Inter 13/500 |
| Secondary | Radius 8, 32 high, `--surface-3`, 1px `--border-default`, mono 10–11 uppercase |
| Dashed | 1px dashed `--border-default`, radius 8, mono 10 uppercase; used for add and delete-style actions |
| Icon | 28×28 (or 32), `--surface-3`, 1px `--border-default`, radius 6 |
| Danger | Dashed or secondary with `--danger` text and border at 30% |

### 15.5 Tables and lists
Container: card with radius 12. Header row: mono 10 uppercase muted, 36 high. Rows: 52–64 high, 1px `--border-subtle` separators, hover `--surface-2`. Leading status dot (6px accent = unread/published), 36px circular avatar with serif initials, two-line cell (title Inter 13/600 + sub-line mono 10 muted), flags as small tags, relative date in mono 11, row actions as icon buttons. Read rows use secondary text; archived rows drop to 50% opacity with an "ARCHIVED" tag.

### 15.6 Page specifics
- **Login:** centered 400 card, logo, email + password, primary button, footnote. Error state: danger-tinted banner above the form and danger border on the field.
- **Dashboard:** date-range segmented control (7D / 30D / 90D / CUSTOM); KPI tiles (value serif 32, delta chip with accent/danger text); views-over-time line chart (accent 1.5px stroke, `--heat-0` grid, no fill); ranked lists with proportional bars (`--heat-2`); click-tracking table; activity feed with mono timestamps. Charts use the heatmap ramp and accent only.
- **Projects list:** search input, filter segments (status / featured / published), table with drag handle, cover thumb, name, status, two quick toggles, order, actions. Drafts show a "DRAFT" tag.
- **Edit / New project:** see §15.2–15.3. Slug auto-generates on name entry until edited. Delete sits in the Publish card as a dashed danger button with confirmation.
- **Skills:** list of rows (drag handle, icon tile, name, category tag, visibility toggle, edit/delete) with an add form inline at the top.
- **Sections:** ordered list with drag handles, section name, helper text, toggle; hidden sections dim to 60%; note that the order also drives the side index.
- **Banner:** 760×100 preview on a hatched surface, REPLACE / REMOVE / REVERT TO PLACEHOLDER, size and ratio guidance (warning style when off-ratio).
- **Profile & About:** stacked cards (Identity, About, Contact links, Heatmap, Let's talk, Footer, Resume); social URL fields with the platform icon as prefix.
- **Messages:** see §15.5. Search + ALL / UNREAD / ARCHIVED segments, "MARK ALL READ".
- **Message detail:** two columns: message card (sender, subject serif 24, body Inter 14/24, metadata mono) and an actions card (mark read/unread, archive, reply via mailto, delete, retry email if `emailFailed`).
- **Settings:** grouped cards: SEO (title, description, OG image, favicon), Notifications, Maintenance mode (toggle with warning), Security (change password, change email), Data export (JSON).
- **Media library:** toolbar (search, type filter, sort), thumbnail grid (4 columns), tile shows name, size, date and "Used in …"; unused files expose Delete, in-use files show a lock and a warning. Copy URL on hover.

### 15.7 Admin states
Every list needs an **empty state** (mono caption + one dashed action), a **loading skeleton** (`--surface-3` bars, 1.5s opacity pulse, off under reduced motion) and an **error state** (danger-tinted card with retry). Destructive actions open a confirmation dialog (same panel style as the contact modal, 440 wide, danger button).

## 16. Responsive and motion

- Public: follow §10 and the home variants at 1280 / 768 / 375 (both themes). New public pages use the same rules: column `min(760px, 100% − 48px)`, rails at column edges below 1200, hide the side index below 1200, cards single column below 768, modal full-width with 16px margin below 520.
- Admin: responsive, see §23 (no Figma frames; rules only).
- Motion: 150–200ms ease-out for hover/focus; modal fades and scales 0.98 → 1 over 180ms; no parallax. Respect `prefers-reduced-motion` everywhere, including the banner GIF (show first frame) and the orbit dot.

## 17. Accessibility

- Text contrast AA in both themes; muted text (`--text-muted`) is annotation only, never the sole carrier of meaning.
- Visible focus ring on every interactive element: 2px `--accent`, 2px offset.
- Toggles, segmented controls and the lightbox expose correct roles (`switch`, `radiogroup`, `dialog` with focus trap and Esc).
- Icon-only buttons need `aria-label`; images need alt text; status is never colour-only (always a text label).

## 18. Content rules

- Brand: logo "TW.", name "Tejas Wasnik". No Notes/blog anywhere in v1.
- Section names: About, Contact, Activity, Projects, Stack, Let's talk.
- Figma sample content (Workspace, Fieldnote, Orbit Analytics, message senders, numbers) is placeholder; real data comes from the database.
- Voice: short, quiet, lower-key sentences; mono captions are annotations ("A season of building · Sample contribution data"), not marketing.

## 19. Known gaps

Lightbox, admin empty/loading/error/confirm states, Figma frames for the responsive admin (rules in §23), light variants of the new public pages and the admin panel, and the 1440 home's email-copy row and "Open to" line (present in the 1280 home). Build these from this file using existing tokens and list them as "designed by me" when done.

## 20. Skill icons

- Icons come from the `simple-icons` npm package, stored on the skill as `iconSlug` (e.g. `javascript`, `react`, `nextdotjs`, `nodedotjs`, `mongodb`, `tailwindcss`, `html5`, `css`). Render as inline SVG using the icon's `path` (24×24 viewBox), size 14, `fill="currentColor"`.
- **Stack section chips:** monochrome, `--text-chip` (hover: `--text-secondary`).
- **Project-card pills and admin rows:** monochrome by default; brand colours only where §2 "Brand logo colours" allows (Next.js, TypeScript, PostgreSQL, React).
- Fallback when a slug is missing or unknown: a 14px rounded tile with the first letter of the skill name in mono 9 (never a blank gap).
- Admin icon picker: search field + 6-column grid of matching icons (max 48 results) with the slug shown on hover; selecting fills the slug field. A custom upload (ImageKit, SVG/PNG) is an alternative and stores `iconUrl`.
- Icon slug field accepts lowercase letters, digits and hyphens, up to 40 characters. It is never limited to 3 characters.

## 21. Toasts (action feedback)

Every completed action shows a toast. No silent successes, no silent failures.

- **Position:** bottom-left, 16px from the edges (24px ≥ 1024). On < 640 they span the width at the bottom with 12px margins and respect `env(safe-area-inset-bottom)`.
- **Anatomy:** 320–400 wide (max), padding 12/14, `--surface-1`, 1px `--border-default`, radius 10, soft shadow `0 8px 24px rgb(0 0 0 / .35)`. Leading 16px icon (check = accent, alert = `--danger`, info = `--text-secondary`), message Inter 13/18 primary, optional mono 10 muted detail line, optional text action ("UNDO"), close ✕ icon button.
- **Behaviour:** newest at the bottom of the stack, max 3 visible; auto-dismiss after 4s (errors 8s, or until closed); pause on hover and focus; swipe or click ✕ to dismiss.
- **Motion:** slide up 8px + fade, 180ms ease-out; none under `prefers-reduced-motion` (fade only).
- **A11y:** container `aria-live="polite"` (`role="status"`); error toasts use `role="alert"`; focusable close button with `aria-label`.
- **Messages (sentence case, past tense, specific):**

| Action | Toast |
|---|---|
| Image / file uploaded | "Image uploaded" · "Resume uploaded" · "Banner updated" |
| Save any form | "Changes saved" |
| Create | "Project created" · "Skill added" |
| Delete | "Project deleted" (with UNDO where feasible) · "Skill deleted" |
| Toggle (featured, published, visible, section, maintenance) | "Project published" · "Section hidden" · "Maintenance mode on" |
| Reorder | "Order saved" |
| Messages | "Marked as read" · "Message archived" · "Message deleted" |
| Utility | "URL copied" · "Export ready" |
| Failure | "Couldn't save changes" + reason ("Network error. Try again.") · "Upload failed" + reason ("File is over 5 MB") |
| Login | "Signed out" |

- Upload progress shows inside the dropzone; the toast appears on completion only.

## 22. Responsive rules, public pages

Frames exist for the home page at 768 and 375 (dark and light): `28:34292`, `28:34672`, `28:35385`, `28:35765` (see `figma-map.md`). Implement those exactly. For pages without a frame, apply the same rules:

| Breakpoint | Rules |
|---|---|
| ≥ 1200 | Desktop as designed; side index visible |
| 768–1199 | Column `min(760px, 100% − 48px)`; no side index; rails sit at the column edges; project grid stays 2 columns on `/projects` |
| < 768 | Column padding 16; rails hug the viewport edge with 16px inset; nav keeps logo + links + theme toggle in one row; identity row stacks (avatar above text); contact row becomes a 2×2 grid; heatmap shows the last ~26 weeks or scrolls horizontally with the months row; project cards single column; filter pills scroll horizontally in one row; details-page buttons stack full width; screenshots grid 1 column; pager cards stack; headings scale (Projects title 48 → 36, project title 40 → 32, 404 numeral 140 → 96, "Back soon." 80 → 56) |
| < 520 | Contact modal becomes a full-width bottom sheet (margin 16, max-height 90vh, inner scroll) |

Never allow horizontal page scroll. Minimum touch target 44×44 for links and buttons (the visual size can stay smaller if the hit area is padded).

## 23. Responsive rules, admin panel

No Figma frames yet. Build to these rules.

| Breakpoint | Rules |
|---|---|
| ≥ 1280 | As designed: 240 sidebar, content up to 1200 |
| 1024–1279 | Sidebar stays (collapse to 72px icon rail if the content gets tight); two-column forms keep 2fr/1fr but with 20px gaps |
| 768–1023 | Sidebar becomes an off-canvas drawer opened from a hamburger in the topbar (overlay `rgb(0 0 0 / .6)`, 280 wide, focus trap, Esc closes, closes on route change); forms stack to one column with the Publish card first; tables stay but hide secondary columns |
| < 768 | Topbar: hamburger + breadcrumb truncated to the current page + "View site" as an icon. Content padding 16. Page header stacks (title above actions, actions wrap or become a full-width row). **Tables turn into stacked cards** (one card per row: title line, sub-line, tags, then toggles and actions in a bottom row). Filters and search become a full-width search plus horizontally scrolling segments. KPI tiles 2 columns, charts full width with horizontal scroll for dense axes. Forms single column, inputs 44 high, **sticky bottom save bar** (Save changes + Cancel) above the safe area. Dialogs and the icon picker open as bottom sheets. Media grid 2 columns. Message detail: actions card moves above the message |

- Drag-to-reorder must work with touch (pointer/touch sensors, long-press to start) and also offer **up/down buttons** on every sortable row for keyboard and small screens.
- Toasts follow §21 on mobile.
- Never let a table or form cause horizontal page scroll; if a table must scroll, wrap only that table.
