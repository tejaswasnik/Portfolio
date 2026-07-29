import AboutCard from "./AboutCard";
import SkillsCard from "./SkillsCard";
import SpotifyCard from "./SpotifyCard";
import SocialsCard from "./SocialsCard";
import WorkingOnCard from "./WorkingOnCard";
import LearningCard from "./LearningCard";
import HeatmapCard from "./HeatmapCard";
import "./BentoGrid.scss";

const BentoGrid = () => {
  return (
    <div className="bento-grid">
      {/* Row 1: About (wide) + Skills (tall, spans 2 rows) */}
      <AboutCard />
      <SkillsCard />

      {/* Row 2: Spotify + Socials */}
      <SpotifyCard />
      <SocialsCard />

      {/* Row 3: Currently Working On (wide) + Learning */}
      <WorkingOnCard />
      <LearningCard />

      {/* Row 4: GitHub Heatmap (full width) */}
      <HeatmapCard />
    </div>
  );
};

export default BentoGrid;
