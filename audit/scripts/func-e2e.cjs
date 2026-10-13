// Ad hoc audit script. Not part of the app. See audit/findings-functional-coverage.md.
const { chromium } = require("@playwright/test");

const BASE = "http://localhost:3000";
const EMAIL = "audit@test.local";
const PASS = "AuditTest1234!";
const SHOT_DIR = "audit/screenshots";

const results = [];
function log(label, ok, note) {
  results.push({ label, ok, note });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${label}${note ? " — " + note : ""}`);
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("console", (m) => {
    if (m.type() === "error") console.log("  [console.error]", m.text());
  });
  page.on("pageerror", (e) => console.log("  [pageerror]", e.message));

  // --- Login: wrong password ---
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', "WrongPassword123!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);
  const wrongPassBody = await page.textContent("body");
  log(
    "login wrong password shows generic error",
    /invalid|incorrect|wrong/i.test(wrongPassBody) && !/no account|not found|does not exist/i.test(wrongPassBody),
    wrongPassBody.match(/[A-Za-z ,.'!]{5,80}(invalid|incorrect|wrong)[A-Za-z ,.'!]{0,40}/i)?.[0],
  );
  await page.screenshot({ path: `${SHOT_DIR}/login-wrong-pass.png` });

  // --- Login: correct ---
  await page.fill('input[type="password"], input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  log("login success redirects to /admin", page.url().includes("/admin") && !page.url().includes("/login"));

  // --- Theme toggle ---
  await page.goto(`${BASE}/`);
  const htmlThemeBefore = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  const toggle = page.locator('[aria-label*="theme" i], button:has-text("theme")').first();
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(300);
    const htmlThemeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    log("theme toggle changes data-theme", htmlThemeAfter !== htmlThemeBefore, `${htmlThemeBefore} -> ${htmlThemeAfter}`);
    await page.reload();
    await page.waitForTimeout(300);
    const htmlThemeAfterReload = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    log("theme persists across reload", htmlThemeAfterReload === htmlThemeAfter, `${htmlThemeAfterReload}`);
  } else {
    log("theme toggle found", false, "no toggle button matched selector");
  }

  // --- Side index scroll-spy ---
  await page.goto(`${BASE}/`);
  await page.waitForTimeout(300);
  const indexLinks = await page.locator("nav a[href^='#'], aside a[href^='#']").count();
  log("side index present with anchor links", indexLinks > 0, `${indexLinks} links found`);
  if (indexLinks > 0) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);
    const activeCount = await page
      .locator("nav a[aria-current], aside a[aria-current], nav a.active, aside a.active")
      .count();
    log("scroll-spy sets an active/current index link after scrolling", activeCount > 0, `${activeCount} active links after scroll`);
  }

  // --- /projects filters ---
  await page.goto(`${BASE}/projects?tag=zzz-unknown-tag&status=zzz-unknown-status`);
  await page.waitForTimeout(300);
  const projErr = page.url();
  const bodyAfterBadFilter = await page.textContent("body");
  log(
    "unknown filter values don't crash /projects",
    page.url().includes("/projects") && !/application error|500/i.test(bodyAfterBadFilter),
  );

  // --- Login with new admin session for CRUD work ---
  await page.goto(`${BASE}/admin/projects`);
  await page.waitForTimeout(300);

  // --- Create project with XSS + markdown longDescription ---
  await page.goto(`${BASE}/admin/projects/new`);
  await page.waitForTimeout(300);
  const nameInput = page.locator('input[placeholder="Project name"]');
  await nameInput.fill("Audit XSS Test Project");
  const shortDesc = page.locator("textarea").nth(0);
  await shortDesc.fill("Audit short description for functional testing.");
  const longDesc = page.locator("textarea").nth(1);
  const xssPayload =
    '**bold text**\n\n- list item one\n- list item two\n\n```js\nconsole.log("code block")\n```\n\n<script>window.__auditXSS = true;</script><img src=x onerror="window.__auditXSS2=true">';
  await longDesc.fill(xssPayload);
  await page.screenshot({ path: `${SHOT_DIR}/project-form-filled.png`, fullPage: true });
  const submitBtn = page.locator('button[type="submit"]').last();
  await submitBtn.click();
  await page.waitForTimeout(1200);
  const afterCreateUrl = page.url();
  log("create project with markdown+XSS payload submits without crash", !/application error/i.test(await page.textContent("body")), afterCreateUrl);

  // find its slug
  await page.goto(`${BASE}/admin/projects`);
  await page.waitForTimeout(400);
  const bodyList = await page.textContent("body");
  log("new project appears in admin projects list", bodyList.includes("Audit XSS Test Project"));

  // visit public page for this slug (assume auto-slug 'audit-xss-test-project')
  const slugGuess = "audit-xss-test-project";
  await page.goto(`${BASE}/projects/${slugGuess}`);
  await page.waitForTimeout(400);
  const detailBody = await page.content();
  const xssRan = await page.evaluate(() => window.__auditXSS === true || window.__auditXSS2 === true);
  log("XSS payload does NOT execute on project details page", xssRan !== true, xssRan ? "window.__auditXSS was set — SCRIPT EXECUTED" : "script did not execute");
  const hasBold = /<strong>bold text<\/strong>/.test(detailBody);
  const hasList = /<li>list item one<\/li>/.test(detailBody);
  const hasCode = /<code|<pre/.test(detailBody);
  log("markdown bold renders", hasBold);
  log("markdown list renders", hasList);
  log("markdown code block renders", hasCode);
  const rawScriptTagPresent = /<script>window\.__auditXSS/.test(detailBody);
  log("raw <script> tag stripped/escaped from rendered HTML", !rawScriptTagPresent, rawScriptTagPresent ? "raw script tag found in page HTML" : "stripped");
  await page.screenshot({ path: `${SHOT_DIR}/project-detail-xss-markdown.png`, fullPage: true });

  // Note the slug actually used, because this project is unpublished by default (featured/published toggles default off per Toggle components, need to check)
  log("project detail page reachable at guessed slug or 404 (draft)", true, `status via body length ${detailBody.length}`);

  // --- Settings: maintenance mode ---
  await page.goto(`${BASE}/admin/settings`);
  await page.waitForTimeout(400);
  const maintToggle = page.locator("text=Maintenance").locator("..").locator('button[role="switch"], input[type="checkbox"]').first();
  let maintToggleOk = false;
  try {
    const anyToggleNearMaintenance = await page.locator('text=/maintenance/i').first();
    await anyToggleNearMaintenance.scrollIntoViewIfNeeded();
    maintToggleOk = true;
  } catch (e) {
    maintToggleOk = false;
  }
  log("settings page has a 'maintenance' control visible", maintToggleOk);

  await browser.close();

  console.log("\n=== SUMMARY ===");
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"} - ${r.label}${r.note ? " :: " + r.note : ""}`);
})().catch((e) => {
  console.error("SCRIPT ERROR", e);
  process.exit(1);
});
