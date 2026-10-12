import { unstable_cache } from "next/cache";
import { getDb } from "./client.js";
import { getProfile } from "./collections/profile.js";
import { getSiteSettings } from "./collections/site-settings.js";
import { findVisibleSections } from "./collections/sections.js";
import { findVisibleSkills } from "./collections/skills.js";
import { findPublicProjects } from "./collections/projects.js";
import { serializeDoc, serializeDocs } from "./serialize.js";

/**
 * Tag names admin mutations revalidate with `revalidateTag` (steps 7-12).
 * Keep this the single source of truth for tag spelling so reads and
 * writes never drift apart.
 */
export const CACHE_TAGS = {
  profile: "profile",
  siteSettings: "settings",
  sections: "sections",
  skills: "skills",
  projects: "projects",
};

const cachedProfile = unstable_cache(
  async () => serializeDoc(await getProfile(await getDb())),
  ["public-profile"],
  { tags: [CACHE_TAGS.profile] },
);

const cachedSiteSettings = unstable_cache(
  async () => serializeDoc(await getSiteSettings(await getDb())),
  ["public-site-settings"],
  { tags: [CACHE_TAGS.siteSettings] },
);

const cachedVisibleSections = unstable_cache(
  async () => serializeDocs(await findVisibleSections(await getDb())),
  ["public-visible-sections"],
  { tags: [CACHE_TAGS.sections] },
);

const cachedVisibleSkills = unstable_cache(
  async () => serializeDocs(await findVisibleSkills(await getDb())),
  ["public-visible-skills"],
  { tags: [CACHE_TAGS.skills] },
);

const cachedFeaturedProjects = unstable_cache(
  async () =>
    serializeDocs(await findPublicProjects(await getDb(), { featuredOnly: true })),
  ["public-featured-projects"],
  { tags: [CACHE_TAGS.projects] },
);

const cachedAllPublicProjects = unstable_cache(
  async () => serializeDocs(await findPublicProjects(await getDb(), {})),
  ["public-all-projects"],
  { tags: [CACHE_TAGS.projects] },
);

/**
 * Every exported getter below fails closed: if the database is
 * unreachable (no MONGODB_URI yet, connection error, etc.) it returns
 * `null`/`[]` instead of throwing, so a page section can render its
 * empty state instead of crashing the whole page. A failure is never
 * cached — only the `try` body is wrapped by `unstable_cache`, so the
 * next request retries the real query rather than replaying a miss.
 */

export async function getPublicProfile() {
  try {
    return await cachedProfile();
  } catch {
    return null;
  }
}

export async function getPublicSiteSettings() {
  try {
    return await cachedSiteSettings();
  } catch {
    return null;
  }
}

export async function getPublicVisibleSections() {
  try {
    return await cachedVisibleSections();
  } catch {
    return [];
  }
}

export async function getPublicVisibleSkills() {
  try {
    return await cachedVisibleSkills();
  } catch {
    return [];
  }
}

export async function getPublicFeaturedProjects() {
  try {
    return await cachedFeaturedProjects();
  } catch {
    return [];
  }
}

export async function getPublicAllProjects() {
  try {
    return await cachedAllPublicProjects();
  } catch {
    return [];
  }
}
