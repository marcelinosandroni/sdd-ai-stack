import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

/**
 * The share card and the discoverability files, as served.
 *
 * The unit guards assert the source says the right thing. These assert the *built
 * site* says it, which is the only version a crawler ever sees — and it is a different
 * assertion, because `metadataBase` is resolved at render time and a relative image URL
 * silently renders as a relative URL that no crawler resolves.
 *
 * The suite serves `out/`, not a dev server. A dev server on the port would make every
 * SEO assertion read `localhost`, a failure that points at the metadata rather than at
 * the real cause — which is why `reuseExistingServer` is `false` in the config.
 */

const ORIGIN = "http://127.0.0.1:4321";

// The PUBLISHED version — the root package, not `site/package.json`. Joining onto the
// file path instead of its directory resolves one level too shallow and quietly reads
// the site's own version, which made this assert the page against the wrong number.
const PUBLISHED_VERSION = JSON.parse(
  readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "package.json"),
    "utf8",
  ),
).version;

/** One fetch of the home page, reused: it is a static export, so it does not change. */
let homeHtml: string;

test.beforeAll(async ({ request }) => {
  homeHtml = await (await request.get(`${ORIGIN}/`)).text();
});

test("the page tells a crawler where the share card is, absolutely", () => {
  const images = [...homeHtml.matchAll(/<meta property="og:image" content="([^"]+)"/g)].map(
    (m) => m[1],
  );

  expect(
    images,
    "no og:image at all — LinkedIn and WhatsApp will render a blank card",
  ).toHaveLength(1);

  // The two ways a share card ends up blank, with no error anywhere: a relative URL the
  // crawler cannot resolve, and an extensionless one it fetches with no Content-Type.
  expect(images[0]).toMatch(/^https:\/\//);
  expect(images[0]).toContain("sdd.marcelinosandroni.com");
  expect(images[0]).toMatch(/\.png$/);
});

test("the card declares its size and has alt text", () => {
  expect(homeHtml).toMatch(/<meta property="og:image:width" content="1200"\/?>/);
  expect(homeHtml).toMatch(/<meta property="og:image:height" content="630"\/?>/);
  expect(homeHtml).toMatch(/<meta property="og:image:alt" content="[^"]{10,}"\/?>/);
});

test("the card is served as a PNG, with a content type", async ({ request }) => {
  const response = await request.get(`${ORIGIN}/opengraph-image.png`);

  expect(response.status()).toBe(200);
  // Under `output: "export"` an extensionless asset is served with NO Content-Type at
  // all, and a crawler may refuse it. The extension is the whole fix.
  expect(response.headers()["content-type"]).toContain("image/png");

  const body = await response.body();
  expect(body.readUInt32BE(0)).toBe(0x89504e47); // PNG signature
  expect(body.readUInt32BE(16)).toBe(1200);
  expect(body.readUInt32BE(20)).toBe(630);
});

test("twitter gets the card, and no build hash", () => {
  const image = /<meta name="twitter:image" content="([^"]+)"/.exec(homeHtml)?.[1];

  expect(image, "no twitter:image").toBeTruthy();
  expect(image).toMatch(/^https:\/\//);
  // Next tags its own generated route with a build hash, which couples a shared link to
  // one exact build. The static `.png` has no hash and cannot go stale.
  expect(image).not.toContain("?");
});

test("the card is indexable at full size, for Google's image results", () => {
  expect(homeHtml).toContain("max-image-preview:large");
  expect(homeHtml).toMatch(/<meta name="googlebot" content="index, follow/);
});

test("structured data reaches the document and is valid JSON", () => {
  const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(homeHtml)?.[1];

  expect(json, "no JSON-LD in the document").toBeTruthy();

  // Parsed, not pattern-matched. A malformed graph fails here rather than in Google's
  // validator, which is a much longer feedback loop.
  const parsed = JSON.parse(json as string);
  expect(parsed["@context"]).toBe("https://schema.org");

  const nodes = parsed["@graph"] as { "@type": string; sameAs?: string[] }[];
  const types = nodes.map((n) => n["@type"]);
  expect(types).toContain("Person");
  expect(types).toContain("WebSite");
  expect(types).toContain("SoftwareSourceCode");
  expect(types).not.toContain("SoftwareApplication");

  // LinkedIn is where the link will be shared from; a Person node that does not link
  // it gives the crawler nothing to connect.
  const person = nodes.find((n) => n["@type"] === "Person");
  expect(person?.sameAs?.join(" ")).toContain("linkedin.com");
});

test("the JSON-LD cannot close its own script tag", () => {
  // A `<` that reaches the payload verbatim can close the tag early, and the rest of the
  // graph becomes visible page text.
  const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(homeHtml)?.[1];
  expect(json).not.toContain("</");
});

test("robots.txt allows crawling and names the sitemap", async ({ request }) => {
  const body = await (await request.get(`${ORIGIN}/robots.txt`)).text();

  expect(body).toContain("User-Agent: *");
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://sdd.marcelinosandroni.com/sitemap.xml");
});

test("the sitemap lists the page and no fragments", async ({ request }) => {
  const body = await (await request.get(`${ORIGIN}/sitemap.xml`)).text();

  expect(body).toContain("<loc>https://sdd.marcelinosandroni.com/</loc>");
  // A fragment is the same document as the page without it.
  expect(body).not.toContain("#");
});

test("there are icons, because public/ was empty", async ({ request }) => {
  expect(homeHtml).toMatch(/<link rel="icon"/);
  expect(homeHtml).toMatch(/<link rel="apple-touch-icon"/);

  for (const [route, size] of [
    ["icon.png", 512],
    ["apple-icon.png", 180],
  ] as const) {
    const response = await request.get(`${ORIGIN}/${route}`);
    expect(response.status(), `${route} is not served`).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect((await response.body()).readUInt32BE(16)).toBe(size);
  }
});

test("the manifest is served and describes the site", async ({ request }) => {
  expect(homeHtml).toMatch(/<link rel="manifest"/);

  const body = await (await request.get(`${ORIGIN}/manifest.webmanifest`)).text();
  const manifest = JSON.parse(body);

  expect(manifest.name).toContain("SDD AI Stack");
  expect(manifest.start_url).toBe("/");
  expect(manifest.theme_color).toBe("#0A0D12");
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("the hero states the version that is actually published", async ({ page }) => {
  // Asserted against `package.json`, not against `content.ts`. A test that read the
  // source would agree with the source; the failure this exists for was a page stating
  // `v0.2.0` while npm was at `0.6.0`.
  await page.goto(ORIGIN);

  const hero = await page.locator(".label-mono").first().innerText();

  // Case-insensitive on purpose. `.label-mono` is `text-transform: uppercase`, and
  // `innerText` returns what is rendered, not what is in the DOM — so this reads
  // `V0.6.0`, not `v0.6.0`. A case-sensitive regex fails on a page that is correct,
  // which is the worse of the two ways to be wrong.
  const shown = /v(\d+\.\d+\.\d+)/i.exec(hero)?.[1];

  expect(shown, `no version in the hero: "${hero}"`).toBeTruthy();
  expect(shown).toBe(PUBLISHED_VERSION);
});

test("the hero states the stack count that is actually maintained", async ({ page }) => {
  // "Across 12 stacks" was a typed string in a component. It was correct, and it stayed
  // correct for years, because nothing about it could go stale visibly — it would just
  // quietly stop being true after somebody added a rule file.
  //
  // Read from `lib/constants.mjs`, not from `content.ts`: a test that read the committed
  // value would agree with the committed value, which is the whole failure. This is the
  // assertion that the rendered page and the classification agree.
  const { STACK_DOCS } = (await import(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "..",
      "lib",
      "constants.mjs",
    )
  )) as { STACK_DOCS: string[] };

  await page.goto(ORIGIN);

  const shown = /across\s*(\d+)\s*stacks/i.exec(await page.locator("#top").innerText())?.[1];

  expect(shown, "the hero does not state a stack count").toBeTruthy();
  expect(
    Number(shown),
    `the hero says ${shown} stacks and STACK_DOCS lists ${STACK_DOCS.length} (${STACK_DOCS.join(", ")}). ` +
      "Run `npm run site:sync`.",
  ).toBe(STACK_DOCS.length);
});
