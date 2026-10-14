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
