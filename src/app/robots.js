import { getSiteUrl } from "@/lib/site-url.js";

/** PRD 2.1: "robots, all editable in admin" — /admin and /api are kept out of the index. */
export default function robots() {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
