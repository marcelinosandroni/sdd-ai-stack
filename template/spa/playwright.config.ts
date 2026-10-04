import { defineConfig, devices } from "@playwright/test";

/**
 * The E2E gate runs against the PRODUCTION build, never against the dev server.
 *
 * A dev server compiles on demand, so a route that only breaks after bundling — a
 * bad import, a token that only resolves at build time — passes E2E and fails the
 * user. `preview` serves the same bytes `npm run build` produced, so what the test
 * drives is what the user gets.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Spread, not `undefined`. `exactOptionalPropertyTypes` rejects an explicit
  // `undefined` on an optional property, so writing `workers: undefined` is a type
  // error here — and a config file is the last place a template should teach a
  // lesson by accident.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
