"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cycles `0..length-1` on a `setInterval`, pausing entirely while the
 * tab is hidden instead of letting swaps queue up and jump on return
 * (`RoleRotator`'s Review Focus requirement #4 — "doesn't queue up
 * swaps while hidden and jump on return"). One `setInterval`, cleared
 * and re-armed around `visibilitychange`, never an accumulating chain
 * of `setTimeout`s.
 * @param {number} length
 * @param {number} intervalMs
 * @param {{ paused?: boolean }} [opts]
 * @returns {number}
 */
export function useRotatingIndex(length, intervalMs, opts = {}) {
  const { paused = false } = opts;
  const [index, setIndex] = useState(0);
  const lengthRef = useRef(length);
  useEffect(() => {
    lengthRef.current = length;
  });

  useEffect(() => {
    if (paused || length <= 1) return undefined;

    let timer = null;

    function start() {
      timer = setInterval(() => {
        setIndex((current) => (current + 1) % lengthRef.current);
      }, intervalMs);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function onVisibilityChange() {
      if (document.hidden) stop();
      else start();
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [length, intervalMs, paused]);

  // `length` can shrink between renders (e.g. admin edits taglines down
  // to fewer entries) — clamp defensively so the index never points past
  // the end.
  return length > 0 ? index % length : 0;
}
