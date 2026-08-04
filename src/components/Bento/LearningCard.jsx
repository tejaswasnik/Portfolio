import { Icon } from "@iconify/react";
import "./LearningCard.scss";

const LearningCard = () => {
  return (
    <div className="learning-card bento-card">
      <div className="learning-card__header">
        <Icon icon="mdi:learn-outline" width={28} height={28} color="#6A6A6A" />
        <span className="learning-card__label">CURRENTLY LEARNING</span>
      </div>

      <div className="learning-card__tech">
        <div className="learning-card__tech-inner">
          <Icon
            icon="devicon:typescript"
            className="learning-card__tech-icon"
            width={64}
            height={64}
          />
          <span className="learning-card__tech-name">TypeScript</span>
        </div>
      </div>

      <p className="learning-card__desc">Programming Language</p>
    </div>
  );
};

export default LearningCard;
