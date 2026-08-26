import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import { GitHubCalendar } from "react-github-calendar";
import useTilt from "../../hooks/useTilt";
import "./HeatmapCard.scss";

gsap.registerPlugin(ScrollTrigger);

const HeatmapCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 3, scale: 1.005 });
  const heatmapRef = useRef(null);

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heatmap reveal wipe
      if (heatmapRef.current) {
        gsap.from(heatmapRef.current, {
          clipPath: "inset(0 100% 0 0)",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="heatmap-card bento-card" ref={setRefs}>
      <div className="heatmap-card__header">
        <Icon
          icon="mingcute:github-fill"
          width={20}
          height={20}
          color="white"
        />
        <span className="heatmap-card__label">GITHUB HEATMAP</span>
      </div>
      <div className="heatmap" ref={heatmapRef}>
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