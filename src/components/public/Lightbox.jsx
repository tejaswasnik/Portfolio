"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ExpandIcon } from "@/components/ui/icons";
import { withImageKitTransform } from "@/lib/imagekit/url.js";

/**
 * Screenshot gallery with an accessible lightbox. No Figma frame exists
 * for the lightbox overlay itself (docs/figma-map.md "Known gaps") —
 * built from design tokens, reusing the same focus-trap/Esc interaction
 * pattern as src/components/ui/Dialog.jsx (see docs/PROGRESS.md
 * "Designed by me"). The grid/caption-row chrome *does* follow a real
 * frame (Figma 72:536/72:564).
 * @param {{ images: string[], projectName: string }} props
 */
export default function Lightbox({ images, projectName }) {
  const [openIndex, setOpenIndex] = useState(-1);
  const panelRef = useRef(null);
  const titleId = useId();
  const isOpen = openIndex >= 0;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement;
    panelRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpenIndex(-1);
      } else if (event.key === "ArrowRight") {
        setOpenIndex((index) => (index + 1) % images.length);
      } else if (event.key === "ArrowLeft") {
        setOpenIndex((index) => (index - 1 + images.length) % images.length);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1 p-0 text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import. */}
            <img
              src={withImageKitTransform(src, "w-360,q-75,c-at_max")}
              alt={`${projectName} screenshot ${index + 1}`}
              className="h-[220px] w-full rounded-t-xl object-cover"
            />
            <span className="flex items-center justify-between px-3 pb-3 font-mono text-[10px] text-text-muted">
              {String(index + 1).padStart(2, "0")} · {images.length} total
              <ExpandIcon size={12} />
            </span>
          </button>
        ))}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 p-6">
          <button
            type="button"
            aria-label="Close lightbox"
            tabIndex={-1}
            className="absolute inset-0 cursor-default"
            onClick={() => setOpenIndex(-1)}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative z-10 flex max-h-full max-w-4xl flex-col gap-3 outline-none"
          >
            <div className="flex items-center justify-between">
              <h2 id={titleId} className="font-mono text-[11px] text-text-muted">
                {projectName} — {String(openIndex + 1).padStart(2, "0")} /{" "}
                {String(images.length).padStart(2, "0")}
              </h2>
              <button
                type="button"
                onClick={() => setOpenIndex(-1)}
                className="font-mono text-[11px] uppercase tracking-[1px] text-text-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                ESC ✕
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a static import. */}
            <img
              src={withImageKitTransform(images[openIndex], "w-1000,q-80,c-at_max")}
              alt={`${projectName} screenshot ${openIndex + 1}`}
              className="max-h-[80vh] w-full rounded-xl border border-border-subtle object-contain"
            />
            {images.length > 1 ? (
              <div className="flex items-center justify-between font-mono text-[11px] text-text-muted">
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex((index) => (index - 1 + images.length) % images.length)
                  }
                  className="hover:text-text-primary"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setOpenIndex((index) => (index + 1) % images.length)}
                  className="hover:text-text-primary"
                >
                  Next →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
