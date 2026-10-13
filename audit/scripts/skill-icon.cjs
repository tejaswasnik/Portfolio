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
  await page.screenshot({ path: "audit/screenshots/skills-list-before.png", fullPage: true });

  const addBtn = page.getByRole("button", { name: /add skill|new skill|\+ skill/i }).first();
  console.log("add button count:", await addBtn.count());
  await addBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "audit/screenshots/skills-add-form.png", fullPage: true });

  const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="skill" i]').first();
  await nameInput.fill("AuditTestSkillNext");

  const iconPickerTrigger = page.getByRole("button", { name: /icon|choose icon|pick icon/i }).first();
  console.log("icon picker trigger count:", await iconPickerTrigger.count());
  if (await iconPickerTrigger.count()) {
    await iconPickerTrigger.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: "audit/screenshots/skills-icon-picker-open.png", fullPage: true });
    const tabsText = await page.textContent("body");
    console.log("mentions Simple Icons:", /simple icons/i.test(tabsText));
    console.log("mentions Lucide:", /lucide/i.test(tabsText));
    console.log("mentions Remix:", /remix/i.test(tabsText));

    const searchBox = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchBox.count()) {
      await searchBox.fill("nextdotjs");
      await page.waitForTimeout(500);
      await page.screenshot({ path: "audit/screenshots/skills-icon-search-nextjs.png", fullPage: true });
      const result = page.locator('button, [role="option"]').filter({ hasText: /next/i }).first();
      if (await result.count()) {
        await result.click();
        console.log("selected a Next.js icon result");
      }
    }
  }
  await page.screenshot({ path: "audit/screenshots/skills-add-form-filled.png", fullPage: true });
  const submit = page.locator('button[type="submit"]').last();
  await submit.click();
  await page.waitForTimeout(1200);
  const listBody = await page.textContent("body");
  console.log("new skill appears in list:", listBody.includes("AuditTestSkillNext"));
  await page.screenshot({ path: "audit/screenshots/skills-list-after.png", fullPage: true });

  await browser.close();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
