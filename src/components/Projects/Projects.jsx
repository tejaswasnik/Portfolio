import { Icon } from "@iconify/react";
import ProjectCard from "./ProjectCard";
import "./Projects.scss";

const projects = [
  {
    id: 1,
    title: "Project Name.",
    description: "Small description of the project.",
    liveUrl: "#",
    repoUrl: "https://github.com",
  },
  {
    id: 2,
    title: "Project Name.",
    description: "Small description of the project.",
    liveUrl: "#",
    repoUrl: "https://github.com",
  },
];

const Projects = () => {
  return (
    <section className="projects">
      <div className="projects__heading">
        <Icon icon="grommet-icons:projects" width={29} height={29} color="white" />
        <h2 className="projects__title">Featured Projects</h2>
      </div>
      <p className="projects__subtitle">A collection of my most ambitious full-stack projects</p>

      <div className="projects__grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
