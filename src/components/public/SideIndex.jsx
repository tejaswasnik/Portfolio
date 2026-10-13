"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Desktop-only side index with a fluid scroll-progress indicator (Figma
 * 10:1057). Hidden on < 1200px via CSS (xl: breakpoint), matching
 * PageFrame's rails and design.md §10. Entries are driven by whichever
 * sections actually rendered on the page (passed in by the page, already
 * filtered for visibility/fetch-failure) — so a hidden or failed section
 * drops out automatically, per figma-map.md.
 * @param {{ entries: Array<{ id: string, label: string }> }} props
 */
export default function SideIndex({ entries }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const labelElements = useRef(new Map());

  const [pathD, setPathD] = useState("");
  const [totalLength, setTotalLength] = useState(0);
  const [activeLength, setActiveLength] = useState(0);

  const setLabelRef = useCallback(
    (id) => (el) => {
      if (el) labelElements.current.set(id, el);
      else labelElements.current.delete(id);
    },
    [],
  );

  const calculatePath = useCallback(() => {
    if (!containerRef.current || entries.length === 0) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const points = entries.map((entry) => {
      const el = labelElements.current.get(entry.id);
      if (!el) return { y: 0 };
      const rect = el.getBoundingClientRect();
      return { y: rect.top - containerRect.top + rect.height / 2 };
    });
    if (points.length === 0) return;

    const d = points.map((point, i) => `${i === 0 ? "M" : "L"} 0 ${point.y}`).join(" ");
    setPathD(d);
  }, [entries]);

  useEffect(() => {
    const timer = setTimeout(calculatePath, 50);
    const observer = new ResizeObserver(calculatePath);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", calculatePath);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePath);
      observer.disconnect();
    };
  }, [calculatePath]);

  useEffect(() => {
    if (pathRef.current && pathD) {
      setTotalLength(pathRef.current.getTotalLength());
    }
  }, [pathD]);

  useEffect(() => {
    if (entries.length === 0 || !pathD || totalLength === 0) return;

    const handleScroll = () => {
      const triggerLine = window.innerHeight * 0.3;
      const sectionTops = entries.map((entry) => {
        const el = document.getElementById(entry.id);
        return el ? el.getBoundingClientRect().top : Infinity;
      });

      let activeIndex = -1;
      for (let i = 0; i < sectionTops.length; i++) {
        if (sectionTops[i] <= triggerLine) activeIndex = i;
      }

      let progressInSection = 0;
      if (activeIndex >= 0) {
        const currentTop = sectionTops[activeIndex];
        const nextTop = sectionTops[activeIndex + 1] ?? currentTop + 500;
        if (activeIndex === 0) {
          const distToEnd = nextTop - triggerLine;
          const totalDist = window.scrollY + distToEnd;
          progressInSection = totalDist > 0 ? Math.min(Math.max(window.scrollY / totalDist, 0), 1) : 1;
        } else {
          const sectionHeight = nextTop - currentTop;
          progressInSection =
            sectionHeight > 0 ? Math.min(Math.max((triggerLine - currentTop) / sectionHeight, 0), 1) : 1;
        }
      }

      if (activeIndex >= 0) {
        const segmentLength = totalLength / Math.max(entries.length - 1, 1);
        setActiveLength(Math.min(segmentLength * (activeIndex + progressInSection), totalLength));
      } else {
        setActiveLength(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [entries, pathD, totalLength]);

  const activeIndex = (() => {
    if (totalLength === 0 || entries.length < 2) return activeLength > 0 ? 0 : -1;
    const segmentLength = totalLength / (entries.length - 1);
    return Math.min(Math.round(activeLength / segmentLength), entries.length - 1);
  })();

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label="Section index"
      ref={containerRef}
      className="fixed left-[calc(50%+412px)] top-1/2 hidden -translate-y-1/2 flex-col gap-2 xl:flex"
    >
      <p className="font-mono text-[9px] tracking-[1.8px] text-text-muted">INDEX</p>
      <div className="relative flex flex-col gap-3">
        <svg className="pointer-events-none absolute inset-0 h-full w-px overflow-visible">
          <path d={pathD} fill="none" className="stroke-border-default" strokeWidth="1" />
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            className="stroke-accent transition-[stroke-dashoffset] duration-150 ease-out"
            strokeWidth="1"
            strokeDasharray={totalLength || 1}
            strokeDashoffset={Math.max(0, (totalLength || 1) - activeLength)}
          />
        </svg>
        {entries.map((entry, index) => {
          const active = index === activeIndex;
          return (
            <a
              key={entry.id}
              ref={setLabelRef(entry.id)}
              href={`#${entry.id}`}
              className="pl-4 font-mono text-[10px] leading-[1.2]"
            >
              <span className={active ? "text-accent" : "text-text-muted"}>{entry.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
