import { getClient } from "../src/lib/db/client.js";
import { COLLECTIONS } from "../src/lib/db/collections/names.js";

// Default sections, per docs/PRD.md §2.2 and §3.3.
const sections = [
  { key: "banner", label: "Banner", visible: true, order: 0 },
  { key: "profile", label: "Profile", visible: true, order: 1 },
  { key: "about", label: "About", visible: true, order: 2 },
  { key: "contact-links", label: "Contact links", visible: true, order: 3 },
  { key: "github-heatmap", label: "GitHub heatmap", visible: true, order: 4 },
  { key: "projects", label: "Projects", visible: true, order: 5 },
  { key: "tech-stack", label: "Tech Stack", visible: true, order: 6 },
  { key: "lets-talk", label: "Let's talk", visible: true, order: 7 },
];

const profile = {
  name: "Tejas Wasnik",
  taglines: ["Building thoughtful, fast software."],
  location: "India",
  photoUrl: "",
  about:
    "I'm a developer who cares about clean, considered interfaces and the systems behind them.",
  footnote: "Currently open to new opportunities.",
  socialLinks: { email: "", github: "", linkedin: "", twitter: "" },
  bannerUrl: "",
  bannerFileId: "",
  resumeUrl: "",
  resumeFileId: "",
  letsTalkHeading: "Let's talk",
  letsTalkSubtext:
    "Have a project in mind or just want to say hi? I'd love to hear from you.",
};

const siteSettings = {
  title: "Tejas Wasnik",
  description: "Personal portfolio and project showcase.",
  ogImage: "",
  favicon: "",
  notificationEmail: "owner@example.com",
  maintenanceMode: false,
  footerText: `© ${new Date().getFullYear()} Tejas Wasnik.`,
  githubUsername: "",
};

const skills = [
  { name: "JavaScript", iconLibrary: "simple-icons", iconSlug: "javascript", category: "Language", visible: true, order: 0 },
  { name: "React", iconLibrary: "simple-icons", iconSlug: "react", category: "Framework", visible: true, order: 1 },
  { name: "Next.js", iconLibrary: "simple-icons", iconSlug: "nextdotjs", category: "Framework", visible: true, order: 2 },
  { name: "Node.js", iconLibrary: "simple-icons", iconSlug: "nodedotjs", category: "Runtime", visible: true, order: 3 },
  { name: "MongoDB", iconLibrary: "simple-icons", iconSlug: "mongodb", category: "Database", visible: true, order: 4 },
  { name: "Tailwind CSS", iconLibrary: "simple-icons", iconSlug: "tailwindcss", category: "Styling", visible: true, order: 5 },
];

const now = new Date();

// Sample projects named in the step 2 prompt.
const projects = [
  {
    name: "Workspace",
    slug: "workspace",
    shortDescription: "A focused workspace for managing daily tasks and notes.",
    longDescription: "## Workspace\n\nPlaceholder seed content — replace via the admin panel.",
    coverImage: "",
    screenshots: [],
    liveUrl: "",
    githubUrl: "",
    techIds: [],
    status: "completed",
    featured: true,
    published: true,
    order: 0,
    seo: {},
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Fieldnote",
    slug: "fieldnote",
    shortDescription: "A minimal note-taking app with offline-first sync.",
    longDescription: "## Fieldnote\n\nPlaceholder seed content — replace via the admin panel.",
    coverImage: "",
    screenshots: [],
    liveUrl: "",
    githubUrl: "",
    techIds: [],
    status: "ongoing",
    featured: true,
    published: true,
    order: 1,
    seo: {},
    createdAt: now,
    updatedAt: now,
  },
];

async function seed() {
  const client = await getClient();
  const db = client.db();

  await db.collection(COLLECTIONS.sections).deleteMany({});
  await db.collection(COLLECTIONS.sections).insertMany(sections);

  await db.collection(COLLECTIONS.profile).deleteMany({});
  await db.collection(COLLECTIONS.profile).insertOne(profile);

  await db.collection(COLLECTIONS.siteSettings).deleteMany({});
  await db.collection(COLLECTIONS.siteSettings).insertOne(siteSettings);

  await db.collection(COLLECTIONS.skills).deleteMany({});
  await db.collection(COLLECTIONS.skills).insertMany(skills);

  await db
    .collection(COLLECTIONS.projects)
    .deleteMany({ slug: { $in: projects.map((project) => project.slug) } });
  await db.collection(COLLECTIONS.projects).insertMany(projects);

  await client.close();
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed:", error);
    process.exit(1);
  });
