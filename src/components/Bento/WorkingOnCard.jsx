import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import useTilt from "../../hooks/useTilt";
import "./WorkingOnCard.scss";

gsap.registerPlugin(ScrollTrigger);

const WorkingOnCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 4, scale: 1.01 });

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = cardRef.current?.querySelector(".working-on-card__title");
      const desc = cardRef.current?.querySelector(".working-on-card__desc");
      const btn = cardRef.current?.querySelector(".working-on-card__repo-btn");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      if (title) {
        tl.from(title, {
          x: -50,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      if (desc) {
        tl.from(
          desc,
          {
            x: -30,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3"
        );
      }

      if (btn) {
        tl.from(
          btn,
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          "-=0.2"
        );
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="working-on-card bento-card" ref={setRefs}>
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
