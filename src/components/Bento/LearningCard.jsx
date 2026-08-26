import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import useTilt from "../../hooks/useTilt";
import "./LearningCard.scss";

gsap.registerPlugin(ScrollTrigger);

const LearningCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 6, scale: 1.01 });
  const iconRef = useRef(null);

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const techInner = cardRef.current?.querySelector(
        ".learning-card__tech-inner"
      );
      const desc = cardRef.current?.querySelector(".learning-card__desc");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      if (techInner) {
        tl.from(techInner, {
          scale: 0,
          rotation: -180,
          duration: 0.8,
          ease: "back.out(1.7)",
        });
      }

      if (desc) {
        tl.from(
          desc,
          {
            opacity: 0,
            y: 10,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }

      // Continuous subtle float on the icon
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          y: -5,
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: "sine.inOut",
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="learning-card bento-card" ref={setRefs}>
      <div className="learning-card__header">
        <Icon
          icon="mdi:learn-outline"
          width={28}
          height={28}
          color="#6A6A6A"
        />
        <span className="learning-card__label">CURRENTLY LEARNING</span>
      </div>

      <div className="learning-card__tech">
        <div className="learning-card__tech-inner">
          <Icon
            ref={iconRef}
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
