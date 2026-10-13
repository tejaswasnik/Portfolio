import Link from "next/link";
import { getDb } from "@/lib/db/client.js";
import { findAllProjects, filterAdminProjects } from "@/lib/db/collections/projects.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import { projectStatusValues } from "@/lib/schemas/project.js";
import SegmentedFilter from "@/components/admin/SegmentedFilter";
import ProjectSearchInput from "@/components/admin/ProjectSearchInput";
import ProjectsTable from "@/components/admin/ProjectsTable";
import { PlusIcon, ArrowUpRightIcon } from "@/components/ui/icons.jsx";

export const metadata = { title: "Admin — Projects" };

const statusOptions = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];
const featuredOptions = [
  { value: "any", label: "Any" },
  { value: "featured", label: "Featured" },
  { value: "not-featured", label: "Not featured" },
];
const publishedOptions = [
  { value: "any", label: "Any" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

/**
 * Builds the href for one segmented filter, keeping the other active
 * filters (and the search text) in place — same URL-driven pattern as
 * the public `/projects` page.
 * @param {Record<string, string | undefined>} current
 * @param {string} key
 */
function buildFilterHref(current, key) {
  return (value) => {
    const params = new URLSearchParams();
    const next = { ...current, [key]: value };
    for (const [paramKey, paramValue] of Object.entries(next)) {
      if (paramValue && paramValue !== "all" && paramValue !== "any") {
        params.set(paramKey, paramValue);
      }
    }
    const query = params.toString();
    return query ? `/admin/projects?${query}` : "/admin/projects";
  };
}

/**
 * Admin projects list (Figma 65:11). Reads every project directly from
 * the database (not the public cache, which only ever returns published
 * projects) so unpublished drafts show up here, per CLAUDE.md's
 * visibility rules.
 * @param {{ searchParams: Promise<Record<string, string>> }} props
 */
export default async function AdminProjectsPage({ searchParams }) {
  const resolved = (await searchParams) ?? {};
  const search = resolved.search || "";
  const status = projectStatusValues.includes(resolved.status) ? resolved.status : "all";
  const featured = ["featured", "not-featured"].includes(resolved.featured)
    ? resolved.featured
    : "any";
  const published = ["published", "draft"].includes(resolved.published)
    ? resolved.published
    : "any";

  const db = await getDb();
  const allProjects = serializeDocs(await findAllProjects(db));
  const filtered = filterAdminProjects(allProjects, { search, status, featured, published });

  const current = { search, status, featured, published };
  const filtersActive = Boolean(search) || status !== "all" || featured !== "any" || published !== "any";

  const publishedCount = allProjects.filter((p) => p.published).length;
  const featuredCount = allProjects.filter((p) => p.featured).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[28px] tracking-[-0.95px] text-text-primary sm:text-[38px]">Projects</h1>
          <p className="font-mono text-[11px] text-text-muted">
            {allProjects.length} {allProjects.length === 1 ? "project" : "projects"} ·{" "}
            {publishedCount} published · {featuredCount} featured
          </p>
        </div>
        <div className="flex items-start gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border-default bg-surface-3 px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-text-primary"
          >
            <ArrowUpRightIcon size={12} />
            Preview site
          </a>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 rounded-md border border-cta-bg bg-cta-bg px-3 py-[7px] font-mono text-[10px] font-bold uppercase text-cta-text"
          >
            <PlusIcon size={12} />
            New project
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ProjectSearchInput />
        <SegmentedFilter
          options={statusOptions}
          activeValue={status}
          buildHref={buildFilterHref(current, "status")}
        />
        <SegmentedFilter
          options={featuredOptions}
          activeValue={featured}
          buildHref={buildFilterHref(current, "featured")}
        />
        <SegmentedFilter
          options={publishedOptions}
          activeValue={published}
          buildHref={buildFilterHref(current, "published")}
        />
        <div className="flex-1" />
        <p className="font-mono text-[10px] text-text-muted">
          {filtersActive ? "Clear filters to reorder" : "Drag the handle to reorder"}
        </p>
      </div>

      <ProjectsTable
        key={`${search}:${status}:${featured}:${published}`}
        projects={filtered}
        reorderDisabled={filtersActive}
      />

      <p className="w-full font-mono text-[10px] text-text-muted">
        Unpublished projects are hidden everywhere on the public site and stay visible here only.
        Featured = home + /projects; not featured = /projects only.
      </p>
    </div>
  );
}
