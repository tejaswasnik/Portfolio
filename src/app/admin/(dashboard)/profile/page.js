import { getDb } from "@/lib/db/client.js";
import { getProfile } from "@/lib/db/collections/profile.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { findAllSections } from "@/lib/db/collections/sections.js";
import { serializeDoc } from "@/lib/db/serialize.js";
import ProfileAboutForm from "@/components/admin/ProfileAboutForm";

export const metadata = { title: "Admin — Profile & About" };

/** Admin Profile & About (Figma 69:612). */
export default async function AdminProfilePage() {
  const db = await getDb();
  const [profile, siteSettings, sections] = await Promise.all([
    getProfile(db),
    getSiteSettings(db),
    findAllSections(db),
  ]);

  const heatmapSection = sections.find((section) => section.key === "github-heatmap");

  return (
    <ProfileAboutForm
      profile={serializeDoc(profile)}
      siteSettings={serializeDoc(siteSettings)}
      heatmapSection={heatmapSection ? serializeDoc(heatmapSection) : null}
    />
  );
}
