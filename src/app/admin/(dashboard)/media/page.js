import { getDb } from "@/lib/db/client.js";
import { findMedia } from "@/lib/db/collections/media.js";
import { getProfile } from "@/lib/db/collections/profile.js";
import { getSiteSettings } from "@/lib/db/collections/site-settings.js";
import { findAllProjects } from "@/lib/db/collections/projects.js";
import { serializeDoc, serializeDocs } from "@/lib/db/serialize.js";
import { annotateMediaUsage, filterMediaList, MEDIA_CATEGORY_OPTIONS } from "@/lib/media/usage.js";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import SegmentedFilter from "@/components/admin/SegmentedFilter";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import MediaCard from "@/components/admin/MediaCard";

export const metadata = { title: "Admin — Media library" };

/** @param {{ search?: string, category?: string }} current */
function buildFilterHref(current) {
  return (value) => {
    const params = new URLSearchParams();
    if (current.search) params.set("search", current.search);
    if (value && value !== "all") params.set("category", value);
    const query = params.toString();
    return query ? `/admin/media?${query}` : "/admin/media";
  };
}

/**
 * Admin Media library (Figma 71:646). Every file ImageKit has ever
 * received a `recordMediaUpload` call for, with live usage computed by
 * matching url against the real profile/siteSettings/projects documents
 * — see `src/lib/media/usage.js`.
 * @param {{ searchParams: Promise<Record<string, string>> }} props
 */
export default async function AdminMediaPage({ searchParams }) {
  const resolved = (await searchParams) ?? {};
  const search = resolved.search || "";
  const category = MEDIA_CATEGORY_OPTIONS.some((o) => o.value === resolved.category)
    ? resolved.category
    : "all";

  const db = await getDb();
  const [media, profile, siteSettings, projects] = await Promise.all([
    serializeDocs(await findMedia(db)),
    serializeDoc(await getProfile(db)),
    serializeDoc(await getSiteSettings(db)),
    serializeDocs(await findAllProjects(db)),
  ]);

  const annotated = annotateMediaUsage(media, { profile, siteSettings, projects });
  const filtered = filterMediaList(annotated, { search, category });

  const totalBytes = media.reduce((sum, file) => sum + (file.size || 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">
            Media library
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            {media.length} {media.length === 1 ? "file" : "files"} · {totalMb} MB on ImageKit ·
            pick from here in any image field
          </p>
        </div>
        <MediaUploadButton />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchInput
          basePath="/admin/media"
          placeholder="Search files…"
          label="Search files"
          width="w-64"
        />
        <SegmentedFilter
          options={MEDIA_CATEGORY_OPTIONS}
          activeValue={category}
          buildHref={buildFilterHref({ search, category })}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-default bg-surface-1 p-8 text-center font-mono text-[11px] text-text-muted">
          {media.length === 0
            ? "No files yet. Upload one, or uploads from Banner, Profile and Projects will show up here."
            : "No files match these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filtered.map((file) => (
            <MediaCard key={file.id} file={file} />
          ))}
        </div>
      )}

      <p className="font-mono text-[10px] text-text-muted">
        Files still in use are protected; deleting one shows a warning with where it is used. Copy
        a file URL or pick it from here instead of re-uploading.
      </p>
    </div>
  );
}
