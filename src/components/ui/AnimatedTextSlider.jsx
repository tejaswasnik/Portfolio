"use client";

import { useEffect, useState } from "react";

/**
 * Vertical text carousel that cycles through `texts` with a slide/fade
 * transition (ported from https://siddz.com/r/animated-text-slider.json).
 * Colors/typography come from `className` at the call site, never
 * hard-coded here.
 * @param {{ texts: string[], interval?: number, className?: string }} props
 */
export function AnimatedTextSlider({ texts = ["Text 1", "Text 2", "Text 3"], interval = 3500, className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`relative h-[1.5em] w-full overflow-hidden ${className}`}>
      {texts.map((text, i) => {
        const isCurrent = i === index;
        const isPrev = texts.length > 1 && i === (index - 1 + texts.length) % texts.length;
        const shouldTransition = isCurrent || isPrev;

        let transformClass = "translate-y-full";
        let opacityClass = "opacity-0";

        if (isCurrent) {
          transformClass = "translate-y-0";
          opacityClass = "opacity-100";
        }
        if (isPrev) {
          transformClass = "-translate-y-full";
          opacityClass = "opacity-0";
        }

        return (
          <div
            key={i}
            className={`absolute left-0 w-full ${transformClass} ${opacityClass} ${shouldTransition ? "transition-all duration-700 ease-in-out" : ""}`}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}

export default AnimatedTextSlider;
