import { Icon } from "@iconify/react";
import heatmap from "../../assets/github-heatmap.png";
import "./HeatmapCard.scss";

const HeatmapCard = () => {
  return (
    <div className="heatmap-card bento-card">
      <div className="heatmap-card__header">
        <Icon icon="mingcute:github-fill" width={20} height={20} color="white" />
        <span className="heatmap-card__label">GITHUB HEATMAP</span>
      </div>
      <img src={heatmap} alt="GitHub contribution heatmap" className="heatmap-card__img" />
    </div>
  );
};

export default HeatmapCard;
