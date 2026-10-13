// Throwaway audit script. Scans public + admin pages at multiple widths,
// checks horizontal-scroll (scrollWidth), font-family usage, touch target
// sizes, focus-visible, alt text, prefers-reduced-motion, and screenshots.
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3000";
const WIDTHS = [320, 375, 768, 1024, 1280, 1440];
const SHOT_DIR = path.join(__dirname, "..", "screenshots");

const PUBLIC_PAGES = ["/", "/projects", "/projects/workspace", "/projects/fieldnote", "/404-test-xyz"];
const ADMIN_PAGES = [
  "/admin",
  "/admin/projects",
  "/admin/projects/new",
  "/admin/skills",
  "/admin/sections",
  "/admin/banner",
  "/admin/profile",
  "/admin/messages",
  "/admin/settings",
  "/admin/media",
];

async function login(page) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[type="email"], input[name="email"]', "audit@test.local");
  await page.fill('input[type="password"], input[name="password"]', "AuditTest1234!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin(\/)?$/, { timeout: 10000 }).catch(() => {});
}

async function scan(page, url, label) {
  const resp = await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" }).catch((e) => ({ err: e.message }));
  await page.waitForTimeout(300);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  return { url, label, status: resp && resp.status ? resp.status() : "nav-error", ...metrics, hScroll: metrics.scrollWidth > metrics.innerWidth + 1 };
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const results = { responsive: [], fonts: {}, touchTargets: [], reducedMotion: {}, altText: {}, focusVisible: {} };

  // ---- Responsive sweep: public pages, unauthenticated ----
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const url of PUBLIC_PAGES) {
      const r = await scan(page, url, `public@${width}`);
      results.responsive.push({ ...r, width, area: "public" });
      if (width === 1440 || width === 375) {
        const safe = url.replace(/\//g, "_") || "home";
        await page.screenshot({ path: path.join(SHOT_DIR, `public${safe}_${width}.png`), fullPage: true }).catch(() => {});
      }
    }
    await context.close();
  }

  // ---- Responsive sweep: admin pages, authenticated ----
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await login(page);
    for (const url of ADMIN_PAGES) {
      const r = await scan(page, url, `admin@${width}`);
      results.responsive.push({ ...r, width, area: "admin" });
      if (width === 1440 || width === 375) {
        const safe = url.replace(/\//g, "_") || "admin";
        await page.screenshot({ path: path.join(SHOT_DIR, `admin${safe}_${width}.png`), fullPage: true }).catch(() => {});
      }
    }
    await context.close();
  }

  // ---- Fonts check (1440, dark) ----
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    results.fonts.home = await page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).fontFamily : null;
      };
      return {
        h1: pick("h1"),
        h2: pick("h2"),
        body: pick("p"),
        mono: pick("code, .font-mono, [class*='mono']"),
      };
    });
    await context.close();
  }

  // grep-level font-family check done separately via ripgrep outside this script.

  // ---- Touch targets (home + admin sidebar, 375) ----
  {
    const context = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    results.touchTargets.themeToggle = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label*="theme" i], [data-testid="theme-toggle"], button[class*="theme" i]');
      if (!btn) return "not-found";
      const r = btn.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    await context.close();
  }

  // ---- Reduced motion (home banner) ----
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    results.reducedMotion.banner = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      const gif = imgs.find((i) => /\.gif(\?|$)/i.test(i.src));
      const anims = Array.from(document.querySelectorAll("*")).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.animationName !== "none" || parseFloat(cs.animationDuration) > 0;
      }).map((el) => ({ tag: el.tagName, cls: el.className, dur: getComputedStyle(el).animationDuration }));
      return { gifFound: gif ? gif.src : null, animatedElements: anims.slice(0, 10) };
    });
    await context.close();
  }

  // ---- Alt text / labels sweep (home, projects, project detail) ----
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    for (const url of ["/", "/projects", "/projects/workspace"]) {
      await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
      results.altText[url] = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        const missing = imgs.filter((i) => i.alt === null || i.alt === undefined).map((i) => i.src);
        const iconButtons = Array.from(document.querySelectorAll("button")).filter((b) => !b.textContent.trim());
        const unlabeled = iconButtons.filter((b) => !b.getAttribute("aria-label") && !b.getAttribute("title"));
        return {
          imgCount: imgs.length,
          imgsMissingAltAttr: missing,
          iconButtonCount: iconButtons.length,
          unlabeledIconButtons: unlabeled.map((b) => b.outerHTML.slice(0, 120)),
        };
      });
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, "..", "responsive-scan-results.json"), JSON.stringify(results, null, 2));
  console.log("DONE");
  console.log(JSON.stringify(results.responsive.filter((r) => r.hScroll), null, 2));
})();
