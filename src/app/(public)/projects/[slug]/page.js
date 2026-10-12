import Link from "next/link";
import { notFound } from "next/navigation";
import PageFrame from "@/components/ui/PageFrame";
import SectionDivider from "@/components/ui/SectionDivider";
import Nav from "@/components/public/Nav";
import MarkdownContent from "@/components/public/MarkdownContent";
import Lightbox from "@/components/public/Lightbox";
import LetsTalkSection from "@/components/public/LetsTalkSection";
import Chip from "@/components/ui/Chip";
import { BackIcon, GithubIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import {
  getPublicProjectBySlug,
  getPublicAllProjects,
  getPublicVisibleSkills,
  getPublicProfile,
  getPublicSiteSettings,
} from "@/lib/db/cache";

// Matches Button's primary/dashed variant classes as links (Button only
// renders a <button> — see docs/DECISIONS.md step 3 for why these stay
// duplicated rather than editing the step 1 primitive).
const liveLinkClass =
  "inline-flex items-center gap-2 rounded-pill bg-cta-bg border border-cta-bg text-cta-text px-3.5 py-2.5 text-sm font-medium hover:bg-text-primary";
const githubLinkClass =
  "inline-flex items-center gap-2 rounded-lg border border-dashed border-border-default px-3.5 py-2.5 text-text-primary text-[11px] font-bold font-mono uppercase hover:border-accent/50";

/** @param {{ params: Promise<{ slug: string }> }} props */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);
  if (!project) return {};

  const title = project.seo?.title || `${project.name} — Tejas Wasnik`;
  const description = project.seo?.description || project.shortDescription;
  const ogImage = project.seo?.ogImage || project.coverImage || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** @param {{ params: Promise<{ slug: string }> }} props */
export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;

  const [project, allProjects, skills, profile, siteSettings] = await Promise.all([
    getPublicProjectBySlug(slug),
    getPublicAllProjects(),
    getPublicVisibleSkills(),
    getPublicProfile(),
    getPublicSiteSettings(),
  ]);

  if (!project) notFound();

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const isOngoing = project.status === "ongoing";

  // Prev/next by the same `order` the list and home page sort by (PRD
  // 2.4: "previous/next navigation") — unpublished projects can't appear
  // here since allProjects only contains public ones (docs/DECISIONS.md).
  const currentIndex = allProjects.findIndex((p) => p.slug === project.slug);
  const previous = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  return (
    <PageFrame>
      <Nav active="projects" />

      <section aria-label="Breadcrumb">
        <SectionDivider />
        <div className="flex items-center justify-between p-6">
          <Link
            href="/projects"
            className="flex items-center gap-2 font-mono text-[11px] text-text-muted hover:text-text-primary"
          >
            <BackIcon size={12} />
            All projects
          </Link>
          <span className="font-mono text-[10px] text-text-muted">
            /projects/{project.slug}
          </span>
        </div>
      </section>

      <section aria-labelledby="project-heading">
        <SectionDivider />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[38px] tracking-[-0.95px] text-text-primary">
              {project.name}
            </h1>
            <span
              className={`rounded-sm border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase ${
                isOngoing ? "text-accent" : "text-text-primary"
              }`}
            >
              {isOngoing ? "Ongoing" : "Completed"}
            </span>
          </div>
          <p className="text-[14.5px] leading-[1.625] text-text-secondary">
            {project.shortDescription}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {project.liveUrl ? (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={liveLinkClass}>
                Visit live site
                <ArrowUpRightIcon size={14} />
              </a>
            ) : null}
            {project.githubUrl ? (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={githubLinkClass}>
                <GithubIcon size={14} />
                View on GitHub
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {project.coverImage ? (
        <section aria-label="Cover image">
          <SectionDivider />
          <div className="p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import. */}
            <img
              src={project.coverImage}
              alt={`${project.name} cover`}
              className="w-full rounded-2xl border border-border-subtle object-cover"
            />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="about-project-heading">
        <SectionDivider />
        <div className="flex flex-col gap-6 p-6">
          <h2
            id="about-project-heading"
            className="font-serif text-2xl tracking-[0.6px] text-text-primary"
          >
            About this project
          </h2>
          <MarkdownContent content={project.longDescription} />
        </div>
      </section>

      {project.screenshots.length > 0 ? (
        <section aria-labelledby="screenshots-heading">
          <SectionDivider />
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <h2
                id="screenshots-heading"
                className="font-serif text-2xl tracking-[0.6px] text-text-primary"
              >
                Screenshots
              </h2>
              <p className="font-mono text-[10px] text-text-muted">
                {project.screenshots.length}{" "}
                {project.screenshots.length === 1 ? "image" : "images"} · click to enlarge
              </p>
            </div>
            <Lightbox images={project.screenshots} projectName={project.name} />
          </div>
        </section>
      ) : null}

      {project.techIds.length > 0 ? (
        <section aria-labelledby="tech-used-heading">
          <SectionDivider />
          <div className="flex flex-col gap-4 p-6">
            <h2
              id="tech-used-heading"
              className="font-serif text-2xl tracking-[0.6px] text-text-primary"
            >
              Tech used
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techIds.map((id) => {
                const skill = skillsById.get(id);
                if (!skill) return null;
                return (
                  <Chip key={id} variant="skill">
                    {skill.name}
                  </Chip>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section aria-label="Project navigation">
        <SectionDivider />
        <div className="flex flex-col gap-4 p-6">
          {previous || next ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              {previous ? (
                <Link
                  href={`/projects/${previous.slug}`}
                  className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-border-subtle bg-surface-1 p-4"
                >
                  <span className="font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
                    ← Previous
                  </span>
                  <span className="font-serif text-[22px] text-text-primary">
                    {previous.name}
                  </span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/projects/${next.slug}`}
                  className="flex flex-1 flex-col items-end gap-1.5 rounded-2xl border border-border-subtle bg-surface-1 p-4 text-right"
                >
                  <span className="font-mono text-[9px] uppercase tracking-[1.44px] text-text-muted">
                    Next →
                  </span>
                  <span className="font-serif text-[22px] text-text-primary">{next.name}</span>
                </Link>
              ) : null}
            </div>
          ) : null}
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border-default px-3.5 py-2.5 font-mono text-[11px] font-bold uppercase text-text-primary hover:border-accent/50"
          >
            <BackIcon size={14} />
            Back to projects
          </Link>
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
