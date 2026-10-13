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

  await page.locator('input[placeholder="e.g. GraphQL"]').fill("AuditTestSkillNext");
  const chooseIcon = page.locator('text=Choose an icon').first();
  await chooseIcon.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "audit/screenshots/skills-icon-picker-open2.png", fullPage: true });
  const dialogText = await page.textContent("body");
  console.log("mentions Simple Icons:", /simple icons/i.test(dialogText));
  console.log("mentions Lucide:", /lucide/i.test(dialogText));
  console.log("mentions Remix:", /remix/i.test(dialogText));

  const searchBox = page.locator('input[type="search"]').first();
  await searchBox.fill("nextdotjs");
  await page.waitForTimeout(700);
  await page.screenshot({ path: "audit/screenshots/skills-icon-search-nextjs2.png", fullPage: true });
  const firstResult = page.locator('button[title]').filter({ hasText: "" }).first();
  // grid buttons have title=slug; click the one that looks like it matches
  const gridButtons = page.locator('div.grid button[title]');
  const count = await gridButtons.count();
  console.log("result count for 'nextdotjs':", count);
  if (count > 0) {
    const title0 = await gridButtons.nth(0).getAttribute("title");
    console.log("first result title/slug:", title0);
    await gridButtons.nth(0).click();
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: "audit/screenshots/skills-after-icon-pick.png", fullPage: true });

  // now switch to lucide tab and search, then remix, to confirm all 3 libraries work (without picking, just verify results)
  await page.locator('input[placeholder="e.g. GraphQL"]').fill("AuditTestSkillLucide");
  await page.locator('text=Choose an icon').first().click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Lucide", exact: true }).click();
  await page.locator('input[type="search"]').first().fill("house");
  await page.waitForTimeout(700);
  const lucideCount = await page.locator('div.grid button[title]').count();
  console.log("lucide 'house' result count:", lucideCount);
  await page.screenshot({ path: "audit/screenshots/skills-lucide-search.png", fullPage: true });
  if (lucideCount > 0) await page.locator('div.grid button[title]').first().click();
  await page.waitForTimeout(300);

  const submit = page.locator('button:has-text("ADD SKILL")').first();
  await submit.click();
  await page.waitForTimeout(1000);
  const afterBody = await page.textContent("body");
  console.log("AuditTestSkillLucide appears in list:", afterBody.includes("AuditTestSkillLucide"));
  await page.screenshot({ path: "audit/screenshots/skills-list-final.png", fullPage: true });

  await browser.close();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
