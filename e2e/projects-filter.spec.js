import { test, expect } from "@playwright/test";

/**
 * Task 8, lightened per plan Decision D4 (docs/superpowers/plans/
 * 2026-10-13-portfolio-micro-animations.md): no client ProjectGrid/
 * AnimatePresence — FilterChips.jsx slides a layoutId pill optimistically
 * on click while /projects stays a server-rendered, plain-<Link> filter.
 */

function boxesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

test("status pill slides to the clicked chip within 100ms", async ({ page }) => {
  await page.goto("/projects");

  const ongoingChip = page.getByRole("link", { name: "Ongoing" });
  await ongoingChip.click();

  // The pill is the motion.span rendered inside whichever chip is
  // currently optimistic-active (FilterChips.jsx) — useOptimistic flips
  // it synchronously on click, well before the server round-trip.
  await expect(async () => {
    const chipBox = await ongoingChip.boundingBox();
    const pillBox = await ongoingChip.locator("span").first().boundingBox();
    expect(boxesOverlap(pillBox, chipBox)).toBe(true);
  }).toPass({ timeout: 100 });
});

test("clicking a filter chip never shows the page-transition overlay", async ({ page }) => {
  await page.goto("/projects");

  const overlaySweep = page.locator("div.pointer-events-none.fixed.inset-0 > div").first();
  await expect(overlaySweep).toHaveCSS("opacity", "0");

  await page.getByRole("link", { name: "Ongoing" }).click();
  await page.waitForURL("**/projects?status=ongoing");

  // Give any transition that might have fired a moment to actually start,
  // then confirm the overlay never left its resting opacity:0 state.
  await page.waitForTimeout(100);
  await expect(overlaySweep).toHaveCSS("opacity", "0");
});

test("a filtered URL is a shareable deep link", async ({ page }) => {
  await page.goto("/projects?status=ongoing");

  const ongoingChip = page.getByRole("link", { name: "Ongoing" });
  await expect(ongoingChip).toHaveAttribute("aria-current", "true");

  // Every rendered card's status badge should read "Ongoing" only — the
  // filter applied server-side before the page even reached the browser.
  const cards = page.locator(".project-grid-fade article");
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(cards.nth(i).getByText("Ongoing")).toBeVisible();
  }
});

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("filters still work as plain navigation links", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "Ongoing" }).click();
    await page.waitForURL("**/projects?status=ongoing");
    await expect(page.getByRole("link", { name: "Ongoing" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
