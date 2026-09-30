import { expect, test } from "@playwright/test";

test.describe("Security headers", () => {
  test("the app sends the hardening headers", async ({ page }) => {
    const response = await page.goto("/app");

    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    expect(response?.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response?.headers()["permissions-policy"]).toContain("camera=()");
  });

  test("a forged x-middleware-subrequest does not bypass the proxy", async ({
    browser,
  }) => {
    // CVE-2025-29927: older Next versions trusted this header and skipped
    // middleware entirely. If the proxy did NOT run, the security headers below
    // would be missing — so their presence is the proof the request still
    // passed through it.
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-middleware-subrequest": "1" },
    });
    const page = await context.newPage();

    const response = await page.goto("/app");

    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");

    await context.close();
  });
});
