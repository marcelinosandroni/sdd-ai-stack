import { expect, type Page, test } from "@playwright/test";

/**
 * The Matrix opener, end to end.
 *
 * The whole component is a timed animation, which is exactly the kind of thing that
 * works on the machine that wrote it and fails everywhere else. So the timing is
 * never asserted directly — the test reveals the message and asserts the *state*,
 * which is the part a visitor depends on.
 */

/**
 * Opens the terminal the way a visitor does: by clicking the notification.
 *
 * The launcher is the fallback, and it appears only once the notice is gone. An
 * earlier version kept both on screen at once, and the 44px dismiss control sat
 * squarely on top of the launcher — so while a notice was up, the terminal could not
 * be opened at all. Clicking the notice is also the better design: the notification
 * stops being purely informational and becomes the affordance it looks like.
 */
async function openTerminal(page: Page) {
  await page.getByTestId("matrix-notice").getByRole("button").first().click();
  await expect(page.getByTestId("matrix-terminal")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // The notification waits 1.6s before it appears. Waiting for it explicitly is more
  // honest than a sleep: it fails with a message that says what was missing.
  await expect(page.getByTestId("matrix-notice")).toBeVisible({ timeout: 10_000 });
});

test("the notification announces itself and says the first line", async ({ page }) => {
  await expect(page.getByTestId("matrix-notice")).toContainText("New message");
  await expect(page.getByTestId("matrix-preview")).toContainText("Wake up, Neo...");
});

test("the notification dismisses itself, and stays gone", async ({ page }) => {
  await page.getByRole("button", { name: "dismiss" }).click();
  await expect(page.getByTestId("matrix-notice")).toBeHidden();

  // The launcher takes its place, so there is still a way in.
  await expect(page.getByTestId("matrix-launcher")).toBeVisible();

  // Reloading brings the notice back — dismissal is a decision, not a stored
  // preference. A visitor who closed it once should not be nagged for the session.
  await page.reload();
  await expect(page.getByTestId("matrix-notice")).toBeVisible({ timeout: 10_000 });
});

test("opening the terminal reveals the whole message", async ({ page }) => {
  await openTerminal(page);

  for (const line of [
    "Wake up, Neo...",
    "The Matrix has you...",
    "Follow the white rabbit.",
    "Knock, knock, Neo.",
  ]) {
    await expect(page.getByTestId("matrix-line").filter({ hasText: line })).toBeVisible();
  }
});

test("the terminal takes a message and answers", async ({ page }) => {
  await openTerminal(page);

  await page.getByLabel("neo@matrix:~$").fill("is there a spoon?");
  await page.getByRole("button", { name: "send" }).click();

  await expect(page.getByTestId("matrix-terminal")).toContainText("is there a spoon?");
  await expect(page.getByTestId("matrix-terminal")).toContainText("There is no spoon.");

  // The field clears, so the next message starts clean.
  await expect(page.getByLabel("neo@matrix:~$")).toHaveValue("");
});

test("sending a second message keeps both exchanges", async ({ page }) => {
  await openTerminal(page);

  await page.getByLabel("neo@matrix:~$").fill("first");
  await page.getByRole("button", { name: "send" }).click();
  await page.getByLabel("neo@matrix:~$").fill("second");
  await page.getByRole("button", { name: "send" }).click();

  const terminal = page.getByTestId("matrix-terminal");
  await expect(terminal).toContainText("first");
  await expect(terminal).toContainText("second");
  await expect(terminal.locator(".matrix-terminal__reply")).toHaveCount(2);
});

test("an empty message is not sent", async ({ page }) => {
  await openTerminal(page);

  await page.getByLabel("neo@matrix:~$").fill("   ");
  await page.getByRole("button", { name: "send" }).click();

  // A count, not `not.toContainText`. A negative text assertion passes the instant
  // the element is momentarily clean, so it is a race with a green result — which is
  // how a suite that is "usually green" gets trusted. Counting exchanges is
  // deterministic: either one was added or it was not.
  await expect(
    page.getByTestId("matrix-terminal").locator(".matrix-terminal__exchange"),
  ).toHaveCount(0);

  // And the field keeps what was typed, so nothing silently vanished.
  await expect(page.getByLabel("neo@matrix:~$")).toHaveValue("   ");
});

test("Escape closes the terminal — a panel with no exit is a trap", async ({ page }) => {
  await openTerminal(page);

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("matrix-terminal")).toBeHidden();
  await expect(page.getByTestId("matrix-launcher")).toBeVisible();
});

/**
 * §4b.2 rule 2: nothing tappable below 44×44.
 *
 * Split in two because the two sets of controls never coexist: the notice owns the
 * corner until it is opened or dismissed, and the terminal owns it afterwards. One
 * test asserting all four selectors would report two of them as missing, which reads
 * like a bug in the component and is actually a bug in the test.
 */
async function tapTargetsUnder(page: Page, selectors: string[]) {
  return page.evaluate(
    (list) =>
      list
        .map((selector) => {
          const el = document.querySelector(selector) as HTMLElement | null;
          if (!el) return `${selector} is missing`;
          const r = el.getBoundingClientRect();
          return r.width < 44 || r.height < 44
            ? `${selector} is ${r.width}x${r.height}`
            : "";
        })
        .filter(Boolean),
    selectors,
  );
}

test("the notification's controls are 44px tap targets", async ({ page }) => {
  const small = await tapTargetsUnder(page, [
    ".matrix-notice__open",
    ".matrix-notice__dismiss",
  ]);

  expect(small, small.join(", ")).toEqual([]);
});

test("the terminal's controls are 44px tap targets", async ({ page }) => {
  await openTerminal(page);

  const small = await tapTargetsUnder(page, [
    ".matrix-terminal__close",
    ".matrix-terminal__send",
  ]);

  expect(small, small.join(", ")).toEqual([]);
});

test("the terminal fits a phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId("matrix-notice")).toBeVisible({ timeout: 10_000 });

  await openTerminal(page);

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [...document.querySelectorAll(".matrix-terminal, .matrix-notice")]
      .filter((el) => el.getBoundingClientRect().right > doc.clientWidth + 1)
      .map((el) => el.className);
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
  });

  expect(overflow.offenders).toEqual([]);
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
});
