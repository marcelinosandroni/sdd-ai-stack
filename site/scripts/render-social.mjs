#!/usr/bin/env node
/**
 * Render the social announcement image.
 *
 *   node scripts/render-social.mjs
 *
 * A square, not the 1200×630 share card. Those are different contexts: the share card is
 * a link *preview*, shown small and cropped, so it carries a name and one line. A post
 * image is shown on its own in the feed, where the reader is deciding whether to stop —
 * so it carries the numbers, which are the part that survives a scroll.
 *
 * Square because the feed gives it the most vertical room of any single-image format,
 * and a 3:1 banner on a phone is a strip.
 *
 * Drawn with the same palette as the share card and read out of `content.ts`, for the
 * same reason: a Node script cannot import a `.ts` module, and restating the hexes would
 * make this a third place to update the brand. `tests/site-seo.test.mjs` ties those
 * values to `themes/matrix/tokens.css`.
 *
 * The facts below are the ones the site already publishes. They are not new claims:
 * they are the same numbers, in a place where there is room to read them. If one of them
 * changes, it changes in `site/src/components/hero.tsx` and here, and `check:facts` is
 * the thing that would notice a divergence nobody updated.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og.js";
import React from "react";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(SITE_DIR, "social");
const MONO = "monospace";

/**
 * The four numbers, each one countable.
 *
 * `STACK_COUNT` is read out of `content.ts`, where it is written by `npm run site:sync`
 * from `STACK_DOCS` in `lib/constants.mjs`. The 12 is correct and always was: the
 * `AGENTS.md` tree groups exactly twelve language and framework documents, and
 * `typescript`, `tailwind`, `shadcn`, `testing` and `database` sit outside that group
 * on purpose. What was wrong was that the number was typed into a component, so nobody
 * could check it without doing the classification by hand.
 *
 *   1    the CLI's whole interface
 *   25   `ls stacks/*.md | wc -l`
 *   12   the language and framework docs, counted by `STACK_DOCS`
 *   0    `dependencies` and `devDependencies` in package.json, both empty
 *
 * Every one of them is reproducible, and `tests/stack-counts.test.mjs` fails if a rule
 * file is added without being classified — so this cannot drift into a post that says
 * thirteen stacks because somebody added a document.
 */
const stats = (t) => [
  { value: "1", label: "command" },
  { value: "25", label: "rule files" },
  { value: t.stackCount, label: "stacks" },
  { value: "0", label: "dependencies" },
];

async function readTokens() {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(path.join(SITE_DIR, "src", "content.ts"), "utf8");

  const token = (name) => {
    const match = new RegExp(`${name}:\\s*"(#[0-9A-Fa-f]{6})"`).exec(source);
    if (!match) throw new Error(`OG_TOKENS.${name} is missing from src/content.ts`);
    return match[1];
  };

  const name = /name:\s*"([^"]+)"/.exec(source)?.[1];
  if (!name) throw new Error("SITE.name is missing from src/content.ts");

  // The same committed value the hero renders. Read rather than typed, so an image and
  // a page cannot state different numbers.
  const stacks = /export const STACK_COUNT = (\d+);/.exec(source)?.[1];
  if (!stacks) throw new Error("STACK_COUNT is missing from src/content.ts");

  return {
    siteName: name,
    stackCount: stacks,
    surfaceBase: token("surfaceBase"),
    textPrimary: token("textPrimary"),
    textSecondary: token("textSecondary"),
    textTertiary: token("textTertiary"),
    borderSubtle: token("borderSubtle"),
    primary: token("primary"),
  };
}

const h = React.createElement;

const card = (t) =>
  h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "88px 84px",
        backgroundColor: t.surfaceBase,
        backgroundImage: `radial-gradient(circle at 84% 8%, rgba(186, 243, 54, 0.12) 0%, transparent 44%), radial-gradient(#ffffff08 1px, #0000 1px)`,
        backgroundSize: "100% 100%, 34px 34px",
        color: t.textPrimary,
        fontFamily: "sans-serif",
      },
    },

    // Masthead — the same dot and wordmark the share card opens with.
    h(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 18 } },
      h("div", {
        style: {
          width: 16,
          height: 16,
          borderRadius: 9999,
          backgroundColor: t.primary,
          boxShadow: `0 0 28px ${t.primary}99`,
        },
      }),
      h(
        "div",
        {
          style: {
            fontSize: 30,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: t.primary,
            fontFamily: MONO,
          },
        },
        t.siteName,
      ),
    ),

    // The claim, then the sentence that makes it mean something.
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 34 } },
      h(
        "div",
        {
          style: {
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            display: "flex",
            flexDirection: "column",
          },
        },
        h("span", null, "Spec-Driven"),
        h("span", null, "Development"),
        h("span", { style: { color: t.primary } }, "for AI agents."),
      ),
      h(
        "div",
        { style: { fontSize: 36, lineHeight: 1.35, color: t.textSecondary, maxWidth: 900 } },
        "Your engineering rules become files an agent cannot skip, and gates it cannot talk its way past.",
      ),
    ),

    // The numbers. Four boxes, one border, one accent.
    h(
      "div",
      { style: { display: "flex", gap: 20 } },
      stats(t).map(({ value, label }) =>
        h(
          "div",
          {
            style: {
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "30px 28px",
              border: `1px solid ${t.borderSubtle}`,
              borderRadius: 18,
              backgroundColor: "#ffffff05",
            },
          },
          h(
            "div",
            { style: { fontSize: 64, fontWeight: 800, color: t.primary, lineHeight: 1 } },
            value,
          ),
          h(
            "div",
            {
              style: {
                fontSize: 25,
                color: t.textTertiary,
                fontFamily: MONO,
                letterSpacing: "0.04em",
              },
            },
            label,
          ),
        ),
      ),
    ),

    // The action, and the licence that makes it safe to try.
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${t.borderSubtle}`,
          paddingTop: 34,
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            fontFamily: MONO,
          },
        },
        h("span", { style: { color: t.primary } }, "$"),
        h("span", { style: { color: t.textPrimary } }, "npx create-sdd-ai-stack my-app"),
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 25,
            fontFamily: MONO,
            color: t.textTertiary,
            letterSpacing: "0.04em",
          },
        },
        "MIT · open source",
      ),
    ),
  );

const SIZE = 1200;
const t = await readTokens();
await mkdir(OUT_DIR, { recursive: true });

const png = Buffer.from(
  await new ImageResponse(card(t), { width: SIZE, height: SIZE }).arrayBuffer(),
);

if (png.readUInt32BE(0) !== 0x89504e47) throw new Error("did not render as a PNG");
if (png.readUInt32BE(16) !== SIZE || png.readUInt32BE(20) !== SIZE) {
  throw new Error("rendered at the wrong size");
}

const file = path.join(OUT_DIR, "linkedin-1200.png");
await writeFile(file, png);

const relative = path.relative(SITE_DIR, file);
console.log(`✓ site/${relative}  ${SIZE}×${SIZE}  ${Math.round(png.length / 1024)}kb`);
