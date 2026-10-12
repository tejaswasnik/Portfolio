import { getPublicAllProjects } from "@/lib/db/cache";
import { getSiteUrl } from "@/lib/site-url.js";

/**
 * PRD 2.1: "sitemap ... all editable in admin" (site-wide, driven by
 * siteSettings indirectly via published projects). getPublicAllProjects
 * already fails closed (returns [] on a DB error), so a down/unseeded
 * database still yields a sitemap with just the static routes.
 */
export default async function sitemap() {
  const baseUrl = getSiteUrl();

  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const projects = await getPublicAllProjects();
  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: project.updatedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
