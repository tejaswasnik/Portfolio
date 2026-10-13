// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { magneticOffset } from "./Magnetic.jsx";

describe("magneticOffset", () => {
  it("scales by strength and clamps each axis to ±max", () => {
    expect(magneticOffset(40, 0, 0.25, 6)).toEqual({ x: 6, y: 0 });
  });

  it("scales both axes under the clamp unchanged", () => {
    expect(magneticOffset(8, -4, 0.25, 6)).toEqual({ x: 2, y: -1 });
  });

  it("returns zero offset for zero distance", () => {
    expect(magneticOffset(0, 0, 0.25, 6)).toEqual({ x: 0, y: 0 });
  });
});
