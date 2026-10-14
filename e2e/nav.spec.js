import { test, expect } from "@playwright/test";

/**
 * Task 4 (docs/superpowers/plans/2026-10-13-portfolio-micro-animations.md):
 * the A7 active-route pill slides via `layoutId="nav-pill"` (Nav.jsx) —
 * that only works because Nav is hoisted into (public)/layout.js and
 * survives the route change, instead of unmounting/remounting per page.
 */

function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test("active pill moves from Home to Projects", async ({ page }) => {
  await page.goto("/");

  const primaryNav = page.getByRole("navigation", { name: "Primary" });
  const pill = primaryNav.locator("[data-nav-pill]");
  await expect(pill).toHaveCount(1);

  const homeLink = primaryNav.getByRole("link", { name: "Home" });
  const homeBox = await homeLink.boundingBox();
  const pillBoxBefore = await pill.boundingBox();
  expect(boxesOverlap(pillBoxBefore, homeBox)).toBe(true);

  await primaryNav.getByRole("link", { name: "Projects" }).click();
  await page.waitForURL("**/projects");

  const projectsLink = primaryNav.getByRole("link", { name: "Projects" });
  await expect(async () => {
    const projectsBox = await projectsLink.boundingBox();
    const pillBoxAfter = await pill.boundingBox();
    expect(boxesOverlap(pillBoxAfter, projectsBox)).toBe(true);
  }).toPass({ timeout: 1000 });

  await expect(pill).toHaveCount(1);
});
