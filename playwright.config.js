import { defineConfig, devices } from "@playwright/test";

/**
 * Responsive regression checks only (fixes round 2, Fix 3/4: "no
 * horizontal page scroll at any width"). Separate from `npm test`
 * (Vitest, unit/schema/pure-logic tests with no browser) since these
 * need a real running server — see `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
