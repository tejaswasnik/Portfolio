import { describe, expect, it } from "vitest";
import { computeDirection } from "./historyIndex.js";

describe("computeDirection", () => {
  it("is 'forward' when the next index is higher", () => {
    expect(computeDirection(0, 1)).toBe("forward");
    expect(computeDirection(3, 5)).toBe("forward");
  });

  it("is 'back' when the next index is lower", () => {
    expect(computeDirection(3, 2)).toBe("back");
    expect(computeDirection(1, 0)).toBe("back");
  });

  it("defaults to 'forward' for an equal index (defensive — shouldn't normally happen)", () => {
    expect(computeDirection(2, 2)).toBe("forward");
  });

  it("defaults to 'forward' when either index is missing (first load, no history state yet)", () => {
    expect(computeDirection(null, 1)).toBe("forward");
    expect(computeDirection(0, null)).toBe("forward");
    expect(computeDirection(undefined, undefined)).toBe("forward");
  });
});
