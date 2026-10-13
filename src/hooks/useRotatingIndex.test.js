// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRotatingIndex } from "./useRotatingIndex.js";

function setHidden(hidden) {
  Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useRotatingIndex", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances 0 -> 1 after one interval", () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000));
    expect(result.current).toBe(0);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);
  });

  it("wraps length-1 -> 0", () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000));
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current).toBe(0);
  });

  it("stops advancing while the tab is hidden, even across many intervals", () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);

    act(() => setHidden(true));
    act(() => vi.advanceTimersByTime(10000)); // 10x the interval
    expect(result.current).toBe(1); // unchanged while hidden

    act(() => setHidden(false));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(2); // resumes, one step at a time
  });

  it("never advances for length <= 1", () => {
    const { result } = renderHook(() => useRotatingIndex(1, 1000));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
  });

  it("respects opts.paused", () => {
    const { result } = renderHook(() => useRotatingIndex(3, 1000, { paused: true }));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
  });
});
