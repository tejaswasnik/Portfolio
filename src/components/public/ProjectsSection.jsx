import SectionDivider from "@/components/ui/SectionDivider";
import ProjectCard from "./ProjectCard";

/**
 * Featured projects (Figma 5:5648 "Selected projects"). Only featured,
 * published projects — PRD 2.2.6 / CLAUDE.md visibility rule.
 * @param {{ projects: Array<object>, skills: Array<{ id: string, name: string, icon: string }> }} props
 */
export default function ProjectsSection({ projects, skills }) {
  if (projects.length === 0) return null;

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  return (
    <section id="projects" aria-labelledby="projects-heading">
      <SectionDivider />
      <div className="flex flex-col gap-8 p-6">
        <h2
          id="projects-heading"
          className="font-serif text-2xl tracking-[0.6px] text-text-primary"
        >
          Projects
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} skillsById={skillsById} />
          ))}
        </div>
      </div>
    </section>
  );
}
