import { describe, expect, it } from "vitest";
import { defaultSizeFromAspectRatio, overlapRatio, pickPlacement } from "./placement.js";

/** Deterministic sequence generator so a test can control exactly what `rng()` returns next. */
function sequence(values) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

describe("pickPlacement", () => {
  it("alternates side from the previous item", () => {
    const size = { width: 120, height: 120 };
    const left = pickPlacement({ size, previousSide: "right", existing: [] });
    expect(left.side).toBe("left");

    const right = pickPlacement({ size, previousSide: "left", existing: [] });
    expect(right.side).toBe("right");

    const firstEver = pickPlacement({ size, previousSide: null, existing: [] });
    expect(firstEver.side).toBe("left");
  });

  it("never places inside the content column (|offsetX| stays well above 400)", () => {
    for (let i = 0; i < 50; i++) {
      const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: i % 2 ? "left" : "right", existing: [] });
      expect(Math.abs(placement.offsetX)).toBeGreaterThanOrEqual(420);
      expect(Math.abs(placement.offsetX)).toBeLessThanOrEqual(690);
    }
  });

  it("keeps topPct within 4-96", () => {
    for (let i = 0; i < 50; i++) {
      const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: null, existing: [] });
      expect(placement.topPct).toBeGreaterThanOrEqual(4);
      expect(placement.topPct).toBeLessThanOrEqual(96);
    }
  });

  it("never lands rotation in the -1..1 dead zone", () => {
    // Force the underlying rotation roll to land dead-center (0 before the
    // nudge) every time, to prove the dead-zone escape actually fires.
    const rng = sequence([0.1, 0.5, 0.5, 0.1, 0.5, 0.5, 0.1, 0.5, 0.5]);
    for (let i = 0; i < 3; i++) {
      const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: null, existing: [], rng });
      expect(Math.abs(placement.rotation)).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps rotation within -5..5", () => {
    for (let i = 0; i < 50; i++) {
      const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: null, existing: [] });
      expect(placement.rotation).toBeGreaterThanOrEqual(-5);
      expect(placement.rotation).toBeLessThanOrEqual(5);
    }
  });

  it("avoids the right-side index zone (18-27%) on the right side", () => {
    for (let i = 0; i < 50; i++) {
      const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: "left", existing: [] });
      expect(placement.side).toBe("right");
      const inZone = placement.topPct >= 18 && placement.topPct <= 27;
      expect(inZone).toBe(false);
    }
  });

  it("retries away from a heavily-overlapping existing item", () => {
    const existing = [{ offsetX: -600, topPct: 50, width: 100, height: 100 }];
    // First few rolls land exactly on the existing item (full overlap);
    // a later roll lands clear. Each candidate consumes 3 rng() calls
    // (offsetX, topPct, rotation).
    const rng = sequence([
      0.63, 0.5, 0.5, // offsetX ~ -600 (same spot) -> full overlap
      0.63, 0.5, 0.5, // same again
      0.0, 0.1, 0.5, // offsetX at the low end, topPct low -> clear
    ]);
    const placement = pickPlacement({ size: { width: 100, height: 100 }, previousSide: "right", existing, rng });
    expect(overlapRatio(placement, existing[0], 1932)).toBeLessThanOrEqual(0.1);
  });

  it("falls back to the least-overlapping candidate when every retry overlaps too much", () => {
    const size = { width: 300, height: 300 };
    // A single huge existing item spanning nearly the whole left margin —
    // every left-side candidate will overlap it heavily.
    const existing = [{ offsetX: -550, topPct: 50, width: 300, height: 1900 }];
    const placement = pickPlacement({ size, previousSide: "right", existing });
    expect(placement.side).toBe("left");
    expect(Number.isFinite(placement.offsetX)).toBe(true);
    expect(Number.isFinite(placement.topPct)).toBe(true);
  });
});

describe("overlapRatio", () => {
  it("is 1 for two identical, fully-overlapping items", () => {
    const item = { offsetX: -500, topPct: 50, width: 100, height: 100 };
    expect(overlapRatio(item, item, 1932)).toBeCloseTo(1, 5);
  });

  it("is 0 for two items far apart", () => {
    const a = { offsetX: -600, topPct: 10, width: 100, height: 100 };
    const b = { offsetX: 600, topPct: 90, width: 100, height: 100 };
    expect(overlapRatio(a, b, 1932)).toBe(0);
  });

  it("is a fraction of the smaller item's area for a partial overlap", () => {
    const a = { offsetX: 0, topPct: 50, width: 100, height: 100 };
    const b = { offsetX: 50, topPct: 50, width: 100, height: 100 };
    const ratio = overlapRatio(a, b, 1932);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThan(1);
  });
});

describe("defaultSizeFromAspectRatio", () => {
  it("scales the longest side to 160 and preserves aspect ratio", () => {
    const result = defaultSizeFromAspectRatio({ naturalWidth: 1600, naturalHeight: 800 });
    expect(result.width).toBe(160);
    expect(result.height).toBe(80);
  });

  it("works for a portrait image too", () => {
    const result = defaultSizeFromAspectRatio({ naturalWidth: 800, naturalHeight: 1600 });
    expect(result.height).toBe(160);
    expect(result.width).toBe(80);
  });

  it("clamps a tiny image up to the 40px minimum", () => {
    const result = defaultSizeFromAspectRatio({ naturalWidth: 20, naturalHeight: 20 });
    expect(result.width).toBeGreaterThanOrEqual(40);
    expect(result.height).toBeGreaterThanOrEqual(40);
  });

  it("falls back to a square default for missing dimensions", () => {
    expect(defaultSizeFromAspectRatio({ naturalWidth: 0, naturalHeight: 0 })).toEqual({ width: 160, height: 160 });
  });
});
