"use client";

import { useEffect, useState } from "react";
import { UploadIcon } from "@/components/ui/icons";
import { withImageKitTransform } from "@/lib/imagekit/url.js";

/**
 * The banner slot (Figma 5:5326): a looping GIF when one is set, a
 * reserved-space placeholder otherwise (PRD 2.2.1 "placeholder
 * fallback"). The Figma empty-state copy ("Upload GIF banner") is an
 * editor-facing hint, not public copy — swapped for a neutral line here
 * (docs/DECISIONS.md). A GIF can't be paused with CSS alone, so
 * `prefers-reduced-motion` replaces it with the same placeholder instead
 * of auto-playing it (PRD/CLAUDE.md accessibility rule).
 * @param {{ bannerUrl?: string }} props
 */
export default function BannerMedia({ bannerUrl }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(query.matches);
    const onChange = (event) => setReduceMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (bannerUrl && !reduceMotion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- animated GIF; next/image can't preserve looping.
      <img
        src={withImageKitTransform(bannerUrl, "w-480,q-70,c-at_max")}
        alt=""
        className="h-[138px] w-full rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="flex h-[138px] w-full flex-col items-center justify-center gap-3 rounded-lg bg-surface-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-bg">
        <UploadIcon className="text-text-primary" />
      </span>
      <div className="flex flex-col items-center gap-1 text-center font-mono">
        <p className="text-[11px] font-medium text-text-primary">
          {reduceMotion && bannerUrl
            ? "Banner hidden — reduced motion is on"
            : "Banner coming soon"}
        </p>
        <p className="text-[10px] text-text-muted">760 × 100</p>
      </div>
    </div>
  );
}
