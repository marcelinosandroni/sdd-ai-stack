import { expect, test } from "@playwright/test";

test.describe("Public landing", () => {
  test("renders hero, stat cards and stack chips", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Asserted by the card's *label*, not its value. A value like "R$ 24M" was here
    // once, and it made this test a second source of truth for the sample content:
    // editing the page copy broke a test that was supposed to be about layout. The
    // layout is what E2E is good at.
    await expect(page.getByText("Usuários ativos")).toBeVisible();
    await expect(page.getByText("99,98%")).toBeVisible();
    await expect(page.getByText("Next.js 16")).toBeVisible();
    await expect(page.getByText("Tecnologia em produção")).toBeVisible();
  });

  test("answers 200 at the root", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});

test.describe("App area", () => {
  test("renders the app shell", async ({ page }) => {
    await page.goto("/app");

    await expect(page.getByRole("heading", { name: "App" })).toBeVisible();
    await expect(page.getByRole("link", { name: "App" })).toBeVisible();
  });
});

test.describe("Errors", () => {
  test("404 returns the not-found page", async ({ page }) => {
    const response = await page.goto("/route-that-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Resource not found")).toBeVisible();
  });
});
