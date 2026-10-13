import { getDb } from "@/lib/db/client.js";
import { findAllInterestImages } from "@/lib/db/collections/interestImages.js";
import { ensureInterestImagesSection } from "@/lib/db/collections/sections.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import { MAX_INTEREST_IMAGES } from "@/lib/schemas/interestImage.js";
import InterestImagesManager from "@/components/admin/InterestImagesManager";

export const metadata = { title: "Admin — Interest images" };

/**
 * Admin Interest images (task spec §4.1-4.3) — not built from a Figma
 * frame (the task spec says so explicitly: "Not yet designed in Figma:
 * the admin panel screens"), so this follows the written spec and this
 * admin section's existing conventions (SkillsManager/ProjectsTable)
 * instead.
 */
export default async function AdminInterestImagesPage() {
  const db = await getDb();
  // Self-heals the `sections` toggle row for a DB that predates this
  // feature — see `ensureInterestImagesSection`'s own docs.
  await ensureInterestImagesSection(db);
  const items = serializeDocs(await findAllInterestImages(db));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">
            Interest images
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Scattered margin decoration on the home page, desktop only · {items.length} / {MAX_INTEREST_IMAGES}
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

      <InterestImagesManager items={items} max={MAX_INTEREST_IMAGES} />
    </div>
  );
}
