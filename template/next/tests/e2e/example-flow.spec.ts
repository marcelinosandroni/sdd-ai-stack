import { expect, test } from "@playwright/test";

const member = { "x-demo-user": "member" };
const SIGNED_OUT = "Signed out. Examples are only listed for the signed-in owner.";

test.describe("Example creation flow", () => {
  test("rejects an unauthenticated submit before validating", async ({ page }) => {
    await page.goto("/app");

    await page.getByLabel("Title").fill("Ledger migration");
    await page
      .getByLabel("Content")
      .fill("This content is long enough to pass validation.");
    await page.getByRole("button", { name: "Create example" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "Sign in to create an example." }),
    ).toBeVisible();
    await expect(page.getByText(SIGNED_OUT)).toBeVisible();
  });

  test("shows the field error and does not create anything", async ({ page }) => {
    await page.goto("/app");
    // Signed in, so the request reaches validation instead of stopping at auth.
    await page.setExtraHTTPHeaders(member);

    await page.getByLabel("Title").fill("ab");
    await page
      .getByLabel("Content")
      .fill("This content is long enough to pass validation.");
    await page.getByRole("button", { name: "Create example" }).click();

    await expect(page.getByText("Title needs at least 3 characters")).toBeVisible();
    await expect(page.getByLabel("Title")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Title")).toHaveAttribute(
      "aria-describedby",
      "title-error",
    );
    // A field error must not create a row: the success line never appears.
    await expect(page.getByText("Example created.")).toHaveCount(0);
  });

  test("creates the example and lists it back for the owner", async ({ page }) => {
    await page.goto("/app");
    await page.setExtraHTTPHeaders(member);

    const title = `Ledger ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page
      .getByLabel("Content")
      .fill("This content is long enough to pass validation.");
    await page.getByRole("button", { name: "Create example" }).click();

    await expect(page.getByText("Example created.")).toBeVisible();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("does not let a banned user write", async ({ page }) => {
    await page.goto("/app");
    await page.setExtraHTTPHeaders({ "x-demo-user": "banned" });

    await page.getByLabel("Title").fill("Ledger migration");
    await page
      .getByLabel("Content")
      .fill("This content is long enough to pass validation.");
    await page.getByRole("button", { name: "Create example" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "Access denied." }),
    ).toBeVisible();
  });
});
