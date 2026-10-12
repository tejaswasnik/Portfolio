import { getDb } from "@/lib/db/client.js";
import { findAllSections } from "@/lib/db/collections/sections.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import SectionsManager from "@/components/admin/SectionsManager";

export const metadata = { title: "Admin — Sections" };

/** Admin Sections (Figma 67:836). */
export default async function AdminSectionsPage() {
  const db = await getDb();
  const sections = serializeDocs(await findAllSections(db));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">
            Sections
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Show, hide and reorder home-page sections · changes save instantly
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

      <SectionsManager sections={sections} />
    </div>
  );
}
