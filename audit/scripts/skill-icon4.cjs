const { chromium } = require("@playwright/test");
const BASE = "http://localhost:3000";
const EMAIL = "audit@test.local";
const PASS = "AuditTest1234!";

async function addSkillWithIcon(page, dialog, name, library, libLabel, query) {
  await page.locator('input[placeholder="e.g. GraphQL"]').fill(name);
  await page.locator('text=Choose an icon').first().click();
  await dialog.waitFor({ state: "visible" });
  if (libLabel !== "Simple Icons") {
    await page.getByRole("button", { name: libLabel, exact: true }).click();
  }
  const search = dialog.locator('input[type="search"]');
  await search.fill(query);
  await page.waitForTimeout(700);
  const count = await dialog.locator('.grid button[title]').count();
  console.log(`${libLabel} '${query}' results:`, count);
  if (count > 0) await dialog.locator('.grid button[title]').first().click();
  await page.waitForTimeout(300);
  const submit = page.locator('button:has-text("ADD SKILL")').first();
  await submit.click();
  await page.waitForTimeout(1000);
  const body = await page.textContent("body");
  console.log(`${name} appears in list:`, body.includes(name));
}

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
  const dialog = page.locator('[role="dialog"]');

  await addSkillWithIcon(page, dialog, "AuditNextJSIcon", "simple-icons", "Simple Icons", "nextdotjs");
  await addSkillWithIcon(page, dialog, "AuditLucideHouse", "lucide", "Lucide", "house");
  await addSkillWithIcon(page, dialog, "AuditRemixStar", "remixicon", "Remix Icon", "star");

  await page.screenshot({ path: "audit/screenshots/skills-list-final3.png", fullPage: true });
  await browser.close();
})().catch((e) => {
  console.error("ERROR", e.message);
  process.exit(1);
});
