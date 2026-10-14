// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  initialDriftPx,
  roundedRectPerimeter,
  shouldUseSimpleReveal,
  staggerDelayMs,
} from "./reveal";

describe("roundedRectPerimeter", () => {
  it("matches a plain rectangle's perimeter when radius is 0", () => {
    expect(roundedRectPerimeter(100, 50, 0)).toBeCloseTo(300, 5);
  });

  it("is smaller than the bounding-box perimeter once corners are rounded", () => {
    const sharp = roundedRectPerimeter(160, 120, 0);
    const rounded = roundedRectPerimeter(160, 120, 8);
    expect(rounded).toBeLessThan(sharp);
  });

  it("clamps an oversized radius to half the shorter side", () => {
    // radius 1000 on a 40x40 box should behave the same as radius 20
    // (a full circle), not produce a negative straight-edge length.
    expect(roundedRectPerimeter(40, 40, 1000)).toBeCloseTo(roundedRectPerimeter(40, 40, 20), 5);
  });
});

describe("initialDriftPx", () => {
  it("drifts in from the left for a negative offsetX", () => {
    expect(initialDriftPx(-120, 10)).toBe(-10);
  });

  it("drifts in from the right for a positive offsetX", () => {
    expect(initialDriftPx(120, 10)).toBe(10);
  });

  it("treats offsetX of exactly 0 as the right margin", () => {
    expect(initialDriftPx(0, 10)).toBe(10);
  });
});

describe("staggerDelayMs", () => {
  it("has no delay for the first item in a batch", () => {
    expect(staggerDelayMs(0)).toBe(0);
  });

  it("steps by 70ms per position", () => {
    expect(staggerDelayMs(1)).toBe(70);
    expect(staggerDelayMs(2)).toBe(140);
  });

  it("caps the stagger chain at 6 — anything beyond reveals with the capped delay, not further", () => {
    expect(staggerDelayMs(6)).toBe(staggerDelayMs(7));
    expect(staggerDelayMs(20)).toBe(staggerDelayMs(6));
  });

  it("treats a negative index defensively as no delay", () => {
    expect(staggerDelayMs(-1)).toBe(0);
  });
});

function mockWindow({
  reducedMotion = false,
  saveData = false,
  deviceMemory,
  hardwareConcurrency,
}: {
  reducedMotion?: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}) {
  return {
    matchMedia: vi.fn().mockReturnValue({ matches: reducedMotion }),
    navigator: {
      connection: { saveData },
      deviceMemory,
      hardwareConcurrency,
    },
  } as unknown as Window;
}

describe("shouldUseSimpleReveal", () => {
  it("is false on an ordinary, capable device with no OS preference", () => {
    expect(shouldUseSimpleReveal(mockWindow({ hardwareConcurrency: 8, deviceMemory: 8 }))).toBe(
      false,
    );
  });

  it("is true when prefers-reduced-motion is on", () => {
    expect(shouldUseSimpleReveal(mockWindow({ reducedMotion: true }))).toBe(true);
  });

  it("is true when the connection reports saveData", () => {
    expect(shouldUseSimpleReveal(mockWindow({ saveData: true }))).toBe(true);
  });

  it("is true on a low-memory device", () => {
    expect(shouldUseSimpleReveal(mockWindow({ deviceMemory: 2 }))).toBe(true);
  });

  it("is true on a device with very few cores", () => {
    expect(shouldUseSimpleReveal(mockWindow({ hardwareConcurrency: 2 }))).toBe(true);
  });
});
