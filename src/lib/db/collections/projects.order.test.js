import { describe, expect, it } from "vitest";
import { insertIdAtPosition } from "./projects.js";

describe("insertIdAtPosition (New/Edit project form's Display order field)", () => {
  const existing = ["a", "b", "c"];

  it("inserts at the start (position 1)", () => {
    expect(insertIdAtPosition(existing, "x", 1)).toEqual(["x", "a", "b", "c"]);
  });

  it("inserts in the middle", () => {
    expect(insertIdAtPosition(existing, "x", 2)).toEqual(["a", "x", "b", "c"]);
  });

  it("inserts at the end when position is 'last'", () => {
    expect(insertIdAtPosition(existing, "x", "last")).toEqual(["a", "b", "c", "x"]);
  });

  it("clamps an out-of-range position to the end", () => {
    expect(insertIdAtPosition(existing, "x", 99)).toEqual(["a", "b", "c", "x"]);
  });

  it("clamps position 0 or below to the start", () => {
    expect(insertIdAtPosition(existing, "x", 0)).toEqual(["x", "a", "b", "c"]);
  });

  it("moving an id already in the list removes the old occurrence first", () => {
    expect(insertIdAtPosition(existing, "a", "last")).toEqual(["b", "c", "a"]);
    expect(insertIdAtPosition(existing, "b", 1)).toEqual(["b", "a", "c"]);
  });
});
