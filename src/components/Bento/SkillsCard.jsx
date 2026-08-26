import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import useTilt from "../../hooks/useTilt";
import "./SkillsCard.scss";

gsap.registerPlugin(ScrollTrigger);

const SkillBadge = ({ icon, label }) => (
  <div className="skill-badge">
    <Icon icon={icon} width={26} height={26} />
    <span>{label}</span>
  </div>
);

const SkillsCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 4, scale: 1.01 });

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sectionLabels = cardRef.current?.querySelectorAll(
        ".skills-card__section-label"
      );
      const badges = cardRef.current?.querySelectorAll(".skill-badge");

      // Section labels slide in
      if (sectionLabels && sectionLabels.length) {
        gsap.from(sectionLabels, {
          x: -40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Badges cascade
      if (badges && badges.length) {
        gsap.from(badges, {
          opacity: 0,
          scale: 0.8,
          y: 15,
          duration: 0.4,
          stagger: 0.06,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      // Hover bounce on individual badges
      badges?.forEach((badge) => {
        badge.addEventListener("mouseenter", () => {
          gsap.to(badge, {
            scale: 1.12,
            duration: 0.25,
            ease: "back.out(2)",
          });
        });
        badge.addEventListener("mouseleave", () => {
          gsap.to(badge, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="skills-card bento-card" ref={setRefs}>
      <div className="skills-card__header">
        <Icon icon="ri:stack-fill" width={20} height={20} color="#6A6A6A" />
        <span className="skills-card__label">SKILLS &amp; STACK</span>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">FRONTEND</p>
        <div className="skills-card__row">
          <SkillBadge icon="material-icon-theme:react" label="React" />
          <SkillBadge icon="material-icon-theme:html" label="HTML" />
          <SkillBadge icon="selfhst:css3" label="CSS" />
        </div>
        <div className="skills-card__row">
          <SkillBadge icon="simple-icons:gsap" label="GSAP" />
          <SkillBadge icon="skill-icons:javascript" label="JavaScript" />
        </div>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">BACKEND</p>
        <div className="skills-card__row">
          <SkillBadge icon="devicon:nodejs" label="Node.js" />
          <SkillBadge icon="griddy-icons:expressjs" label="Express.js" />
        </div>
        <div className="skills-card__row">
          <SkillBadge icon="skill-icons:mongodb" label="MongoDB" />
          <SkillBadge icon="simple-icons:redis" label="Redis" />
        </div>
      </div>

      <div className="skills-card__section">
        <p className="skills-card__section-label">TOOLS</p>
        <div className="skills-card__row">
          <SkillBadge icon="mdi:git" label="Git" />
          <SkillBadge icon="devicon:figma" label="Figma" />
          <SkillBadge icon="devicon:postman" label="Postman" />
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;
