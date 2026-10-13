const { chromium } = require("@playwright/test");
const BASE = "http://localhost:3000";
const EMAIL = "audit@test.local";
const OLD_PASS = "AuditTest1234!";
const NEW_PASS = "AuditTest5678!";

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const ctx1 = await browser.newContext();
  const page1 = await ctx1.newPage();
  await page1.goto(`${BASE}/admin/login`);
  await page1.fill('input[type="email"]', EMAIL);
  await page1.fill('input[type="password"]', OLD_PASS);
  await page1.click('button[type="submit"]');
  await page1.waitForFunction(() => !location.pathname.includes("/login"), { timeout: 15000 });

  // A second "stale" context holding the same cookie (simulate a second tab) - copy cookies
  const cookies = await ctx1.cookies();
  const ctx2 = await browser.newContext();
  await ctx2.addCookies(cookies);
  const page2 = await ctx2.newPage();
  await page2.goto(`${BASE}/admin`);
  console.log("stale-tab-equivalent context /admin before password change:", page2.url(), await page2.title());

  // Change password in ctx1
  await page1.goto(`${BASE}/admin/settings`);
  await page1.waitForTimeout(500);
  const pwFields = page1.locator('input[type="password"]');
  const pwCount = await pwFields.count();
  console.log("password fields found on settings:", pwCount);
  if (pwCount >= 2) {
    await pwFields.nth(0).fill(OLD_PASS);
    await pwFields.nth(1).fill(NEW_PASS);
    if (pwCount >= 3) await pwFields.nth(2).fill(NEW_PASS);
    // Password form is its own <form>; submit via that form's own submit button.
    const pwForm = page1.locator("form").filter({ has: pwFields.first() });
    await pwForm.locator('button[type="submit"]').click();
    await page1.waitForTimeout(1200);
    const body1 = await page1.textContent("body");
    console.log("post-change page mentions success/error:", body1.match(/.{0,50}(success|updated|changed|error|failed).{0,50}/i)?.[0]);
  }

  // Now check stale cookie context: try an admin action
  await page2.goto(`${BASE}/admin`);
  await page2.waitForTimeout(500);
  console.log("stale context /admin after password change, url:", page2.url());

  // Re-login with new password to confirm it works
  const page3 = await (await browser.newContext()).newPage();
  await page3.goto(`${BASE}/admin/login`);
  await page3.fill('input[type="email"]', EMAIL);
  await page3.fill('input[type="password"]', NEW_PASS);
  await page3.click('button[type="submit"]');
  await page3.waitForTimeout(1500);
  console.log("login with NEW password -> url:", page3.url());

  await browser.close();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
