import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { serializeDoc } from "@/lib/db/serialize.js";
import SettingsManager from "@/components/admin/SettingsManager";

export const metadata = { title: "Admin — Settings" };

/** Admin Settings (Figma 71:7). */
export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const settings = await getSiteSettings(session.db);

  return (
    <SettingsManager settings={serializeDoc(settings)} adminEmail={session.user.email} />
  );
}
