import { defineConfig, devices } from "@playwright/test";

/**
 * The E2E gate runs against the PRODUCTION build, never against the dev server.
 *
 * A dev server compiles on demand, so a route that only breaks after bundling — a
 * bad import, a token that only resolves at build time — passes E2E and fails the
 * user. `preview` serves the same bytes `npm run build` produced, so what the test
 * drives is what the user gets.
 *
 * Two settings here exist because of a bug this configuration used to have:
 *
 *   `reuseExistingServer: !process.env.CI` meant that locally the suite attached to
 *   *whatever* already held port 3000. It was another project entirely, and the
 *   suite reported twelve failures against an app it was never testing. CI passed,
 *   because CI passes `false`. A gate that is right in CI and wrong on a laptop is a
 *   gate that gets ignored on a laptop.
 *
 *   A dedicated port does the rest: 3000 is the most likely port on the machine to be
 *   taken, and `strictPort` in `vite.config.ts` turns a collision into an error
 *   instead of a silent bind somewhere else.
 */
const E2E_PORT = 4180;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${E2E_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx vite preview --port ${E2E_PORT} --strictPort`,
    url: `http://127.0.0.1:${E2E_PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
