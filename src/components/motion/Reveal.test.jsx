// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Reveal from "./Reveal.jsx";

describe("Reveal", () => {
  it("always renders its children's text content, regardless of fold position", () => {
    render(<Reveal>Section content</Reveal>);
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("above-the-fold content (jsdom's default zeroed rect) renders at full opacity immediately — no hidden-then-reveal flash", () => {
    render(<Reveal>Hero-adjacent content</Reveal>);
    const el = screen.getByText("Hero-adjacent content");
    // initial={false} means Motion starts directly at the "visible"
    // variant's values — it should never have applied opacity:0.
    expect(el.style.opacity).not.toBe("0");
  });

  it("content below the fold at mount still renders its text (content always readable, animation aside)", () => {
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 5000,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    }));

    render(<Reveal>Below the fold</Reveal>);
    expect(screen.getByText("Below the fold")).toBeInTheDocument();

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it("renders a stagger container with Reveal.Item children", () => {
    render(
      <Reveal stagger>
        <Reveal.Item>First</Reveal.Item>
        <Reveal.Item>Second</Reveal.Item>
      </Reveal>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("supports a custom `as` tag", () => {
    render(<Reveal as="section">Tagged content</Reveal>);
    const el = screen.getByText("Tagged content");
    expect(el.tagName).toBe("SECTION");
  });
});
