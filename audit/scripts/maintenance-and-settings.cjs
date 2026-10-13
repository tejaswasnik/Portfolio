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

  await page.goto(`${BASE}/admin/settings`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "audit/screenshots/settings-before.png", fullPage: true });

  const maintenanceSwitch = page.locator('button[role="switch"][aria-label*="aintenance" i]');
  console.log("maintenance switch count:", await maintenanceSwitch.count());
  if (await maintenanceSwitch.count()) {
    await maintenanceSwitch.click();
    const submit = page.locator('button[type="submit"]').last();
    await submit.click();
    await page.waitForTimeout(1200);
    console.log("maintenance toggled ON, save url:", page.url());
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
