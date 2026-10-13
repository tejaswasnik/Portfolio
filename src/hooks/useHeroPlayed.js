"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hero-played";

/**
 * The hero entrance (A5) "plays once per session" (spec design
 * principle #6). Returns `true` once this tab's session has already
 * seen it play — callers pass that straight to Motion's `initial`
 * (`initial={played ? false : "hidden"}`) to skip the entrance on
 * repeat visits within the session.
 *
 * Defaults to "not yet played" (so the entrance runs) until the
 * `useEffect` below resolves, per the plan's own instruction ("read in
 * useEffect; default to playing") — acceptable because the hero is the
 * one place CLAUDE.md's "no layout shift before hydration" rule doesn't
 * apply: "only the hero (A5) may start at opacity:0 in SSR output".
 */
export function useHeroPlayed() {
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(STORAGE_KEY) === "true";
      if (!alreadyPlayed) sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Private browsing / storage disabled — just let it replay every time.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first real read has to happen client-side (sessionStorage isn't available during SSR)
    setPlayed(alreadyPlayed);
  }, []);

  return played;
}
