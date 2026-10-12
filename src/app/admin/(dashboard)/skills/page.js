import { getDb } from "@/lib/db/client.js";
import { findAllSkills, filterAdminSkills } from "@/lib/db/collections/skills.js";
import { serializeDocs } from "@/lib/db/serialize.js";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import SegmentedFilter from "@/components/admin/SegmentedFilter";
import SkillsManager from "@/components/admin/SkillsManager";
import SkillIcon from "@/components/ui/SkillIcon";
import { resolveSkillIcon } from "@/lib/icons/resolveSkillIcon.js";

export const metadata = { title: "Admin — Skills" };

/**
 * Builds the href for the category segmented filter, keeping the search
 * text in place — same URL-driven pattern as the Projects toolbar.
 * @param {Record<string, string | undefined>} current
 */
function buildFilterHref(current) {
  return (value) => {
    const params = new URLSearchParams();
    const next = { ...current, category: value };
    if (next.search) params.set("search", next.search);
    if (next.category && next.category !== "all") params.set("category", next.category);
    const query = params.toString();
    return query ? `/admin/skills?${query}` : "/admin/skills";
  };
}

/**
 * Admin Skills (Figma 67:7). Reads every skill directly from the
 * database (admin needs hidden skills too, not just the public
 * Tech-Stack-visible subset).
 * @param {{ searchParams: Promise<Record<string, string>> }} props
 */
export default async function AdminSkillsPage({ searchParams }) {
  const resolved = (await searchParams) ?? {};
  const search = resolved.search || "";

  const db = await getDb();
  const allSkills = serializeDocs(await findAllSkills(db));

  const categories = [...new Set(allSkills.map((s) => s.category).filter(Boolean))].sort();
  const category = categories.includes(resolved.category) ? resolved.category : "all";

  const filtered = filterAdminSkills(allSkills, { search, category }).map((skill) => ({
    ...skill,
    iconNode: <SkillIcon {...resolveSkillIcon(skill)} size={16} />,
  }));
  const filtersActive = Boolean(search) || category !== "all";

  const categoryOptions = [{ value: "all", label: "All" }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">Skills</h1>
          <p className="font-mono text-[11px] text-text-muted">
            {allSkills.length} {allSkills.length === 1 ? "skill" : "skills"} ·{" "}
            {allSkills.filter((s) => s.visible).length} visible · reused as tags in the project
            form
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchInput
          basePath="/admin/skills"
          placeholder="Search skills…"
          label="Search skills"
          width="w-64"
        />
        <SegmentedFilter
          options={categoryOptions}
          activeValue={category}
          buildHref={buildFilterHref({ search, category })}
        />
        <div className="flex-1" />
        <p className="font-mono text-[10px] text-text-muted">
          {filtersActive ? "Clear filters to reorder" : "Drag the handle to reorder"}
        </p>
      </div>

      <SkillsManager
        key={`${search}:${category}`}
        skills={filtered}
        totalCount={allSkills.length}
        categories={categories}
        reorderDisabled={filtersActive}
      />
    </div>
  );
}
