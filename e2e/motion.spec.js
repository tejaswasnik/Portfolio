import { test, expect } from "@playwright/test";

/**
 * Task 1 smoke test (docs/superpowers/plans/2026-10-13-portfolio-micro-animations.md):
 * a visitor with OS reduced-motion on must see the hero content immediately —
 * MotionConfig's `reducedMotion="user"` (MotionProvider.jsx) strips the
 * translate/scale/blur entrance, so the heading should already be visible
 * well inside the 500ms reveal duration, and nothing should throw while
 * mounting the motion tree.
 */
test.describe("home with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("renders the hero heading quickly with no console errors", async ({ page }) => {
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Tejas Wasnik" })).toBeVisible({
      timeout: 300,
    });

    expect(consoleErrors).toEqual([]);
  });
});

/**
 * Task 5 (A8 section reveals): "Server-rendered HTML must be readable
 * with JS disabled" — Reveal.jsx renders every section at full opacity
 * by default and only switches to the animated hidden state once a
 * client-side effect confirms it, so with JS off that effect never
 * runs and content must just be there.
 */
test.describe("home with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("every section heading is visible", async ({ page }) => {
    await page.goto("/");

    for (const name of ["About", "Projects", "Activity", "Stack", "Let's talk."]) {
      const heading = page.getByRole("heading", { name, exact: false });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("opacity", "1");
    }
  });
});
