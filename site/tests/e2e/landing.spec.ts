import { expect, test } from "@playwright/test";

test.describe("Landing", () => {
  test("renders the hero and the primary call to action", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Spec-Driven Development",
    );
    await expect(page.getByRole("link", { name: "Install in one command" })).toBeVisible();
  });

  test("answers 200 at the root", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("every navigation anchor resolves to a section on the page", async ({ page }) => {
    await page.goto("/");

    const hrefs = await page
      .locator("header nav a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      // href is "/#what" — the id is after the hash, not the whole string.
      const id = href.slice(href.indexOf("#") + 1);
      await expect(page.locator(`#${id}`), `${href} has no target`).toHaveCount(1);
    }
  });

  test("the skip link is the first focusable element and reaches main", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText("Skip to main content");

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the install command is shown verbatim", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("npx create-sdd-ai-stack my-app").first()).toBeVisible();
  });

  test("the author is credited and links to the resume", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Full resume" })).toHaveAttribute(
      "href",
      "https://marcelinosandroni.com",
    );
    await expect(page.getByRole("contentinfo")).toContainText("Marcelino Sandroni Dias");
  });

  test("all three themes of content are present", async ({ page }) => {
    await page.goto("/");

    for (const id of [
      "what",
      "why",
      "practice",
      "ai",
      "install",
      "toolkit",
      "author",
      "contribute",
    ]) {
      await expect(page.locator(`#${id}`), `section #${id} is missing`).toHaveCount(1);
    }
  });

  test("renders 404 for an unknown route", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
