import { expect, test } from "@playwright/test";

test.describe("Landing pública", () => {
  test("renderiza hero, KPIs e chips de stack", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("R$ 24M")).toBeVisible();
    await expect(page.getByText("Next.js 16")).toBeVisible();
    await expect(page.getByText("Tecnologia em produção")).toBeVisible();
  });

  test("responde 200 na raiz", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});

test.describe("Área logada", () => {
  test("renderiza o shell da aplicação", async ({ page }) => {
    await page.goto("/app");

    await expect(page.getByRole("heading", { name: "Área logada" })).toBeVisible();
    await expect(page.getByRole("link", { name: "App" })).toBeVisible();
  });
});

test.describe("Erros", () => {
  test("404 devolve a página not-found", async ({ page }) => {
    const response = await page.goto("/rota-que-nao-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Recurso não encontrado")).toBeVisible();
  });
});
