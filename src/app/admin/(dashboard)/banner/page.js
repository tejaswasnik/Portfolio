import { getDb } from "@/lib/db/client.js";
import { getProfile } from "@/lib/db/collections/profile.js";
import { serializeDoc } from "@/lib/db/serialize.js";
import BannerManager from "@/components/admin/BannerManager";

export const metadata = { title: "Admin — Banner" };

/** Admin Banner (Figma 69:7). */
export default async function AdminBannerPage() {
  const db = await getDb();
  const profile = await getProfile(db);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">Banner</h1>
          <p className="font-mono text-[11px] text-text-muted">
            Looping GIF shown above the profile header · uploaded straight to ImageKit
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
        >
          Preview site
        </a>
      </div>

      <BannerManager profile={serializeDoc(profile)} />
    </div>
  );
}
