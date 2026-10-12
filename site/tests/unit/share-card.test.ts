import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { OG_TOKENS, SITE } from "@/content";

/**
 * The share card, as a committed asset.
 *
 * `opengraph-image.tsx` used to be an `ImageResponse` route. It was replaced with three
 * PNGs in `public/` because `output: "export"` emits extensionless files and a static host
 * serves them with **no Content-Type** — measured, not assumed, and a crawler is entitled
 * to refuse an image with no declared type.
 *
 * A committed file is a card that can go stale on somebody's timeline, where it cannot be
 * edited and does not look like an oversight. So the staleness is closed rather than
 * noted: the card is regenerated here, in the same run, and compared byte for byte. If
 * anything about it drifts, this fails instead of the post.
 *
 * This test lives in the site suite and not in the repository's root suite because it
 * needs `next/og`, which is a dependency of `site/` alone.
 */

const SITE_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC = path.join(SITE_DIR, "public");
const RENDER = path.join(SITE_DIR, "scripts", "render-card.mjs");

const ASSETS = [
  { file: "opengraph-image.png", width: 1200, height: 630 },
  { file: "icon.png", width: 512, height: 512 },
  { file: "apple-icon.png", width: 180, height: 180 },
];

/** A PNG's IHDR width and height live at bytes 16 and 20. */
function pngSize(buffer: Buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const sha256 = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex");

describe("the share card", () => {
  it("exists, at the size every platform crops for", () => {
    for (const { file, width, height } of ASSETS) {
      const full = path.join(PUBLIC, file);
      expect(existsSync(full), `public/${file} is missing`).toBe(true);

      const png = readFileSync(full);
      expect(png.readUInt32BE(0), `${file} is not a PNG`).toBe(0x89504e47);
      expect(pngSize(png), `${file} is the wrong size`).toEqual({ width, height });
      // A blank card is technically a valid PNG, so a file that renders to nothing is
      // not caught by any of the checks above.
      expect(statSync(full).size, `${file} is suspiciously small`).toBeGreaterThan(1024);
    }
  });

  it("is byte-identical to what the renderer produces right now", () => {
    const before = ASSETS.map(({ file }) => sha256(path.join(PUBLIC, file)));

    execFileSync(process.execPath, [RENDER], { cwd: SITE_DIR, stdio: "pipe" });

    const after = ASSETS.map(({ file }) => sha256(path.join(PUBLIC, file)));

    expect(after, "run `npm run assets:card` and commit the result").toEqual(before);
  });

  it("carries no version, because it cannot be regenerated per build", () => {
    // This is the one thing the renderer cannot be trusted to keep out on its own. The
    // failure it prevents already happened once: the hero said v0.2.0 while npm was at
    // 0.6.0. A card with a version is the same mistake with no error message.
    const renderer = readFileSync(RENDER, "utf8");

    expect(renderer, "the card renderer references the version").not.toMatch(/\bVERSION\b/);
    expect(renderer, "the card renderer imports the version").not.toMatch(/import.*VERSION/);
  });

  it("is drawn in the theme's colours", () => {
    const renderer = readFileSync(RENDER, "utf8");

    // The card cannot read `themes/matrix/tokens.css` — Vercel builds this site with
    // `site/` as its root, so that file is not in the build context. So the palette is
    // read out of `content.ts` here, and `tests/site-seo.test.mjs` in the root suite
    // ties every one of those values to the theme. This test proves the renderer
    // actually consumes them, rather than carrying a hex of its own.
    for (const token of Object.values(OG_TOKENS)) {
      expect(renderer, `${token} is asserted against the theme but never used`).not.toContain(
        token,
      );
    }

    for (const field of ["primary", "surfaceBase", "textPrimary", "borderSubtle"]) {
      expect(renderer).toContain(`t.${field}`);
    }

    // The name is read from `content.ts` too, not written into the card — a renamed
    // product should need one edit, not two.
    expect(renderer).toContain("t.siteName");
    expect(renderer).not.toContain(SITE.name);
  });
});
