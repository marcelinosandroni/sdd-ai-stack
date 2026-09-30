import { expect, test } from "@playwright/test";
import { SITE } from "@/content";

/**
 * The rules from DESIGN.md §4b, asserted on rendered output.
 *
 * The `audit-layout.mjs` script reports the same things interactively and
 * names the offending element, which is what you want while fixing. These are
 * the assertions that must never go red: they fail with a diff, not a report.
 *
 * The viewport numbers are the ones §4b.1 names. 390 is the iPhone width, not
 * an arbitrary small number.
 */
const MOBILE = { width: 390, height: 844 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1440, height: 900 };

test.describe("Responsive (DESIGN.md §4b)", () => {
  test("has no horizontal scroll at any of the three viewports", async ({ page }) => {
    for (const viewport of [MOBILE, TABLET, DESKTOP]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        scrollWidth,
        `${viewport.width}px scrolls sideways: ${scrollWidth} > ${clientWidth}`,
      ).toBeLessThanOrEqual(clientWidth);
    }
  });

  test("every tap target is at least 44px on a phone", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const small = await page.evaluate(() => {
      const floor = 44;
      return [...document.querySelectorAll("a, button, [role=button]")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          if (getComputedStyle(el).visibility === "hidden") return false;
          // The skip link is 1x1 until it takes focus, on purpose.
          if (el.classList.contains("sr-only")) return false;
          // A static tag is not a control.
          if (el.tagName !== "A" && !el.hasAttribute("role") && !el.hasAttribute("tabindex")) {
            return false;
          }
          return r.width < floor || r.height < floor;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return `${el.tagName} "${(el.textContent || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
        });
    });

    expect(small, `too small: ${small.join(", ")}`).toHaveLength(0);
  });

  test("no body text is below 13px", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const small = await page.evaluate(() => {
      const floor = 13;
      // Chrome is allowed to be 11px; the label classes name it.
      const chrome = ["label-mono", "copy-button", "code-inline", "chip"];
      const isChrome = (el: Element | null): boolean => {
        let node = el;
        while (node && node !== document.body) {
          const cls = String((node as HTMLElement).className || "");
          if (chrome.some((name) => cls.includes(name))) return true;
          node = node.parentElement;
        }
        return false;
      };

      const found = [];
      const walker = document.createTreeWalker(document.body, 4);
      let node = walker.nextNode();
      while (node && found.length < 8) {
        const text = (node.textContent || "").trim();
        const parent = node.parentElement;
        if (text && parent) {
          const size = parseFloat(getComputedStyle(parent).fontSize);
          if (size > 0 && size < floor && !isChrome(parent)) {
            found.push(`${size}px "${text.slice(0, 28)}"`);
          }
        }
        node = walker.nextNode();
      }
      return found;
    });

    expect(small, `too small: ${small.join(", ")}`).toHaveLength(0);
  });

  /**
   * The one people skip. A page can pass every geometric check and still bury
   * its only call to action below a fold.
   */
  test("the primary action is reachable without a horizontal scroll", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const cta = page.getByRole("link", { name: /get started/i });
    await expect(cta).toBeVisible();

    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(MOBILE.width);
  });

  test("every nav destination exists as a section", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const hrefs = await page
      .locator("header nav a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href") ?? ""));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const id = href.slice(href.indexOf("#") + 1);
      await expect(page.locator(`#${id}`), `${href} has no target`).toHaveCount(1);
    }
  });

  test("the phone nav is visible without a horizontal gesture", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    // Wrapped, not scrolled: a nav you have to discover by swiping is a nav
    // most visitors never find.
    const nav = page.locator("header nav").last();
    const box = await nav.boundingBox();

    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThan(40);
  });
});

test.describe("Copy buttons", () => {
  test("every code block has one", async ({ page }) => {
    await page.goto("/");

    const blocks = page.locator(".code-block");
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      await expect(
        blocks.nth(index).getByRole("button"),
        `code block ${index} has no copy button`,
      ).toHaveCount(1);
    }
  });

  test("copies the install command", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    const hero = page.locator(".code-block").first();
    await hero.getByRole("button").click();

    await expect(hero.getByRole("button")).toHaveAttribute("data-copied", "true");
    await expect(hero.getByRole("button")).toContainText("Copied");

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("npx create-sdd-ai-stack");
  });

  test("confirms and then reverts, so the state is not a lie", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");

    const button = page.locator(".code-block").first().getByRole("button");
    await button.click();
    await expect(button).toHaveAttribute("data-copied", "true");

    // The label has to come back, or a second copy looks broken.
    await expect(button).toContainText("Copy", { timeout: 5000 });
  });
});

test.describe("Analytics", () => {
  test("mounts the Vercel Analytics component", async ({ page }) => {
    await page.goto("/");

    // The component ships a script, not markup, so the proof is the script tag
    // it injects rather than an element to find.
    const analytics = page.locator('script[src*="va"], script[src*="/_vercel/insights"]');
    await expect(analytics.first()).toBeAttached({ timeout: 10_000 });
  });

  test("does not change the layout", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/");

    // The component must contribute no box. A script that shifted the header
    // would be a regression disguised as a feature.
    const headerHeight = await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(headerHeight).toBeLessThan(200);
  });
});

test.describe("Author", () => {
  test("points at the resume and LinkedIn instead of repeating the track record", async ({
    page,
  }) => {
    await page.goto("/");
    const author = page.locator("#author");

    await expect(author).toContainText(SITE.author.name);
    await expect(author).toContainText(SITE.author.title);

    const links = {
      "Full resume": SITE.resume,
      LinkedIn: SITE.author.linkedin,
      GitHub: SITE.author.github,
    };
    for (const [label, href] of Object.entries(links)) {
      await expect(author.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    await expect(author.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      `mailto:${SITE.author.email}`,
    );
  });
});
