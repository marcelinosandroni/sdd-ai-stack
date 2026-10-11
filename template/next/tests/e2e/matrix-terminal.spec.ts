import { expect, test } from "@playwright/test";

/**
 * The Matrix opener in Portuguese.
 *
 * This template's `<html lang>` is `pt-BR`, so the component here speaks the other
 * language from the one the spa template's suite asserts. That is the point: the
 * opener follows the document's own declaration, and this suite is the proof that the
 * pt-BR branch is reachable and not merely present in a strings file.
 */
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("matrix-notice")).toBeVisible({ timeout: 10_000 });
});

test("the notification is announced in Portuguese", async ({ page }) => {
  await expect(page.getByTestId("matrix-notice")).toContainText("Nova mensagem");
});

test("the terminal speaks the film in Portuguese", async ({ page }) => {
  await page.getByTestId("matrix-notice").getByRole("button").first().click();
  await expect(page.getByTestId("matrix-terminal")).toBeVisible();

  for (const line of [
    "Acorda, Neo...",
    "A Matrix tem você...",
    "Siga o coelho branco.",
    "Toc, toc, Neo.",
  ]) {
    await expect(page.getByTestId("matrix-line").filter({ hasText: line })).toBeVisible();
  }
});

test("the terminal answers in Portuguese", async ({ page }) => {
  await page.getByTestId("matrix-notice").getByRole("button").first().click();

  await page.getByLabel("neo@matrix:~$").fill("existe uma colher?");
  await page.getByRole("button", { name: "enviar" }).click();

  await expect(page.getByTestId("matrix-terminal")).toContainText("Não existe colher.");
});

test("no English leaks into the Portuguese surface", async ({ page }) => {
  await page.getByTestId("matrix-notice").getByRole("button").first().click();
  await page.getByLabel("neo@matrix:~$").fill("olá");

  const terminal = page.getByTestId("matrix-terminal");
  for (const english of [
    "New message",
    "Open terminal",
    "send",
    "close terminal",
    "dismiss",
  ]) {
    await expect(terminal).not.toContainText(english);
  }
});
