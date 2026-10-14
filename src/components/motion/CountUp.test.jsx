// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CountUp from "./CountUp.jsx";

function mockReducedMotion(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes("prefers-reduced-motion") ? matches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("CountUp", () => {
  it("renders the final value directly (SSR-correct, no hydration mismatch, correct with JS disabled)", () => {
    render(<CountUp to={393} />);
    expect(screen.getByText("393")).toBeInTheDocument();
  });

  it("uses the tabular-nums class so digits don't jitter width", () => {
    render(<CountUp to={393} />);
    expect(screen.getByText("393")).toHaveClass("tabular-nums");
  });

  it("never enters view in this test environment (IntersectionObserver is stubbed to never fire), so it stays at the final value with no intermediate numbers", () => {
    render(<CountUp to={393} />);
    expect(screen.getByText("393")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("under reduced motion, renders the static final value with no intermediate numbers", () => {
    // jsdom's stubbed IntersectionObserver (src/test/setup.js) never fires,
    // so `inView` can't be forced true here to exercise the animate-vs-skip
    // branch in isolation — real "does reduced motion actually suppress an
    // in-view count-up" coverage lives in Playwright (e2e/motion.spec.js),
    // same as RoleRotator/Reveal's unit tests cover their own render-time
    // reduced-motion branch directly. This still locks in the observable
    // contract: reduced motion never leaves the final value showing
    // anything but the final value.
    mockReducedMotion(true);
    render(<CountUp to={393} />);
    expect(screen.getByText("393")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
