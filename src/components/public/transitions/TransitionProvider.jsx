"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ENTER, FLIP, LEAVE, NOTE, REDUCED_MOTION, SWEEP } from "@/lib/transitions/constants.js";
import { shouldTransition, sharedElementVariant, projectSlugFromPath } from "@/lib/transitions/route.js";
import { computeDirection, readStoredIndex, writeStoredIndex } from "@/lib/transitions/historyIndex.js";

const TransitionContext = createContext(null);

/** @returns {(href: string, options?: { flipKey?: string }) => void} navigate */
export function useTransitionNavigate() {
  const ctx = useContext(TransitionContext);
  // Outside the provider (shouldn't happen on public pages, but keeps
  // TransitionLink usable in isolation/tests) — plain navigation.
  return ctx ?? { navigate: (href) => { window.location.assign(href); } };
}

const HATCH_BG = "repeating-linear-gradient(135deg, var(--border-subtle) 0 1px, transparent 1px 4px)";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fixed-position clone of `sourceEl`, matching its current screen rect exactly, appended to `host`. */
function createGhost(sourceEl, host) {
  const rect = sourceEl.getBoundingClientRect();
  const clone = sourceEl.cloneNode(true);
  const computed = getComputedStyle(sourceEl);
  clone.style.position = "fixed";
  clone.style.margin = "0";
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.fontSize = computed.fontSize;
  clone.style.lineHeight = computed.lineHeight;
  clone.style.color = computed.color;
  host.appendChild(clone);
  return { el: clone, rect };
}

/**
 * The "drafting a new sheet" page transition (task spec). A Barba-style
 * lifecycle (beforeLeave/leave/beforeEnter/enter/after — kept as plain
 * functions below, not an actual Barba instance: Next's App Router owns
 * the real DOM swap, this only choreographs a GSAP overlay/timeline
 * around it) rather than installing Barba.js, which fetches and swaps
 * raw HTML and would fight Next's router and React's hydration.
 *
 * Mounted once in `(public)/layout.js` only — /admin never sees this,
 * so admin navigation is always a plain, instant Next.js transition.
 */
export default function TransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef(null);
  const sweepRef = useRef(null);
  const hatchRef = useRef(null);
  const crosshairLeftRef = useRef(null);
  const crosshairRightRef = useRef(null);
  const noteRef = useRef(null);
  const liveRegionRef = useRef(null);

  const timelineRef = useRef(null);
  const navigatingRef = useRef(false); // true between our own navigate() call and its matching enter
  const poppedRef = useRef(false); // true when the next pathname change came from popstate, not our navigate()
  const directionRef = useRef("forward");
  const pendingRef = useRef(null); // { ghost, variant, href } captured at leave time, consumed on enter
  const initialMountRef = useRef(true);
  const lastKnownIndexRef = useRef(0);

  // --- History-index stamping for direction detection -----------------
  useEffect(() => {
    if (window.history.state?.__ti == null) {
      const state = { ...(window.history.state || {}), __ti: 0 };
      window.history.replaceState(state, "");
      writeStoredIndex(0);
    }
    lastKnownIndexRef.current = window.history.state?.__ti ?? readStoredIndex();

    function onPopState(event) {
      const nextIndex = event.state?.__ti ?? lastKnownIndexRef.current;
      directionRef.current = computeDirection(lastKnownIndexRef.current, nextIndex);
      lastKnownIndexRef.current = nextIndex;
      writeStoredIndex(nextIndex);
      poppedRef.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function killCurrent() {
    timelineRef.current?.kill();
    timelineRef.current = null;
    // Reset anything a killed-mid-flight timeline may have left dirty.
    const main = document.getElementById("page-main");
    if (main) gsap.set(main.querySelectorAll("[data-transition-stagger] > *"), { clearProps: "all" });
    gsap.set([sweepRef.current, hatchRef.current, crosshairLeftRef.current, crosshairRightRef.current, noteRef.current], {
      clearProps: "all",
      opacity: 0,
    });
    overlayRef.current?.querySelectorAll("[data-transition-ghost]").forEach((el) => el.remove());
  }

  function announce(message) {
    if (liveRegionRef.current) liveRegionRef.current.textContent = message;
  }

  function focusMain() {
    const main = document.getElementById("page-main");
    const heading = main?.querySelector("h1, h2");
    // A plain <h1>/<h2> isn't natively focusable — .focus() on it is a
    // silent no-op without this. Setting the tabIndex property (not just
    // reading it — the getter already defaults to -1 on any element)
    // adds the actual tabindex="-1" attribute, which only enables
    // *programmatic* focus; it doesn't add the heading to Tab order.
    if (heading) heading.tabIndex = -1;
    (heading ?? main)?.focus({ preventScroll: true });
  }

  // --- Beat 1: strike out ------------------------------------------------
  function runLeave(main, tl) {
    const items = main.querySelectorAll("[data-transition-stagger] > *");
    tl.to(
      items,
      {
        opacity: 0,
        y: -LEAVE.lift,
        scale: LEAVE.scale,
        duration: LEAVE.duration,
        stagger: LEAVE.stagger,
        ease: LEAVE.ease,
      },
      0,
    );
  }

  // --- Beat 2: the rule sweeps --------------------------------------------
  function runSweep(tl, direction) {
    const viewportWidth = window.innerWidth;
    const columnHalf = 380; // --column: 760px / 2
    const railX = [viewportWidth / 2 - columnHalf, viewportWidth / 2 + columnHalf];
    const forward = direction !== "back";

    gsap.set(sweepRef.current, { transformOrigin: forward ? "left center" : "right center", scaleX: 0, opacity: 1 });
    gsap.set(hatchRef.current, { transformOrigin: forward ? "left center" : "right center", scaleX: 0, opacity: 0 });

    tl.to(sweepRef.current, { scaleX: 1, duration: SWEEP.duration, ease: SWEEP.ease }, SWEEP.start);
    tl.to(hatchRef.current, { scaleX: 1, opacity: 1, duration: SWEEP.duration, ease: SWEEP.ease }, SWEEP.start);
    tl.to(hatchRef.current, { opacity: 0, duration: SWEEP.hatchBandFade }, SWEEP.start + SWEEP.duration);
    tl.to(sweepRef.current, { opacity: 0, duration: SWEEP.hatchBandFade }, SWEEP.start + SWEEP.duration);

    // Crosshairs snap in as the sweeping edge crosses each rail's x position.
    const crosshairs = [crosshairLeftRef.current, crosshairRightRef.current];
    const orderedX = forward ? railX : [...railX].reverse();
    const orderedRefs = forward ? crosshairs : [...crosshairs].reverse();
    orderedX.forEach((x, i) => {
      const progress = forward ? x / viewportWidth : (viewportWidth - x) / viewportWidth;
      const crossAt = SWEEP.start + progress * SWEEP.duration;
      const el = orderedRefs[i];
      tl.fromTo(el, { opacity: 0, scale: 0.6 }, { opacity: 0.7, scale: 1, duration: 0.08 }, crossAt);
      tl.to(el, { opacity: 0, duration: SWEEP.crosshairFade }, crossAt + 0.08);
    });

    // The bottom-left drafting note.
    if (noteRef.current) {
      tl.fromTo(noteRef.current, { opacity: 0 }, { opacity: 1, duration: NOTE.fadeDuration }, NOTE.inAt);
      tl.to(noteRef.current, { opacity: 0, duration: NOTE.fadeDuration }, NOTE.outAt);
    }
  }

  // --- Beat 3: draw in -----------------------------------------------------
  function runDrawIn(main, tl, direction) {
    const rails = main.querySelectorAll("[data-transition-rail]");
    const forward = direction !== "back";

    gsap.set(rails, { scaleY: 0, transformOrigin: forward ? "top center" : "bottom center" });
    tl.to(rails, { scaleY: 1, duration: ENTER.railsDuration, ease: "power2.out" }, ENTER.railsStart);

    const items = main.querySelectorAll("[data-transition-stagger] > *");
    gsap.set(items, { opacity: 0, y: ENTER.contentRise });
    tl.to(
      items,
      { opacity: 1, y: 0, duration: ENTER.contentDuration, stagger: ENTER.stagger, ease: "power2.out" },
      ENTER.contentStart,
    );

    const hatchWipe = main.querySelector("[data-transition-hatch-wipe]");
    // The incoming page's own section dividers already carry the hatch
    // pattern (SectionDivider.jsx) — "wipes in" is the content stagger
    // itself revealing them left-to-right via the stagger above; no
    // separate wipe element is needed when every divider already IS the
    // hatch texture the spec describes.
    void hatchWipe;
  }

  // --- Public entry point: TransitionLink calls this ------------------------
  function navigate(href, { flipKey } = {}) {
    if (!shouldTransition(pathname, href)) {
      router.push(href);
      return;
    }

    killCurrent();

    const reduced = prefersReducedMotion();
    const main = document.getElementById("page-main");
    if (!main) {
      router.push(href);
      return;
    }

    directionRef.current = "forward"; // an explicit link click is always a forward move
    const nextIndex = readStoredIndex() + 1;

    const variant = sharedElementVariant(pathname, href);
    let ghost = null;
    if (!reduced && variant && overlayRef.current) {
      const key = flipKey ?? defaultFlipKeyForVariant(variant, pathname, href);
      const sourceEl = key ? document.querySelector(`[data-flip-key="${CSS.escape(key)}"]`) : null;
      if (sourceEl) {
        const { el, rect } = createGhost(sourceEl, overlayRef.current);
        el.setAttribute("data-transition-ghost", "");
        ghost = { el, fromRect: rect, key };
      }
    }

    navigatingRef.current = true;
    pendingRef.current = { ghost, href };
    announce(`Loading ${href}`);

    const tl = gsap.timeline({
      onComplete: () => {
        writeStoredIndex(nextIndex);
        lastKnownIndexRef.current = nextIndex;
        const state = { ...(window.history.state || {}), __ti: nextIndex };
        window.history.replaceState(state, "");
        router.push(href);
      },
    });
    timelineRef.current = tl;

    if (reduced) {
      tl.to(main, { opacity: 0, duration: REDUCED_MOTION.duration });
    } else {
      runLeave(main, tl);
      runSweep(tl, "forward");

      // Cover flight: "the card's title, description and stack pills
      // fade 120ms earlier, so only the image travels" — only applies
      // list -> detail, where the ghost's source is a card's own cover.
      if (ghost && variant === "cover") {
        const slug = ghost.key.replace("project-cover-", "");
        const cardText = document.querySelector(`[data-flip-card-text="${CSS.escape(slug)}"]`);
        if (cardText) tl.to(cardText, { opacity: 0, duration: 0.12 }, 0);
      }
    }
  }

  // --- Runs once the new route has committed (our own navigate()) -------------
  function runEnter(pending) {
    const main = document.getElementById("page-main");
    if (!main) return;

    const reduced = prefersReducedMotion();
    const tl = gsap.timeline({
      onComplete: () => {
        pending?.ghost?.el.remove();
        announce(`Navigated to ${pending?.href ?? window.location.pathname}`);
        focusMain();
      },
    });
    timelineRef.current = tl;

    if (reduced) {
      gsap.set(main, { opacity: 0 });
      tl.to(main, { opacity: 1, duration: REDUCED_MOTION.duration });
      return;
    }

    gsap.set(main, { opacity: 1 });
    runDrawIn(main, tl, "forward");

    if (pending?.ghost) {
      flyGhost(tl, pending.ghost);
    }
  }

  /** Browser back/forward: the DOM already swapped before any of our JS ran, so only the enter half plays, reversed. */
  function runPopEnter(direction) {
    const main = document.getElementById("page-main");
    if (!main) return;
    killCurrent();

    const reduced = prefersReducedMotion();
    const tl = gsap.timeline({
      onComplete: () => {
        announce(`Navigated to ${window.location.pathname}`);
        focusMain();
      },
    });
    timelineRef.current = tl;

    if (reduced) {
      gsap.set(main, { opacity: 0 });
      tl.to(main, { opacity: 1, duration: REDUCED_MOTION.duration });
      return;
    }

    gsap.set(main, { opacity: 1 });
    runSweep(tl, direction);
    runDrawIn(main, tl, direction);
  }

  /** Flies the cloned ghost from its captured `fromRect` to the matching element on the new page. */
  function flyGhost(tl, ghost) {
    const destEl = document.querySelector(`[data-flip-key="${CSS.escape(ghost.key)}"]`);
    if (!destEl) {
      tl.to(ghost.el, { opacity: 0, duration: 0.15 }, 0);
      return;
    }

    const toRect = destEl.getBoundingClientRect();
    const destComputed = getComputedStyle(destEl);
    gsap.set(destEl, { opacity: 0 });

    tl.to(
      ghost.el,
      {
        left: toRect.left,
        top: toRect.top,
        width: toRect.width,
        height: toRect.height,
        fontSize: destComputed.fontSize,
        duration: FLIP.duration,
        ease: FLIP.ease,
        onComplete: () => gsap.set(destEl, { opacity: 1 }),
      },
      0,
    );
  }

  // --- Reacts to the route actually having committed --------------------
  // Declared after every run*/flyGhost function above so it can
  // reference them directly (function declarations hoist, but this
  // keeps the effect's dependency on them textually obvious too).
  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }

    if (navigatingRef.current) {
      navigatingRef.current = false;
      runEnter(pendingRef.current);
      pendingRef.current = null;
    } else if (poppedRef.current) {
      poppedRef.current = false;
      runPopEnter(directionRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-runs on pathname; the run*/ helpers close over refs, not reactive state
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <div ref={overlayRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]">
        <div
          ref={sweepRef}
          className="absolute left-0 top-1/2 h-px w-full bg-accent opacity-0"
          style={{ transform: "scaleX(0)" }}
        />
        <div
          ref={hatchRef}
          className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 opacity-0"
          style={{ backgroundImage: HATCH_BG, transform: "scaleX(0)" }}
        />
        <span
          ref={crosshairLeftRef}
          className="absolute top-1/2 flex size-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center opacity-0"
          style={{ left: "calc(50% - 380px)" }}
        >
          <span className="absolute h-px w-2.5 bg-rail-node" />
          <span className="absolute h-2.5 w-px bg-rail-node" />
        </span>
        <span
          ref={crosshairRightRef}
          className="absolute top-1/2 flex size-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center opacity-0"
          style={{ left: "calc(50% + 380px)" }}
        >
          <span className="absolute h-px w-2.5 bg-rail-node" />
          <span className="absolute h-2.5 w-px bg-rail-node" />
        </span>
        <p
          ref={noteRef}
          className="absolute bottom-4 left-4 font-mono text-[10px] text-text-muted opacity-0"
        />
      </div>

      <div ref={liveRegionRef} aria-live="polite" role="status" className="sr-only" />
    </TransitionContext.Provider>
  );
}

/**
 * Resolves the default flip key for a route pair when a TransitionLink
 * didn't pass one explicitly (e.g. Nav's plain "Projects" link, or the
 * detail page's "Back to projects" link — the cover's slug lives in
 * whichever of the two paths is the `/projects/<slug>` one).
 */
export function defaultFlipKeyForVariant(variant, fromPath, toPath) {
  if (variant === "heading") return "projects-heading";
  if (variant === "cover") {
    const slug = projectSlugFromPath(toPath) ?? projectSlugFromPath(fromPath);
    return slug ? `project-cover-${slug}` : null;
  }
  return null;
}
