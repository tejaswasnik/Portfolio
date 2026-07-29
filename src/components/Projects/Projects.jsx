import { Icon } from "@iconify/react";
import ProjectCard from "./ProjectCard";
import "./Projects.scss";

const projects = [
  {
    id: 1,
    title: "PixelFeed",
    description: " A full-stack social media platform with secure authentication, cloud image uploads, likes, follows, and personalized user profiles.",
    image: "https://ik.imagekit.io/pgt5y5hyw/Capture.PNG", // Add your project image path here
    liveUrl: "https://pixelfeed.onrender.com/",
    repoUrl: "https://github.com/tejaswasnik/PixelFeed",
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
