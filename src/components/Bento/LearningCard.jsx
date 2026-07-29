import { Icon } from "@iconify/react";
import "./LearningCard.scss";
import FramerSolidIcon from '@iconify-react/mynaui/framer-solid';

const LearningCard = () => {
  return (
    <div className="learning-card bento-card">
      <div className="learning-card__header">
        <Icon icon="mdi:learn-outline" width={28} height={28} color="#6A6A6A" />
        <span className="learning-card__label">CURRENTLY LEARNING</span>
      </div>

      <div className="learning-card__tech">
        <div className="learning-card__tech-inner">
          <FramerSolidIcon icon="ri:nextjs-fill" width={94} height={94} color="white" />
          <span className="learning-card__tech-name">Framer</span>
        </div>
      </div>

      <p className="learning-card__desc">Animation</p>
    </div>
  );
};

export default LearningCard;
