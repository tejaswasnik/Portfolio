const { chromium } = require("@playwright/test");
const path = require("path");
(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1600 }, colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  // force dark via toggle if not already dark
  const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme") || document.documentElement.className);
  console.log("initial theme attr:", theme);
  const isLight = await page.evaluate(() => !document.documentElement.classList.contains("dark") && document.documentElement.getAttribute("data-theme") !== "dark");
  if (isLight) {
    await page.click('[aria-label*="dark" i], [aria-label*="theme" i]');
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(__dirname, "..", "screenshots", "public_home_1440_dark_forced.png"), fullPage: true });
  await browser.close();
  console.log("DONE");
})();
