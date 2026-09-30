import { defineConfig, devices } from "@playwright/test";

const target = process.env.E2E_TARGET === "dev" ? "dev" : "build";
const port = Number(process.env.PORT ?? 4321);
const baseURL = `http://localhost:${port}`;

/** The iPhone 14 width, from DESIGN.md §4b.1. */
const MOBILE = { width: 390, height: 844 };

/**
 * `output: "export"` produces a static `out/` and disables `next start`, so the
 * production E2E serves the export the same way Vercel does. Running the E2E
 * against a dev server would miss exactly the build-only failures this is here
 * to catch.
 */
const server =
  target === "build" ? `npx --yes serve@latest out -l ${port}` : `npm run dev -- -p ${port}`;

/**
 * Two projects, not one.
 *
 * The mobile project is the reason this site has a `min-w-0` on half its grid
 * children. Running desktop-only and calling the suite green is how a layout
 * that works at 1440px ships broken on the majority of devices. `iPhone 14` sets
 * the viewport AND `hasTouch`, so the suite exercises tap where a phone would.
 *
 * See DESIGN.md §4b.1.
 */
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
  projects: [
    {
      // Desktop Chrome, viewport pinned to the iPhone width.
      //
      // `devices["iPhone 14"]` would bring WebKit, and WebKit needs a system
      // dependency that is not installed on every runner — a suite that cannot
      // launch is a suite nobody runs. The thing §4b.1 asks for is the WIDTH,
      // so this is the honest cheap version of it. A real iPhone pass belongs in
      // a release checklist, not in the gate.
      name: "mobile",
      use: { ...devices["Desktop Chrome"], viewport: MOBILE, hasTouch: true, isMobile: true },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: target === "build" ? `npm run build && ${server}` : server,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
