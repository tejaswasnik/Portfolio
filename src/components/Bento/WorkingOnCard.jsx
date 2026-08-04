import { Icon } from "@iconify/react";
import "./WorkingOnCard.scss";

const WorkingOnCard = () => {
  return (
    <div className="working-on-card bento-card">
      <div className="working-on-card__header">
        <Icon icon="ix:project" width={24} height={24} color="#6A6A6A" />
        <span className="working-on-card__label">CURRENTLY WORKING ON</span>
      </div>

      <h3 className="working-on-card__title">SearchMind</h3>
      <p className="working-on-card__desc">AI-powered search engine.</p>

      <a
        href="https://github.com/tejaswasnik/SearchMind"
        target="_blank"
        rel="noopener noreferrer"
        className="working-on-card__repo-btn"
        aria-label="Repository"
      >
        <Icon icon="mdi:github" width={43} height={43} color="white" />
        <span>REPOSITORY</span>
      </a>
    </div>
  );
};

export default WorkingOnCard;
