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

  await page.goto(`${BASE}/admin/projects/new`);
  await page.waitForTimeout(400);
  await page.locator('input[placeholder="Project name"]').fill("Workspace");
  // slug auto-fills to "workspace" which already exists
  await page.locator("textarea").nth(0).fill("Duplicate slug test short description.");
  await page.locator("textarea").nth(1).fill("Duplicate slug test long description.");
  await page.screenshot({ path: "audit/screenshots/dup-slug-before-submit.png" });
  await page.locator('button[type="submit"]').last().click();
  await page.waitForTimeout(1200);
  console.log("URL after submit:", page.url());
  const body = await page.textContent("body");
  console.log("Body contains 'slug' error text:", /slug/i.test(body));
  console.log("Snippet around error:", body.match(/.{0,60}(already|exists|unique|taken|duplicate).{0,60}/i)?.[0] ?? "NO MATCH FOUND");
  await page.screenshot({ path: "audit/screenshots/dup-slug-after-submit.png", fullPage: true });

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
