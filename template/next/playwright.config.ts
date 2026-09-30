import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the PRODUCTION BUILD by default.
 *
 * `next dev` does not minify, does not run the same render path, and hides
 * bugs that only appear after the build. A green E2E against dev is not proof
 * the build works.
 *
 * Override for a fast inner loop:
 *   E2E_TARGET=dev npm run test:e2e
 */
const target = process.env.E2E_TARGET === "dev" ? "dev" : "build";
const port = Number(process.env.PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: {
    command:
      target === "build"
        ? `npm run build && npx next start -p ${port}`
        : `npm run dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
