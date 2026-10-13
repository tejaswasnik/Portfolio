/**
 * Maps a `sections` collection key to the DOM id each section actually
 * renders and its side-index label (figma-map.md "Deliberate
 * differences": About, Contact, Activity, Projects, Stack —
 * banner/profile/lets-talk don't get their own index entries, matching
 * the Figma side index's five rows). Shared by the public home page
 * (`src/app/(public)/page.js`, building the real `SideIndex`) and the
 * admin Sections screen (`67:836`, building a live preview of it).
 */
export const SECTION_INDEX_META = {
  about: { id: "about", label: "About" },
  "contact-links": { id: "contact", label: "Contact" },
  "github-heatmap": { id: "activity", label: "Activity" },
  projects: { id: "projects", label: "Projects" },
  "tech-stack": { id: "stack", label: "Stack" },
};

/**
 * Short supporting copy for each section, shown under its name in the
 * admin Sections list (Figma 67:836). Static — `sectionSchema` has no
 * description field, and the PRD doesn't ask for one; this is "Designed
 * by me" explanatory text, not stored data (see docs/PROGRESS.md).
 */
export const SECTION_DESCRIPTIONS = {
  banner: "Looping GIF · 760 × 100",
  profile: "Photo, name, tagline, resume button",
  about: "Rich text and footnote line",
  "contact-links": "Message me, GitHub, LinkedIn, Twitter",
  "github-heatmap": "Contributions for the saved username · cached 6–12 h",
  projects: "Featured projects only",
  "tech-stack": "Skill chips from the skills list",
  "lets-talk": "Heading, subtext and button",
  "interest-images": "Scattered margin decoration · desktop only, overlay (not drag-reorderable)",
};
