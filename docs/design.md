# Design System — Personal Portfolio "Field Notes"

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
In the Tech Stack section all logos are desaturated to greys (`#A1A1A1`, `#4B4B4B`, `#232323`, etc.).

---

## 3. Typography

### Families

| Role | Family | Notes |
|---|---|---|
| Display / headings | **Instrument Serif** | Regular 400 only |
| Body / UI | **Inter** | 400, 500, 600 |
| Annotation / meta | **IBM Plex Mono** and **JetBrains Mono** | Both appear in the file. Plex is used for nav, upload copy, calendar months, mockup text; JetBrains for role, location, captions, tags, buttons, index. *Recommendation: consolidate on one mono.* |

### Scale

| Style | Font | Size / Line | Weight | Tracking | Colour | Used for |
|---|---|---|---|---|---|---|
| Name | Instrument Serif | 38 / 38 | 400 | -0.025em | primary | Profile name |
| Section title (large) | Instrument Serif | 30 / 36 | 400 | +0.025em | primary | "Tech Stack" |
| CTA title | Instrument Serif | 32 / 40 | 400 | 0 | primary | "Let's talk." (centered) |
| Section title | Instrument Serif | 24 / 32 | 400 | +0.025em | primary | "A little about me", "Projects" |
| Card title | Instrument Serif | 22 / 29 | 400 | 0 | primary | Project names |
| Avatar initials | Instrument Serif | 30 / 39 | 400 | 0 | accent | "YN" |
| Logo mark | Instrument Serif | 20 / 26 | 400 | +0.025em | primary | "YN." |
| Body | Inter | 14.5 / 24 (162.5%) | 400 | 0 | secondary | About copy, CTA subtitle (163%) |
| Card body | Inter | 13 / 21 (162.5%) | 400 | 0 | secondary | Project description |
| Contact label | Inter | 13 / 18 | 600 | 0 | accent (Message me) / secondary (others) | Contact row |
| Skill chip | Inter | 14 / 20 | 400 | 0 | `#A1A1A1` | Tech Stack chips |
| CTA label | Inter | 14 / 17 | 500 | +0.005em | `#090A0B` | "Let's Talk" |
| Mockup heading | Inter | 10 / 12 | 500 | 0 | primary | Inside app mockups |
| Role | JetBrains Mono | 13 / 20 | 400 | 0 | secondary | "Developer & curious maker." |
| Location | JetBrains Mono | 11 / 16 | 400 | 0 | muted | "Your location" |
| Nav link | IBM Plex Mono | 11 / 14 | 400 | 0 | primary (active) / muted | Nav |
| Annotation | IBM Plex Mono | 11 / 16 | 400 | 0 | muted | "Usually found with a notebook…" |
| Upload title | IBM Plex Mono | 11 / 14 | 500 | 0 | primary | "Upload GIF banner" |
| Caption | JetBrains Mono | 10 / 15 | 400 | 0 | muted | Calendar caption, colophon, upload hint (Plex) |
| Stack pill | JetBrains Mono | 10 / 15 | 400 | 0 | primary | Technology pills in cards |
| Button label | JetBrains Mono | 11 / 15 | 700 | 0, UPPERCASE | primary | "VIEW DETAILS" |
| Status tag | JetBrains Mono | 8 / 11 | 700 | UPPERCASE | accent (Ongoing) / primary (Completed) | Card category label |
| Month label | IBM Plex Mono | 9 / 14 | 400 | 0 | muted | Heatmap months |
| Legend text | JetBrains Mono | 9 / 14 | 400 | 0 | muted | "Less / More" |
| Index label | JetBrains Mono | 9 / 24 | 400 | +0.2em | muted | "INDEX" |
| Index entry | JetBrains Mono | 10 / 20 | 400 | 0 | accent (active) / muted | Side index |
| Avatar annotation | IBM Plex Mono | 8 / 10 | 400 | 0 | muted | "YOUR PHOTO" |

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
| Tech Stack | 176 | Wrapping chip grid |
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
- **Left:** identity mark "YN." (Instrument Serif 20).
- **Right:** links (gap 24): `Home` (primary, active), `Projects`, `Notes` (muted), 1×16 separator, 16px sun icon (theme toggle, stroke `#ACB2B0`, 1px).
- Mono 11px for links.

### 6.2 Banner upload area
- 742×138 inside a 760 column, `--surface-2`, radius 8.
- Centered stack, gap 12, padding 16.
- 32px circle (`--bg`) with 16px upload icon (2px stroke `#ACB2B0`).
- Title: "Upload GIF banner" (mono 11/500). Hint: "Reserved for a looping GIF image · 760 × 100" (mono 10, muted).
- Placeholder state for a 760×100 looping GIF.

### 6.3 Identity (profile header)
- Row, padding 24, gap 24, vertically centered.
- **Avatar:** 104×104, `--surface-2`, radius 12, initials "YN" (serif 30, accent), tiny annotation "YOUR PHOTO" (mono 8, muted) at the bottom.
- **Text stack** (gap 8): Name (serif 38) → Role (mono 13, secondary) → Location (mono 11, muted).

### 6.4 About
- Heading "A little about me" (serif 24).
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
- Colophon: "© 2026 Your Name · Built with care." (mono 10, muted, centered).

### 6.10 Side index (floating)
- Absolutely positioned at **left 1120, top 360** (just outside the right rail), width ~96. Intended as a sticky scroll-spy.
- Label "INDEX" (mono 9, +0.2em tracking, muted).
- Entries: About, Contact, GitHub, Projects, Tools. Each row 20px tall, gap 8, begins with a 16×1 indicator.
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

The nav includes a theme toggle (sun icon), so a light theme is anticipated. Only the dark theme is specified. When building light mode, keep the same token names and invert the surface/text ramps, keeping the sage accent hue (darken for contrast on light backgrounds).

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

## 12. Notes & Inconsistencies to Resolve

- **Two mono fonts** (IBM Plex Mono + JetBrains Mono) are mixed with no clear rule — pick one.
- **Skill chip border** `#272727` and text `#A1A1A1` are off-palette greys; map to `--border-default` / `--text-secondary` if you want strict token purity.
- **Twitter** label/icon: the bird icon is shown; if rebranding to X, update icon and label.
- **Section title sizes:** "Tech Stack" is 30px while "Projects" and "A little about me" are 24px — likely unintentional.
- **Placeholder content** ("Your Name", "Your location", sample heatmap data, "Upload GIF banner") should be replaced with real data / a real GIF.
- **Hatching fill** wasn't exported; define it explicitly in code.
- The footer's "Let's Talk" CTA and the contact row's "Message me" duplicate intent — consider linking both to the same action.
