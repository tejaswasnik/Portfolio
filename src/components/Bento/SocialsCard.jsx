import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import useTilt from "../../hooks/useTilt";
import "./SocialsCard.scss";

gsap.registerPlugin(ScrollTrigger);

const SocialItem = ({ icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="social-item"
    aria-label={label}
  >
    <Icon icon={icon} width={54} height={54} color="white" />
    <span className="social-item__label">{label}</span>
  </a>
);

const SocialsCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 6, scale: 1.01 });

  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = cardRef.current?.querySelectorAll(".social-item");

      // Bouncy stagger entrance
      if (items && items.length) {
        gsap.from(items, {
          opacity: 0,
          scale: 0,
          rotation: -20,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Hover rotation + scale
      items?.forEach((item) => {
        item.addEventListener("mouseenter", () => {
          gsap.to(item, {
            scale: 1.15,
            rotation: 5,
            duration: 0.3,
            ease: "back.out(2)",
          });
        });
        item.addEventListener("mouseleave", () => {
          gsap.to(item, {
            scale: 1,
            rotation: 0,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)",
          });
        });
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="socials-card bento-card" ref={setRefs}>
      <div className="socials-card__grid">
        <SocialItem
          icon="mdi:github"
          label="GitHub"
          href="https://github.com/tejaswasnik"
        />
        <SocialItem
          icon="mdi:linkedin"
          label="Linkedin"
          href="https://linkedin.com/in/tejaswasnik"
        />
        <SocialItem
          icon="mingcute:social-x-line"
          label="X"
          href="https://x.com/itstezus"
        />
        <SocialItem
          icon="devicon-plain:leetcode"
          label="LeetCode"
          href="https://leetcode.com/u/TejasWasnik/"
        />
      </div>
    </div>
  );
};

export default SocialsCard;
