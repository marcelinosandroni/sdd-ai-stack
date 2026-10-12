#!/usr/bin/env node
/**
 * Render the LinkedIn carousel.
 *
 *   node scripts/render-carousel.mjs
 *
 * Three slides, 1080×1350. Portrait rather than square, because a document post is
 * paged through on a phone and 4:5 fills more of that screen than 1:1 does.
 *
 * One idea per slide, and the cover carries none of the substance: on a carousel the
 * first page is the only one a scrolling reader commits to, so it has to do one job —
 * stop them — and slides two and three have to be worth the swipe. A cover that explains
 * the project is a cover nobody swipes past.
 *
 * Every number is the one the site publishes, read from `content.ts` where the site
 * keeps it, and `tests/stack-counts.test.mjs` holds those to the router in `stacks/`.
 * A slide is a public claim rendered as pixels: nothing here can be checked by a reader,
 * which is exactly why it has to be checked by a test before it is rendered.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ImageResponse } from "next/og.js";
import React from "react";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(SITE_DIR, "social", "carousel");
const MONO = "monospace";

const WIDTH = 1080;
const HEIGHT = 1350;
const TOTAL = 3;

async function readTokens() {
  const source = await readFile(path.join(SITE_DIR, "src", "content.ts"), "utf8");

  const token = (name) => {
    const match = new RegExp(`${name}:\\s*"(#[0-9A-Fa-f]{6})"`).exec(source);
    if (!match) throw new Error(`OG_TOKENS.${name} is missing from src/content.ts`);
    return match[1];
  };

  const name = /name:\s*"([^"]+)"/.exec(source)?.[1];
  if (!name) throw new Error("SITE.name is missing from src/content.ts");

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

/**
 * The frame every slide sits in.
 *
 * The masthead, the rules, the page indicator and the glow are identical on all three
 * on purpose: on a swipe, continuity is what tells the reader these are three pages of
 * one thing rather than three separate images that happened to be posted together.
 */
function shell(t, { index, body }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "76px 72px",
        backgroundColor: t.surfaceBase,
        backgroundImage: `radial-gradient(circle at 86% 6%, rgba(186, 243, 54, 0.11) 0%, transparent 40%), radial-gradient(#ffffff08 1px, #0000 1px)`,
        backgroundSize: "100% 100%, 32px 32px",
        color: t.textPrimary,
        fontFamily: "sans-serif",
      },
    },

    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 14 } },
        h("div", {
          style: {
            width: 13,
            height: 13,
            borderRadius: 9999,
            backgroundColor: t.primary,
            boxShadow: `0 0 24px ${t.primary}99`,
          },
        }),
        h(
          "div",
          {
            style: {
              fontSize: 25,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: t.primary,
              fontFamily: MONO,
            },
          },
          t.siteName,
        ),
      ),
      // The page indicator. Its job is to say "there is more", which is the single
      // thing that decides whether a reader swipes to slide two.
      h(
        "div",
        {
          style: {
            display: "flex",
            fontSize: 24,
            fontFamily: MONO,
            color: t.textTertiary,
            letterSpacing: "0.12em",
          },
        },
        `${String(index).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`,
      ),
    ),

    body,

    h(
      "div",
      { style: { display: "flex", height: 3, backgroundColor: `${t.borderSubtle}66` } },
      [
        h("div", {
          style: {
            display: "flex",
            width: `${(index / TOTAL) * 100}%`,
            backgroundColor: t.primary,
          },
        }),
      ],
    ),
  );
}

/** A small monospace label above the statement. Used on slides two and three. */
const eyebrow = (t, text) =>
  h(
    "div",
    {
      style: {
        display: "flex",
        fontSize: 24,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: t.primary,
        fontFamily: MONO,
      },
    },
    text,
  );

/**
 * The big statement.
 *
 * One block, with the accent line marked per-line rather than as a trailing argument.
 * Rendering "Tem" and "contexto." as two statements left them with the gap *between*
 * blocks instead of the line-height *inside* one, so the emphasised word floated a few
 * pixels lower than everything above it and read as a mistake rather than as emphasis.
 */
function statement(t, lines) {
  return h(
    "div",
    {
      style: {
        fontSize: 82,
        fontWeight: 800,
        lineHeight: 1.06,
        letterSpacing: "-0.035em",
        display: "flex",
        flexDirection: "column",
      },
    },
    lines.map((line) =>
      h(
        "span",
        typeof line === "string" ? null : { style: { color: t.primary } },
        line.text ?? line,
      ),
    ),
  );
}

const body = (t, text) =>
  h("div", { style: { fontSize: 34, lineHeight: 1.45, color: t.textSecondary } }, text);

/** The number row. Reads as evidence, which is the point: adjectives are not a claim. */
const numbers = (t, items) =>
  h(
    "div",
    { style: { display: "flex", gap: 16 } },
    items.map(({ value, label }) =>
      h(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "26px 22px",
            border: `1px solid ${t.borderSubtle}`,
            borderRadius: 16,
            backgroundColor: "#ffffff05",
          },
        },
        h(
          "div",
          { style: { fontSize: 52, fontWeight: 800, color: t.primary, lineHeight: 1 } },
          value,
        ),
        h(
          "div",
          {
            style: {
              fontSize: 21,
              color: t.textTertiary,
              fontFamily: MONO,
              letterSpacing: "0.03em",
            },
          },
          label,
        ),
      ),
    ),
  );

/**
 * Slide 1 — the cover, and the only one that stops the scroll.
 *
 * It names the failure rather than attacking anybody. "Criar IA com meia dúzia de
 * scripts é fácil" opens on a competitor who does not exist and gets the post buried
 * before it is read; this opens on something every engineer using these tools has felt
 * and cannot dismiss, which is the only reliable way to earn the second line.
 */
const slide1 = (t) =>
  shell(t, {
    index: 1,
    body: h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 44 } },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 30 } },
        statement(t, ["Um agente de IA", "não tem memória.", "Tem", { text: "contexto." }]),
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 26,
            paddingLeft: 26,
            borderLeft: `3px solid ${t.primary}`,
          },
        },
        body(
          t,
          "E o contexto é o que você digita. O prompt inteiro, de novo, a cada turno — relido pela metade até o turno 40.",
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              fontSize: 30,
              lineHeight: 1.4,
              color: t.textPrimary,
              fontWeight: 700,
            },
          },
          "Existe outro jeito.",
        ),
      ),
    ),
  });

/**
 * Slide 2 — the mechanism.
 *
 * The insight is not "I wrote rules". It is that a rule you cannot enforce is a
 * suggestion, and a suggestion is what an agent talks its way past at turn 40. Files
 * and failing gates are the difference, and that is what earns the third slide.
 */
const slide2 = (t) =>
  shell(t, {
    index: 2,
    body: h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 42 } },
      eyebrow(t, "o mecanismo"),
      statement(t, ["Suas regras viram", "arquivos, não prompts."]),
      body(
        t,
        "Arquitetura vertical, setas para dentro, uma razão para mudar por arquivo. E cada critério de aceite tem um teste que falha sem a mudança.",
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 22,
            padding: "30px 32px",
            border: `1px solid ${t.borderSubtle}`,
            borderRadius: 18,
            backgroundColor: "#ffffff05",
          },
        },
        h(
          "div",
          {
            style: {
              fontSize: 27,
              color: t.textTertiary,
              fontFamily: MONO,
              letterSpacing: "0.04em",
            },
          },
          "REGRA QUE NÃO FALHA",
        ),
        h(
          "div",
          { style: { fontSize: 34, color: t.textPrimary, fontWeight: 700, lineHeight: 1.35 } },
          "é sugestão. Sugestão é o que o agente contorna.",
        ),
      ),
    ),
  });

/**
 * Slide 3 — proof, and the ask.
 *
 * Numbers first and the command last, because the numbers are what survive a sceptic and
 * the command is what they do next. A slide that ends on adjectives ends on nothing.
 */
const slide3 = (t) =>
  shell(t, {
    index: 3,
    body: h(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 40 } },
      eyebrow(t, "a prova"),
      h(
        "div",
        {
          style: {
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          },
        },
        h("span", null, "Um comando."),
        h("span", null, "E o padrão de engenharia", " definido."),
      ),
      numbers(t, [
        { value: "1", label: "command" },
        { value: "25", label: "rule files" },
        { value: t.stackCount, label: "stacks" },
        { value: "0", label: "deps" },
      ]),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 18,
            paddingTop: 34,
            borderTop: `1px solid ${t.borderSubtle}`,
          },
        },
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 30,
              fontFamily: MONO,
            },
          },
          h("span", { style: { color: t.primary } }, "$"),
          h("span", null, "npx create-sdd-ai-stack my-app"),
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              fontSize: 24,
              fontFamily: MONO,
              color: t.textTertiary,
              letterSpacing: "0.05em",
            },
          },
          "MIT · open source · github.com/marcelinosandroni/sdd-ai-stack",
        ),
      ),
    ),
  });

const t = await readTokens();
await mkdir(OUT_DIR, { recursive: true });

for (const [index, build] of [slide1, slide2, slide3].entries()) {
  const png = Buffer.from(
    await new ImageResponse(build(t), { width: WIDTH, height: HEIGHT }).arrayBuffer(),
  );

  if (png.readUInt32BE(0) !== 0x89504e47) throw new Error(`slide ${index + 1} is not a PNG`);
  if (png.readUInt32BE(16) !== WIDTH || png.readUInt32BE(20) !== HEIGHT) {
    throw new Error(`slide ${index + 1} rendered at the wrong size`);
  }

  const file = path.join(OUT_DIR, `slide-${index + 1}.png`);
  await writeFile(file, png);
  console.log(
    `✓ site/social/carousel/slide-${index + 1}.png  ${WIDTH}×${HEIGHT}  ${Math.round(png.length / 1024)}kb`,
  );
}
