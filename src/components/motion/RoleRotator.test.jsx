// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RoleRotator from "./RoleRotator.jsx";

const roles = ["Backend developer", "Full-stack engineer", "Open-source contributor"];

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

describe("RoleRotator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("under reduced motion, renders only the first role and never changes", () => {
    mockReducedMotion(true);
    render(<RoleRotator roles={roles} />);

    expect(screen.getByText(roles[0])).toBeInTheDocument();
    vi.advanceTimersByTime(10000);
    expect(screen.getByText(roles[0])).toBeInTheDocument();
    expect(screen.queryByText(roles[1])).not.toBeInTheDocument();
  });

  it("has no aria-live region (cycling text would spam a screen reader)", () => {
    mockReducedMotion(true);
    render(<RoleRotator roles={roles} />);
    expect(document.querySelector("[aria-live]")).not.toBeInTheDocument();
  });

  it("exposes the full role list as the container's aria-label, with the visible text hidden from assistive tech", () => {
    mockReducedMotion(true);
    render(<RoleRotator roles={roles} />);
    const container = screen.getByLabelText(roles.join(", "));
    expect(container).toBeInTheDocument();
    const visibleText = screen.getByText(roles[0]);
    expect(visibleText).toHaveAttribute("aria-hidden", "true");
  });
});
