import PageFrame from "@/components/ui/PageFrame";
import SectionDivider from "@/components/ui/SectionDivider";
import Nav from "@/components/public/Nav";
import ProjectCard from "@/components/public/ProjectCard";
import ProjectFilters from "@/components/public/ProjectFilters";
import LetsTalkSection from "@/components/public/LetsTalkSection";
import { filterProjectsByTagAndStatus } from "@/lib/db/collections/projects.js";
import { projectStatusValues } from "@/lib/schemas/project.js";
import {
  getPublicAllProjects,
  getPublicVisibleSkills,
  getPublicProfile,
  getPublicSiteSettings,
} from "@/lib/db/cache";

export const metadata = {
  title: "Projects — Tejas Wasnik",
  description: "Everything I have published.",
};

/**
 * Builds the query string for a filter link, keeping the other active
 * filter in place (PRD 2.3: tag and status filters are independent,
 * URL search params, server-rendered).
 * @param {{ tag?: string, status?: string }} current
 * @param {'tag' | 'status'} key
 */
function buildFilterHref(current, key) {
  return (value) => {
    const next = { ...current, [key]: value };
    const params = new URLSearchParams();
    if (next.tag) params.set("tag", next.tag);
    if (next.status) params.set("status", next.status);
    const query = params.toString();
    return query ? `/projects?${query}` : "/projects";
  };
}

/** @param {{ searchParams: Promise<{ tag?: string, status?: string }> }} props */
export default async function ProjectsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const tag = resolvedSearchParams?.tag || undefined;
  const status = projectStatusValues.includes(resolvedSearchParams?.status)
    ? resolvedSearchParams.status
    : undefined;

  const [allProjects, skills, profile, siteSettings] = await Promise.all([
    getPublicAllProjects(),
    getPublicVisibleSkills(),
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  const usedSkillIds = new Set(allProjects.flatMap((project) => project.techIds));
  const tagOptions = [
    { value: "", label: "All" },
    ...skills
      .filter((skill) => usedSkillIds.has(skill.id))
      .map((skill) => ({ value: skill.id, label: skill.name })),
  ];
  const statusOptions = [
    { value: "", label: "All" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  const projects = filterProjectsByTagAndStatus(allProjects, { tag, status });

  return (
    <PageFrame>
      <Nav active="projects" />

      <section aria-labelledby="projects-page-heading">
        <SectionDivider />
        <div className="flex flex-col gap-5 px-6 pb-6 pt-10">
          <h1
            data-flip-key="projects-heading"
            className="font-serif text-[30px] tracking-[-0.95px] text-text-primary sm:text-[38px]"
          >
            Projects
          </h1>
          <p className="font-mono text-[11px] text-text-muted">
            Everything I have published · {allProjects.length}{" "}
            {allProjects.length === 1 ? "project" : "projects"}
          </p>

          {tagOptions.length > 1 ? (
            <ProjectFilters
              options={tagOptions}
              activeValue={tag ?? ""}
              buildHref={buildFilterHref({ tag, status }, "tag")}
            />
          ) : null}

          <ProjectFilters
            label="Status"
            options={statusOptions}
            activeValue={status ?? ""}
            buildHref={buildFilterHref({ tag, status }, "status")}
          />
        </div>
      </section>

      <section aria-labelledby="project-list-heading">
        <SectionDivider />
        <div className="flex flex-col gap-4 p-6">
          <h2 id="project-list-heading" className="sr-only">
            Project list
          </h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} skillsById={skillsById} />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-text-muted">
              No projects match these filters.
            </p>
          )}
        </div>
      </section>

      <LetsTalkSection
        heading={profile?.letsTalkHeading}
        subtext={profile?.letsTalkSubtext}
        footerText={siteSettings?.footerText}
      />
    </PageFrame>
  );
}
