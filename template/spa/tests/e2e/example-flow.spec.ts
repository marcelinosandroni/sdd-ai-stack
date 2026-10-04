import { expect, test } from "@playwright/test";

/**
 * E2E against the production build, driven through `vite preview`.
 *
 * `localStorage` is cleared per test so one test's example cannot become the next
 * test's fixture — the failure mode where a suite passes in one order and fails in
 * another, which is the same defect as an order-dependent unit test.
 */
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("the app boots and shows the shell", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Examples" })).toBeVisible();
});

test("an empty state is shown, not an empty box", async ({ page }) => {
  await expect(page.getByText("Nothing here yet")).toBeVisible();
});

test("a created example appears in the list", async ({ page }) => {
  await page.getByLabel("Title").fill("First vertical slice");
  await page.getByRole("button", { name: "Create example" }).click();

  await expect(page.getByRole("heading", { name: "First vertical slice" })).toBeVisible();
  await expect(page.getByText("Nothing here yet")).toBeHidden();
});

test("a too-short title is refused by the domain, and the message is announced", async ({
  page,
}) => {
  await page.getByLabel("Title").fill("ab");
  await page.getByRole("button", { name: "Create example" }).click();

  const alert = page.getByRole("alert");
  await expect(alert).toHaveText("Give it at least 3 characters");
});

test("the form clears after a successful save", async ({ page }) => {
  await page.getByLabel("Title").fill("Something");
  await page.getByLabel("Notes").fill("With a note");
  await page.getByRole("button", { name: "Create example" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("");
  await expect(page.getByLabel("Notes")).toHaveValue("");
});
