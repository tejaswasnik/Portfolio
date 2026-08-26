import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollProgress.scss";

gsap.registerPlugin(ScrollTrigger);

const ScrollProgress = () => {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars?.trigger === document.documentElement) st.kill();
      });
    };
  }, []);

  return <div className="scroll-progress" ref={barRef} />;
};

export default ScrollProgress;
