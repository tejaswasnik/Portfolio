// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CountUp from "./CountUp.jsx";

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
});
