import { expect, test } from "@playwright/test";

test.describe("Public landing", () => {
  test("renders hero, KPIs and stack chips", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("R$ 24M")).toBeVisible();
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
