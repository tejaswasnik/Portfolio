import Chip from "@/components/ui/Chip";
import TrackedLink from "@/components/public/TrackedLink";
import { GithubIcon, ArrowUpRightIcon, ArrowRightIcon } from "@/components/ui/icons";
import { withImageKitTransform } from "@/lib/imagekit/url.js";

// Matches Button's "icon" variant classes (src/components/ui/Button.jsx)
// as a link rather than a <button onClick> — avoids needing "use client"
// just to open a URL. Step 1's primitives are out of scope for this step.
const iconLinkClass =
  "flex items-center justify-center rounded-md border border-border-default bg-surface-3 text-text-primary size-7 hover:bg-border-icon hover:border-border-hover";

/**
 * Featured/listed project card (Figma 5:5651 "Project card"). The two
 * Figma "variants" turned out to be bespoke illustrated mockups unique
 * to the two sample projects (a dashboard UI vs. a document editor UI),
 * not a reusable data-driven variant — a real project only has
 * coverImage, so that renders in the preview slot instead, with a
 * token-based gradient placeholder when none is set yet
 * (docs/DECISIONS.md).
 * @param {{
 *   project: { name: string, slug: string, shortDescription: string, coverImage?: string, liveUrl?: string, githubUrl?: string, status: 'ongoing' | 'completed', techIds: string[] },
 *   skillsById: Map<string, { name: string, icon: string }>,
 * }} props
 */
export default function ProjectCard({ project, skillsById }) {
  const isOngoing = project.status === "ongoing";

  return (
    <article className="flex flex-1 flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-1 p-4">
      <div className="relative h-[200px] w-full overflow-hidden rounded-[10px] bg-gradient-to-br from-surface-3 to-surface-2">
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import.
          <img
            src={withImageKitTransform(project.coverImage, "w-440,q-75,c-at_max")}
            alt=""
            className="size-full object-cover"
          />
        ) : null}
        <span
          className={`absolute left-3 top-3 rounded-sm border border-border-default bg-surface-3 px-2 py-1 font-mono text-[8px] font-bold uppercase ${
            isOngoing ? "text-accent" : "text-text-primary"
          }`}
        >
          {isOngoing ? "Ongoing" : "Completed"}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[22px] text-text-primary">
            {project.name}
          </h3>
          <div className="flex items-center gap-1.5">
            {project.githubUrl ? (
              <TrackedLink
                trackTarget={`${project.name} · GitHub`}
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} on GitHub`}
                className={iconLinkClass}
              >
                <GithubIcon size={14} />
              </TrackedLink>
            ) : null}
            {project.liveUrl ? (
              <TrackedLink
                trackTarget={`${project.name} · live link`}
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} live site`}
                className={iconLinkClass}
              >
                <ArrowUpRightIcon size={14} />
              </TrackedLink>
            ) : null}
          </div>
        </div>

        <p className="text-[13px] leading-[1.625] text-text-secondary">
          {project.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.techIds.map((id) => {
            const skill = skillsById.get(id);
            if (!skill) return null;
            return (
              <Chip key={id} variant="tech">
                {skill.name}
              </Chip>
            );
          })}
        </div>

        <a
          href={`/projects/${project.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-default px-3.5 py-2.5 font-mono text-[11px] font-bold uppercase text-text-primary hover:border-accent/50"
        >
          View details
          <ArrowRightIcon size={14} className="text-accent" />
        </a>
      </div>
    </article>
  );
}
