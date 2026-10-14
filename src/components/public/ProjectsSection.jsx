import SectionDivider from "@/components/ui/SectionDivider";
import ProjectCard from "./ProjectCard";
import { RevealItem } from "@/components/motion/Reveal.jsx";

/**
 * Featured projects (Figma 5:5648 "Selected projects"). Only featured,
 * published projects — PRD 2.2.6 / CLAUDE.md visibility rule.
 *
 * Heading and card row are separate `RevealItem`s (A8 Task 5 Step 4),
 * staggered 60ms apart by the page-level `<Reveal stagger>` wrapper. The
 * heading keeps `data-flip-key` untouched — `TransitionProvider`'s GSAP
 * FLIP still selects it on route change; `RevealItem` only adds Motion's
 * own mount-time opacity/transform, which never runs again after that.
 * @param {{ projects: Array<object>, skills: Array<{ id: string, name: string, icon: string }> }} props
 */
export default function ProjectsSection({ projects, skills }) {
  if (projects.length === 0) return null;

  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));

  return (
    <section id="projects" aria-labelledby="projects-heading">
      <SectionDivider />
      <div className="flex flex-col gap-8 p-6">
        <RevealItem
          as="h2"
          id="projects-heading"
          data-flip-key="projects-heading"
          className="font-serif text-2xl tracking-[0.6px] text-text-primary"
        >
          Projects
        </RevealItem>
        <RevealItem className="flex flex-col gap-4 sm:flex-row">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} skillsById={skillsById} />
          ))}
        </RevealItem>
      </div>
    </section>
  );
}
