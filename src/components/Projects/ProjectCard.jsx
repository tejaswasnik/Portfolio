import { Icon } from "@iconify/react";
import "./ProjectCard.scss";

const ProjectCard = ({ title, description, liveUrl, repoUrl }) => {
  return (
    <div className="project-card">
      {/* Placeholder image area */}
      <div className="project-card__image" />

      <h3 className="project-card__title">{title}</h3>
      <p className="project-card__desc">{description}</p>

      <div className="project-card__actions">
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card__btn project-card__btn--live"
          aria-label="Live Preview"
        >
          <Icon icon="mdi:arrow-top-right" width={26} height={26} color="white" />
          <span>Live</span>
        </a>

        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card__btn project-card__btn--repo"
          aria-label="GitHub Repository"
        >
          <Icon icon="mdi:github" width={43} height={43} color="white" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
