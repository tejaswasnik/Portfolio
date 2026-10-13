const { chromium } = require("@playwright/test");
const BASE = "http://localhost:3000";
const EMAIL = "audit@test.local";
const PASS = "AuditTest1234!";

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !location.pathname.includes("/login"), { timeout: 15000 });

  await page.goto(`${BASE}/admin/skills`);
  await page.waitForTimeout(500);

  await page.locator('input[placeholder="e.g. GraphQL"]').fill("AuditNextJSIcon");
  await page.locator('text=Choose an icon').first().click();
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: "visible" });
  const dialogSearch = dialog.locator('input[type="search"]');
  await dialogSearch.fill("nextdotjs");
  await page.waitForTimeout(700);
  const simpleIconsCount = await dialog.locator('.grid button[title]').count();
  console.log("Simple Icons 'nextdotjs' results:", simpleIconsCount);
  await page.screenshot({ path: "audit/screenshots/skills-simpleicons-nextdotjs.png" });
  if (simpleIconsCount > 0) {
    await dialog.locator('.grid button[title]').first().click();
  }
  await page.waitForTimeout(300);
  const iconFieldText = await page.locator('button:has-text("nextdotjs"), button >> text=/next/i').first().textContent().catch(() => "N/A");
  console.log("icon field after pick:", iconFieldText);
  await page.screenshot({ path: "audit/screenshots/skills-icon-picked-nextjs.png" });

  // Second skill using Lucide
  await page.locator('input[placeholder="e.g. GraphQL"]').fill("AuditLucideHouse");
  await page.locator('text=Choose an icon').first().click();
  await dialog.waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Lucide", exact: true }).click();
  const dialogSearch2 = dialog.locator('input[type="search"]');
  await dialogSearch2.fill("house");
  await page.waitForTimeout(700);
  const lucideCount = await dialog.locator('.grid button[title]').count();
  console.log("Lucide 'house' results:", lucideCount);
  await page.screenshot({ path: "audit/screenshots/skills-lucide-house.png" });
  if (lucideCount > 0) {
    await dialog.locator('.grid button[title]').first().click();
  }
  await page.waitForTimeout(300);

  // Third skill using Remix Icon
  await page.locator('input[placeholder="e.g. GraphQL"]').fill("AuditRemixStar");
  await page.locator('text=Choose an icon').first().click();
  await dialog.waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Remix Icon", exact: true }).click();
  const dialogSearch3 = dialog.locator('input[type="search"]');
  await dialogSearch3.fill("star");
  await page.waitForTimeout(700);
  const remixCount = await dialog.locator('.grid button[title]').count();
  console.log("Remix Icon 'star' results:", remixCount);
  await page.screenshot({ path: "audit/screenshots/skills-remixicon-star.png" });
  if (remixCount > 0) {
    await dialog.locator('.grid button[title]').first().click();
  }
  await page.waitForTimeout(300);

  const submit = page.locator('button:has-text("ADD SKILL")').first();
  await submit.click();
  await page.waitForTimeout(1200);
  const afterBody = await page.textContent("body");
  console.log("AuditRemixStar appears in list:", afterBody.includes("AuditRemixStar"));
  await page.screenshot({ path: "audit/screenshots/skills-list-final2.png", fullPage: true });

  await browser.close();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
