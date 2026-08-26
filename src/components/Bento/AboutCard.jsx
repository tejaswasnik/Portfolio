import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import avatar from "../../assets/avatar.png";
import TelegramIcon from "@iconify-react/line-md/telegram";
import useTilt from "../../hooks/useTilt";
import "./AboutCard.scss";

gsap.registerPlugin(ScrollTrigger);

const TechPill = ({ icon, label, highlight }) => (
  <div className={`tech-pill ${highlight ? "tech-pill--highlight" : ""}`}>
    <Icon icon={icon} width={26} height={26} />
    <span>{label}</span>
  </div>
);

const AboutCard = () => {
  const cardRef = useRef(null);
  const tiltRef = useTilt({ maxRotation: 5, scale: 1.01 });
  const avatarRef = useRef(null);
  const nameRef = useRef(null);
  const freelanceDotRef = useRef(null);
  const btnRef = useRef(null);

  // Merge tilt ref and card ref
  const setRefs = (el) => {
    cardRef.current = el;
    tiltRef.current = el;
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector(".contact");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Magnetic button effect
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Entry animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const pills = cardRef.current?.querySelectorAll(".tech-pill");

      // Avatar elastic entrance
      if (avatarRef.current) {
        gsap.from(avatarRef.current, {
          scale: 0,
          rotation: -15,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Name clip-in
      if (nameRef.current) {
        gsap.from(nameRef.current, {
          clipPath: "inset(0 100% 0 0)",
          duration: 0.8,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Tech pills stagger
      if (pills && pills.length) {
        gsap.from(pills, {
          opacity: 0,
          y: 20,
          scale: 0.8,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      // Freelance dot pulse
      if (freelanceDotRef.current) {
        gsap.to(freelanceDotRef.current, {
          boxShadow: "0 0 12px 4px rgba(30, 215, 96, 0.6)",
          repeat: -1,
          yoyo: true,
          duration: 1,
          ease: "sine.inOut",
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-card bento-card" ref={setRefs}>
      <div className="about-card__top">
        <img
          ref={avatarRef}
          src={avatar}
          alt="Tejas Wasnik"
          className="about-card__avatar"
        />
        <div className="about-card__identity">
          <div className="about-card__freelance">
            <span className="about-card__freelance-dot" ref={freelanceDotRef} />
            <span>Available for Freelance</span>
          </div>
          <h2 className="about-card__name" ref={nameRef}>
            Tejas Wasnik
          </h2>
          <p className="about-card__handle">@tezus</p>
        </div>
      </div>

      <div className="about-card__bio">
        <span className="about-card__bio-text">
          I build production-ready web using
        </span>
        <TechPill icon="material-icon-theme:react" label="React" highlight />
        <span className="about-card__bio-comma">,</span>
        <TechPill icon="skill-icons:javascript" label="JavaScript" />
        <span className="about-card__bio-comma">,</span>
        <TechPill icon="devicon:nodejs" label="Node.js" />
        <span className="about-card__bio-and">and</span>
        <TechPill icon="skill-icons:mongodb" label="MongoDB" />
      </div>

      <div className="button">
        <button onClick={scrollToContact} ref={btnRef}>
          <TelegramIcon height="1em" />
          Contact Me
        </button>
      </div>
    </div>
  );
};

export default AboutCard;
