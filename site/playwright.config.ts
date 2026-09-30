import { defineConfig, devices } from "@playwright/test";

const target = process.env.E2E_TARGET === "dev" ? "dev" : "build";
const port = Number(process.env.PORT ?? 4321);
const baseURL = `http://localhost:${port}`;

/**
 * `output: "export"` produces a static `out/` and disables `next start`, so the
 * production E2E serves the export the same way Vercel does. Running the E2E
 * against a dev server would miss exactly the build-only failures this is here
 * to catch.
 */
const server = target === "build" ? `npx --yes serve@latest out -l ${port}` : `npm run dev -- -p ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: target === "build" ? `npm run build && ${server}` : server,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
