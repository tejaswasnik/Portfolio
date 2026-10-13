const { chromium } = require("@playwright/test");
const BASE = "http://localhost:3000";
const EMAIL = "audit@test.local";
const PASS = "AuditTest1234!";

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !location.pathname.includes("/login"), { timeout: 15000 });
  console.log("logged in, url=", page.url());

  await page.goto(`${BASE}/admin/projects/6acdccbabd49e276f04546c0`);
  await page.waitForTimeout(500);
  const switchBtn = page.locator('button[role="switch"][aria-label="Published"]');
  console.log("published switch count", await switchBtn.count(), "aria-checked before", await switchBtn.getAttribute("aria-checked"));
  await switchBtn.click();
  console.log("aria-checked after click", await switchBtn.getAttribute("aria-checked"));
  const submit = page.locator('button[type="submit"]').last();
  await submit.click();
  await page.waitForTimeout(1500);
  console.log("after save url=", page.url());
  await page.screenshot({ path: "audit/screenshots/project-published-save.png" });

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
