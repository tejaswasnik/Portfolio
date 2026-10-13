// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TextReveal from "./TextReveal.jsx";

describe("TextReveal", () => {
  it("renders an accessible heading with the full text as its name", () => {
    render(<TextReveal text="Tejas Wasnik" as="h1" />);
    expect(screen.getByRole("heading", { name: "Tejas Wasnik" })).toBeInTheDocument();
  });

  it("hides the per-word spans from assistive tech", () => {
    render(<TextReveal text="Tejas Wasnik" as="h1" />);
    const heading = screen.getByRole("heading", { name: "Tejas Wasnik" });
    const hiddenSpans = heading.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenSpans.length).toBeGreaterThan(0);
  });

  it("defaults to a span when `as` is omitted", () => {
    render(<TextReveal text="hello" />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
