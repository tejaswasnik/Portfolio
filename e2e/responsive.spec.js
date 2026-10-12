import { test, expect } from "@playwright/test";

/**
 * design.md §22 "Never allow horizontal page scroll" — fixes round 2,
 * Fix 3. Asserts the real, load-bearing symptom (scrollWidth growing
 * past the viewport), not a visual diff, so it stays cheap to run and
 * catches the actual regression class (an unwrapped flex/grid row, an
 * oversized fixed-width element, etc.).
 */

const WIDTHS = [320, 375, 768];

async function expectNoHorizontalScroll(page) {
  const [scrollWidth, innerWidth] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    window.innerWidth,
  ]);
  expect(scrollWidth, "document.documentElement.scrollWidth should not exceed window.innerWidth").toBeLessThanOrEqual(
    innerWidth,
  );
}

const PUBLIC_PAGES = [
  ["/", "home"],
  ["/projects", "projects list"],
  ["/maintenance", "maintenance"],
  ["/this-page-does-not-exist-404-check", "404"],
];

for (const width of WIDTHS) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 } });

    for (const [path, label] of PUBLIC_PAGES) {
      test(`${label} has no horizontal scroll`, async ({ page }) => {
        await page.goto(path);
        await expectNoHorizontalScroll(page);
      });
    }

    test("a project details page has no horizontal scroll", async ({ page }) => {
      await page.goto("/projects");
      const firstProject = page.locator('a[href^="/projects/"]').first();
      if ((await firstProject.count()) === 0) {
        test.skip(true, "no published projects seeded in this environment");
      }
      await firstProject.click();
      await expectNoHorizontalScroll(page);
    });

    test("the contact modal has no horizontal scroll when open", async ({ page }) => {
      await page.goto("/");
      const trigger = page.getByRole("button", { name: /message me/i }).first();
      if ((await trigger.count()) === 0) {
        test.skip(true, "no 'Message me' trigger rendered (contact section hidden)");
      }
      await trigger.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectNoHorizontalScroll(page);
    });
  });
}
