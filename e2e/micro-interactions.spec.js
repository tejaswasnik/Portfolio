import { test, expect } from "@playwright/test";

/**
 * A2 arrow-nudge (docs/superpowers/plans/2026-10-13-portfolio-micro-animations.md
 * Task 2): the nudge only fires under real hover capability
 * (`@media (hover: hover) and (pointer: fine)`), so a touch tap must
 * never move the arrow. jsdom can't evaluate CSS media features or
 * `:hover`, so this has to be a real browser check (Playwright), not a
 * Vitest one — `.press`'s `:active` scale is deliberately untested here
 * since it's meant to fire on tap too (see motion.css's A1 comment).
 */

function arrowTransform(trigger) {
  return trigger.locator(".arrow").evaluate((el) => getComputedStyle(el).transform);
}

test.describe("arrow-nudge hover (desktop, mouse + fine pointer)", () => {
  test("the arrow nudges forward on hover", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /let's talk/i }).first();
    await trigger.scrollIntoViewIfNeeded();

    const before = await arrowTransform(trigger);
    expect(before).toBe("none");

    await trigger.hover();
    const after = await arrowTransform(trigger);
    expect(after).not.toBe("none");
  });
});

test.describe("touch context (no hover capability)", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("tapping the CTA leaves the arrow untransformed", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /let's talk/i }).first();
    await trigger.scrollIntoViewIfNeeded();

    await trigger.tap();
    const after = await arrowTransform(trigger);
    expect(after).toBe("none");
  });
});
