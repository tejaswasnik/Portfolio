/**
 * One-off migration for fixes round 2, Fix 1: every skill's old `icon`
 * field (a free-text abbreviation, max 3 chars) becomes `iconSlug`, a
 * real simple-icons slug. Idempotent — a document that already has a
 * non-empty `iconSlug` is left untouched, so running this twice (or on
 * a database that was partly migrated by hand) is safe.
 *
 * Run with: npm run migrate:skill-icons
 */
import { getClient } from "../src/lib/db/client.js";
import { COLLECTIONS } from "../src/lib/db/collections/names.js";
import { getIconBySlug } from "../src/lib/icons/simpleIcons.js";

/**
 * Known `name` → simple-icons `slug` mappings, from the fix prompt plus
 * every default seeded skill. Checked before falling back to a
 * normalized guess (lowercase, non-alphanumerics stripped).
 */
const NAME_TO_SLUG = {
  javascript: "javascript",
  typescript: "typescript",
  react: "react",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  mongodb: "mongodb",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  html: "html5",
  css: "css",
  postgresql: "postgresql",
  postgres: "postgresql",
  git: "git",
  github: "github",
  figma: "figma",
  python: "python",
};

/** @param {string} value */
function normalize(value) {
  return value.trim().toLowerCase();
}

/** @param {string} value */
function slugify(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "");
}

/**
 * Maps one skill's old `icon`/`name` to a simple-icons slug, or `""`
 * when nothing resolves — the admin picker (Fix 2) can fill it in by
 * hand, and `SkillIcon` falls back to a letter tile in the meantime.
 * @param {{ name: string, icon?: string }} skill
 */
function resolveSlug(skill) {
  const candidates = [skill.icon, skill.name].filter(Boolean).map(normalize);

  for (const candidate of candidates) {
    if (NAME_TO_SLUG[candidate]) return NAME_TO_SLUG[candidate];
    if (getIconBySlug(candidate)) return candidate;
    const guess = slugify(candidate);
    if (guess && getIconBySlug(guess)) return guess;
  }
  return "";
}

async function migrate() {
  const client = await getClient();
  const db = client.db();
  const collection = db.collection(COLLECTIONS.skills);

  const skills = await collection.find({}).toArray();
  let migrated = 0;
  let skipped = 0;
  let unresolved = 0;

  for (const skill of skills) {
    if (skill.iconSlug) {
      skipped++;
      continue;
    }

    const iconSlug = resolveSlug(skill);
    if (!iconSlug) unresolved++;

    await collection.updateOne(
      { _id: skill._id },
      { $set: { iconSlug }, $unset: { icon: "" } },
    );
    migrated++;
    console.log(
      `${skill.name}: "${skill.icon ?? ""}" -> iconSlug "${iconSlug || "(none — pick one in the admin)"}"`,
    );
  }

  console.log(
    `\nDone. ${migrated} migrated (${unresolved} left without a match), ${skipped} already had iconSlug.`,
  );
  await client.close();
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to migrate skill icons:", error);
    process.exit(1);
  });
