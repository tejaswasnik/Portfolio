import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Hero.scss";

gsap.registerPlugin(ScrollTrigger);

const TITLES = [
  "Full Stack Developer",
  "MERN Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
];

const SplitText = ({ text, className }) => (
  <span className={className}>
    {text.split("").map((char, i) => (
      <span key={i} className="hero__char" style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
);

const Hero = () => {
  const heroRef = useRef(null);
  const underlineRef = useRef(null);
  const titleContainerRef = useRef(null);
  const [currentTitle, setCurrentTitle] = useState(0);
  const cycleTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Animate title change
  const animateTitle = useCallback((newIndex) => {
    const container = titleContainerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".hero__char");

    // Exit animation — slide up and fade out
    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentTitle(newIndex);
      },
    });

    tl.to(chars, {
      opacity: 0,
      y: -40,
      rotateX: 90,
      duration: 0.4,
      stagger: 0.015,
      ease: "power3.in",
    });
  }, []);

  // Entrance animation for new title
  useEffect(() => {
    if (isFirstRender.current) return; // Skip — handled by the initial reveal

    const container = titleContainerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".hero__char");

    gsap.set(chars, {
      opacity: 0,
      y: 40,
      rotateX: -90,
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.5,
      stagger: 0.02,
      ease: "power4.out",
    });
  }, [currentTitle]);

  // Initial reveal + start cycling
  useEffect(() => {
    const ctx = gsap.context(() => {
      const nameChars = heroRef.current.querySelectorAll(
        ".hero__name .hero__char"
      );
      const titleChars = titleContainerRef.current?.querySelectorAll(
        ".hero__char"
      );
      const allChars = [
        ...(nameChars || []),
        ...(titleChars || []),
      ];

      // Initial state
      gsap.set(allChars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
      });
      gsap.set(underlineRef.current, {
        scaleX: 0,
      });

      // Timeline for the reveal
      const tl = gsap.timeline({
        delay: 0.3,
        defaults: { ease: "power4.out" },
        onComplete: () => {
          // Mark first render done, then start cycling
          isFirstRender.current = false;

          cycleTimerRef.current = setInterval(() => {
            setCurrentTitle((prev) => {
              const nextIndex = (prev + 1) % TITLES.length;
              animateTitle(nextIndex);
              return prev; // Don't update here — animateTitle does it after exit
            });
          }, 3000);
        },
      });

      tl.to(allChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.03,
      });

      // Underline sweep after text lands
      tl.to(
        underlineRef.current,
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=0.3"
      );

      // Parallax on scroll
      gsap.to(heroRef.current, {
        yPercent: -30,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, heroRef);

    return () => {
      ctx.revert();
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="hero" ref={heroRef}>
      <div className="hero__text-wrapper">
        <SplitText text="Hi, I'm Tejas -" className="hero__name" />
        <span className="hero__title-container" ref={titleContainerRef}>
          <SplitText
            text={TITLES[currentTitle]}
            className="hero__title"
            key={currentTitle}
          />
        </span>
      </div>
      <div className="hero__underline" ref={underlineRef} />
    </div>
  );
};

export default Hero;
