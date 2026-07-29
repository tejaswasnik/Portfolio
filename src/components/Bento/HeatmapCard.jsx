import { Icon } from "@iconify/react";
import { GitHubCalendar } from "react-github-calendar";
import "./HeatmapCard.scss";

const HeatmapCard = () => {
  return (
    <div className="heatmap-card bento-card">
      <div className="heatmap-card__header">
        <Icon
          icon="mingcute:github-fill"
          width={20}
          height={20}
          color="white"
        />
        <span className="heatmap-card__label">GITHUB HEATMAP</span>
      </div>
    <div className="heatmap">
      
      <GitHubCalendar
        username="tejaswasnik"
        blockSize={21}
        blockMargin={5}
        blockRadius={3}
        hideColorLegend={false}
        hideMonthLabels={false}
        showWeekdayLabels
        fontSize={14}
        theme={{
          dark: [
            "#1d1523",
            "#4c1d95",
            "#6d28d9",
            "#9333ea",
            "#a855f7",
          ],
        }}
        />
        </div>
    </div>
  );
};

export default HeatmapCard;