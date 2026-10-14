"use client";

import { useLayoutEffect } from "react";
import type { RevealMode } from "@/lib/transitions/interestImageReveal";
import {
  INITIAL_PAINT_DELAY_MS,
  OBSERVER_OPTIONS,
  ROUTE_CHANGE_GUARD_MS,
} from "@/lib/transitions/interestImageReveal";
import { shouldUseSimpleReveal, staggerDelayMs } from "@/lib/interestImages/reveal";

/**
 * Drives the interest-images layer's "pinned to the sheet" entrance:
 * finds every `[data-reveal-item]` inside `containerRef`, marks them all
 * `data-reveal-pending` synchronously (the CSS "about to animate, not
 * yet revealed" state — see globals.css), then arms a single shared
 * `IntersectionObserver` once `ROUTE_CHANGE_GUARD_MS` has passed (so
 * this never visibly runs at the same time as `TransitionProvider`'s
 * own page-transition choreography). Each element that enters the
 * viewport gets `data-revealed` set after a stagger-aware delay and is
 * then unobserved — once per mount, never retriggered on scrolling back
 * up. Mutates the DOM directly via refs rather than React state, so a
 * batch of images revealing together costs attribute writes, not
 * re-renders.
 *
 * Callers remount this (e.g. via `key={pathname}`) on route change to
 * get a clean slate — the hook itself has no opinion about routing.
 */
export function useInterestImageReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    // No "has this already run" guard: every resource this effect
    // creates (the observer, the arm timeout, the reveal timeouts) is
    // local to this one invocation and fully disposed by the cleanup
    // below, so it's naturally safe for React StrictMode's dev-only
    // mount -> effect -> cleanup -> effect double-invoke to run this
    // twice. A guard here previously caused a real bug: the first pass's
    // observer got torn down by StrictMode's synthetic cleanup, and a
    // guard made the second (actually-persisting) pass bail out early —
    // net result, no observer ever ran at all.
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-item]"));
    if (items.length === 0) return;

    const simple = shouldUseSimpleReveal(window);
    const mode: RevealMode = simple ? "simple" : "full";
    for (const item of items) {
      item.dataset.revealMode = mode;
      item.dataset.revealPending = "true";
    }

    let observer: IntersectionObserver | null = null;
    const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();
    let isFirstBatch = true;

    function reveal(el: HTMLElement, delayMs: number) {
      const timeout = setTimeout(() => {
        pendingTimeouts.delete(timeout);
        // The "revealed" CSS rules don't require `data-reveal-pending` —
        // clearing it here (rather than leaving it set forever) matters
        // because its own rule sets `transition: none` on the photo at
        // higher specificity than the base rule's real transition, which
        // would otherwise permanently kill the later hover-lift transition.
        delete el.dataset.revealPending;
        el.dataset.revealed = "true";
      }, delayMs);
      pendingTimeouts.add(timeout);
    }

    function handleIntersections(entries: IntersectionObserverEntry[]) {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) {
        isFirstBatch = false;
        return;
      }

      // Top-first, matching the spec's "stagger... in order of vertical
      // position, top first."
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      const baseDelay = isFirstBatch ? INITIAL_PAINT_DELAY_MS : 0;
      visible.forEach((entry, index) => {
        reveal(entry.target as HTMLElement, baseDelay + staggerDelayMs(index));
        observer?.unobserve(entry.target);
      });

      isFirstBatch = false;
    }

    const armTimeout = setTimeout(() => {
      observer = new IntersectionObserver(handleIntersections, OBSERVER_OPTIONS);
      for (const item of items) observer.observe(item);
    }, ROUTE_CHANGE_GUARD_MS);

    return () => {
      clearTimeout(armTimeout);
      for (const timeout of pendingTimeouts) clearTimeout(timeout);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-only; callers remount this component (e.g. via `key={pathname}`) to reset
  }, []);
}
