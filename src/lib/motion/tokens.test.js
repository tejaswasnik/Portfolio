import { describe, expect, it } from "vitest";
import { DUR, EASE, SPRING, STAGGER, revealVariants } from "./tokens.js";

describe("motion tokens", () => {
  it("EASE.out matches the spec's exact cubic-bezier", () => {
    expect(EASE.out).toEqual([0.23, 1, 0.32, 1]);
  });

  it("EASE.inOut matches the spec's exact cubic-bezier", () => {
    expect(EASE.inOut).toEqual([0.77, 0, 0.175, 1]);
  });

  it("DUR values match the spec (seconds, not ms)", () => {
    expect(DUR.press).toBe(0.12);
    expect(DUR.hover).toBe(0.18);
    expect(DUR.ui).toBe(0.24);
    expect(DUR.reveal).toBe(0.5);
  });

  it("STAGGER matches the spec", () => {
    expect(STAGGER).toBe(0.04);
  });

  it("SPRING.layout and SPRING.magnetic match the spec's exact physics", () => {
    expect(SPRING.layout).toEqual({ type: "spring", stiffness: 500, damping: 40, mass: 0.8 });
    expect(SPRING.magnetic).toEqual({ type: "spring", stiffness: 300, damping: 20, mass: 0.5 });
  });

  it("revealVariants.hidden stays within the 8px max-translate constraint", () => {
    expect(revealVariants.hidden.y).toBe(8);
    expect(revealVariants.hidden.opacity).toBe(0);
    expect(revealVariants.hidden.filter).toBe("blur(4px)");
  });

  it("revealVariants.visible uses DUR.reveal and EASE.out", () => {
    expect(revealVariants.visible.transition.duration).toBe(DUR.reveal);
    expect(revealVariants.visible.transition.ease).toEqual(EASE.out);
  });
});
