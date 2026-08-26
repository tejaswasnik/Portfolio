import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import "./ProjectCard.scss";

gsap.registerPlugin(ScrollTrigger);

const ProjectCard = ({ title, description, image, liveUrl, repoUrl }) => {
  const cardRef = useRef(null);
  const imageWipeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal wipe — a purple overlay slides away
      if (imageWipeRef.current) {
        gsap.to(imageWipeRef.current, {
          scaleX: 0,
          duration: 1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  // Hover tilt for the card
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      gsap.to(el, {
        rotateY: percentX * 6,
        rotateX: -percentY * 6,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      });
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="project-card" ref={cardRef}>
      {/* Project image */}
      <div className="project-card__image">
        {image ? (
          <img src={image} alt={title} className="project-card__img" />
        ) : (
          <div className="project-card__placeholder">
            <Icon icon="mdi:image-outline" width={64} height={64} color="rgba(255,255,255,0.2)" />
          </div>
        )}
        {/* Wipe overlay */}
        <div className="project-card__wipe" ref={imageWipeRef} />
      </div>

      <h3 className="project-card__title">{title}</h3>
      <p className="project-card__desc">{description}</p>

      <div className="project-card__actions">
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card__btn project-card__btn--live"
          aria-label="Live Preview"
        >
          <Icon icon="mdi:arrow-top-right" width={26} height={26} color="white" />
          <span>Live</span>
        </a>

        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card__btn project-card__btn--repo"
          aria-label="GitHub Repository"
        >
          <Icon icon="mdi:github" width={43} height={43} color="white" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
