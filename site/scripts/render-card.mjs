#!/usr/bin/env node
/**
 * Render the share card and the two icons into `public/`.
 *
 *   node scripts/render-card.mjs
 *
 * They are committed files rather than `ImageResponse` routes, and the reason was
 * measured, not assumed: under `output: "export"` a route emits an extensionless file,
 * and the static host serving it returns **no Content-Type at all**. A crawler is
 * entitled to refuse an image with no declared type, and the symptom is exactly the
 * blank card this was built to prevent. A `.png` extension is typed correctly by every
 * host, including the one that serves this site.
 *
 * The price of a committed file is that it can go stale, so this script is the answer:
 * the card is a pure function of `content.ts`, it carries **no version**, and a guard
 * asserts both. Anything that changes — a colour, a name, a line of copy — is edited in
 * `content.ts` and re-rendered with one command. The version stays on the page, where
 * `npm run version:sync` and `tests/site-version.test.mjs` keep it honest.
 *
 * `next/og` renders fine outside Next, which is what makes this reproducible at all.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og.js";
import React from "react";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(SITE_DIR, "public");

/**
 * The palette, read out of `content.ts` rather than restated.
 *
 * A Node script cannot import a `.ts` module, and restating the hexes here would make
 * this a seventh place to update the brand. Parsed instead — the same approach
 * `scripts/sync-version.mjs` uses, and `tests/site-seo.test.mjs` ties every value to
 * `themes/matrix/tokens.css`, so a colour change fails a test instead of drifting a
 * card nobody can edit after it is posted.
 */
async function readTokens() {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile(path.join(SITE_DIR, "src", "content.ts"), "utf8"),
  );

  const token = (name) => {
    const match = new RegExp(`${name}:\\s*"(#[0-9A-Fa-f]{6})"`).exec(source);
    if (!match) throw new Error(`OG_TOKENS.${name} is missing from src/content.ts`);
    return match[1];
  };

  const name = /name:\s*"([^"]+)"/.exec(source)?.[1];
  if (!name) throw new Error("SITE.name is missing from src/content.ts");

  return {
    siteName: name,
    surfaceBase: token("surfaceBase"),
    textPrimary: token("textPrimary"),
    textSecondary: token("textSecondary"),
    textTertiary: token("textTertiary"),
    borderSubtle: token("borderSubtle"),
    primary: token("primary"),
  };
}

/** `React.createElement` with children in the arguments, so the card stays readable. */
const h = React.createElement;

const MONO = "monospace";

async function render(element, width, height) {
  const response = new ImageResponse(element, { width, height });
  return Buffer.from(await response.arrayBuffer());
}

/**
 * The share card.
 *
 * 1200×630 is what LinkedIn, WhatsApp, X and Slack all crop for, and declaring it in
 * the file is what stops the crop landing on the wrong part of the card.
 */
function shareCard(t) {
  const glow = "rgba(186, 243, 54, 0.10)";

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: t.surfaceBase,
        backgroundImage: `radial-gradient(circle at 88% 12%, ${glow} 0%, transparent 42%), radial-gradient(#ffffff08 1px, #0000 1px)`,
        backgroundSize: "100% 100%, 32px 32px",
        color: t.textPrimary,
        fontFamily: "sans-serif",
      },
    },
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 16 } },
      h("div", {
        style: {
          width: 14,
          height: 14,
          borderRadius: 9999,
          backgroundColor: t.primary,
          boxShadow: `0 0 24px ${t.primary}88`,
        },
      }),
      h(
        "div",
        {
          style: {
            fontSize: 26,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: t.primary,
            fontFamily: MONO,
          },
        },
        t.siteName,
      ),
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 24 } },
      h(
        "div",
        {
          style: {
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          },
        },
        h("span", null, "Spec-Driven Development"),
        h("span", { style: { color: t.primary } }, "for AI agents."),
      ),
      h(
        "div",
        { style: { fontSize: 30, color: t.textSecondary, maxWidth: 900 } },
        "One command. The rules, the theme and two templates — with gates that fail.",
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${t.borderSubtle}`,
          paddingTop: 28,
        },
      },
      h(
        "div",
        { style: { display: "flex", fontSize: 24, fontFamily: MONO, color: t.textSecondary } },
        h("span", null, "npx create-sdd-ai-stack my-app"),
      ),
      h(
        "div",
        { style: { display: "flex", fontSize: 22, fontFamily: MONO, color: t.textTertiary } },
        h("span", null, "MIT · open source"),
      ),
    ),
  );
}

/**
 * The mark: a terminal prompt in the accent colour on the canvas.
 *
 * One glyph, not a wordmark — a favicon that has to be legible at 16px cannot carry a
 * name. The rounded square is for the favicon only; iOS rounds its own corners and would
 * round them twice.
 */
function icon(t, size) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: t.surfaceBase,
        color: t.primary,
        fontSize: Math.round(size * 0.47),
        fontFamily: MONO,
        fontWeight: 700,
        lineHeight: 1,
      },
    },
    h("span", null, ">_"),
  );
}

const t = await readTokens();
await mkdir(PUBLIC, { recursive: true });

const outputs = [
  ["opengraph-image.png", shareCard(t), 1200, 630],
  ["icon.png", icon(t, 512), 512, 512],
  ["apple-icon.png", icon(t, 180), 180, 180],
];

for (const [name, element, width, height] of outputs) {
  const png = await render(element, width, height);
  if (png.readUInt32BE(0) !== 0x89504e47) throw new Error(`${name} did not render as a PNG`);
  if (png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) {
    throw new Error(`${name} rendered at the wrong size`);
  }
  await writeFile(path.join(PUBLIC, name), png);
  console.log(`✓ public/${name.padEnd(20)} ${width}×${height}  ${png.length}b`);
}
