import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AboutCard from "./AboutCard";
import SkillsCard from "./SkillsCard";
import SpotifyCard from "./SpotifyCard";
import SocialsCard from "./SocialsCard";
import WorkingOnCard from "./WorkingOnCard";
import LearningCard from "./LearningCard";
import HeatmapCard from "./HeatmapCard";
import "./BentoGrid.scss";

gsap.registerPlugin(ScrollTrigger);

const BentoGrid = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll(".bento-card");

      gsap.set(cards, {
        opacity: 0,
        y: 60,
        scale: 0.95,
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          end: "top 30%",
          toggleActions: "play none none none",
        },
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bento-grid" ref={gridRef}>
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
