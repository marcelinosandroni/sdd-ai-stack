import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_THEME,
  TEMPLATES,
  TEMPLATE_THEME_ASSET_DESTINATION,
  TEMPLATE_THEME_DESTINATIONS,
  THEME_ASSETS,
  THEME_DIR,
} from "../lib/constants.mjs";
import { scaffold } from "../lib/scaffold.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL = path.join(REPO_ROOT, THEME_DIR, DEFAULT_THEME, "tokens.css");

/**
 * The theme had to become a file rather than stay a block inside
 * `template/next/src/app/globals.css`, because "the design system can be reused by
 * another stack" was a claim with no artifact behind it. Now it is an artifact — and
 * an artifact that exists in two places is a rot risk, so this file asserts the two
 * are byte-identical.
 *
 * The copy inside each template is not a stylistic preference. Turbopack refuses an
 * `@import` that leaves the project root:
 *
 *   FileSystemPath("").join("../../themes/matrix/tokens.css") leaves the filesystem root
 *
 * So the tokens must physically live inside the app, and the only way to keep one
 * source of truth is to copy them and watch the copies.
 */

function readCanonical() {
  return fs.readFileSync(CANONICAL, "utf8");
}

test("the canonical theme exists and is not empty", () => {
  assert.ok(
    fs.existsSync(CANONICAL),
    `${CANONICAL} does not exist. The theme is the one thing in this package that ` +
      `belongs to its author rather than to a stack; if it lives only inside a ` +
      `template, a second template cannot use it and DESIGN.md is prose.`,
  );

  const css = readCanonical();
  assert.match(css, /@theme\s*\{/, "the token file must declare an @theme block");
  assert.match(
    css,
    /--color-[a-z-]+:\s*#[0-9a-fA-F]{6}/,
    "the token file declares no colour, so `check-rules` RULE 7 has nothing to compare",
  );
});

test("every template carries a byte-identical copy of the canonical theme", () => {
  const canonical = readCanonical();

  for (const template of TEMPLATES) {
    for (const rel of TEMPLATE_THEME_DESTINATIONS) {
      const copy = path.join(REPO_ROOT, "template", template, rel);
      assert.ok(fs.existsSync(copy), `template/${template} has no ${rel}`);

      assert.equal(
        fs.readFileSync(copy, "utf8"),
        canonical,
        `template/${template}/${rel} has drifted from ${THEME_DIR}/${DEFAULT_THEME}/tokens.css. ` +
          `Copy the canonical file over it — do not edit the copy.`,
      );
    }
  }
});

test("every template imports its theme copy, so the tokens are actually applied", () => {
  for (const template of TEMPLATES) {
    const css = path.join(REPO_ROOT, "template", template, "src", "app", "globals.css");
    assert.ok(fs.existsSync(css), `template/${template} has no src/app/globals.css`);

    const text = fs.readFileSync(css, "utf8");
    for (const rel of TEMPLATE_THEME_DESTINATIONS) {
      const specifier = `./${rel.replace(/^src\/app\//, "")}`;
      assert.match(
        text,
        new RegExp(`@import\\s+"${specifier.replace(/\./g, "\\.")}"`),
        `template/${template}/src/app/globals.css does not @import "${specifier}". ` +
          `A theme file that nothing imports is a file the design system does not have.`,
      );
    }

    // The tokens must not also live inline, which would make the imported copy a
    // decoration and give two answers to "what is the primary colour".
    assert.doesNotMatch(
      text,
      /@theme\s*\{/,
      `template/${template}/src/app/globals.css still declares @theme inline. ` +
        `The tokens belong in the theme file; leaving them here makes the copy decorative.`,
    );
  }
});

test("a generated app receives the canonical theme, not the template's copy", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-theme-"));
  try {
    scaffold({ target, template: "next", install: false, git: false, log: () => {} });

    for (const rel of TEMPLATE_THEME_DESTINATIONS) {
      assert.equal(
        fs.readFileSync(path.join(target, rel), "utf8"),
        readCanonical(),
        `the generated app's ${rel} is not the canonical theme`,
      );
    }
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});

test("the theme ships in the package, or it cannot be reused", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const files = pkg.files ?? [];

  assert.ok(
    files.some((glob) => glob === THEME_DIR || glob.startsWith(`${THEME_DIR}/`)),
    `package.json "files" does not include ${THEME_DIR}/. The theme would exist in the ` +
      `repository and not in the published package, which is the same claim as before, ` +
      `just with better formatting.`,
  );
});

/**
 * The theme's component copies, guarded the same way its tokens are.
 *
 * `tokens.css` needed a byte-identical guard because the bundler refuses an `@import`
 * that leaves the project root. The Matrix opener needs the same thing for the same
 * reason — templates are standalone apps and cannot import from the package — and it
 * needs it more urgently, because a drifted *component* does not fail a build. A copy
 * two versions behind still compiles, still lints, still passes every test, and every
 * app quietly gets a different opener than the design system documents.
 */
const ASSET_SOURCE = path.join(REPO_ROOT, THEME_DIR, "matrix", "terminal");

test("every template carries a byte-identical copy of the Matrix opener", () => {
  for (const template of TEMPLATES) {
    for (const file of THEME_ASSETS) {
      const canonical = path.join(ASSET_SOURCE, file);
      const copy = path.join(REPO_ROOT, "template", template, TEMPLATE_THEME_ASSET_DESTINATION, file);

      assert.ok(fs.existsSync(canonical), `${THEME_DIR}/matrix/terminal/${file} does not exist`);
      assert.ok(
        fs.existsSync(copy),
        `template/${template} has no ${TEMPLATE_THEME_ASSET_DESTINATION}/${file}. ` +
          `Copy the canonical file over it — do not edit the copy.`,
      );

      assert.equal(
        fs.readFileSync(copy, "utf8"),
        fs.readFileSync(canonical, "utf8"),
        `template/${template}/${TEMPLATE_THEME_ASSET_DESTINATION}/${file} has drifted from ` +
          `the canonical file. A component copy that drifts does not fail the build — it ` +
          `just means every app gets a different design system.`,
      );
    }
  }
});

test("the Matrix opener ships in the package", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  assert.ok(
    (pkg.files ?? []).some((glob) => glob === THEME_DIR),
    `package.json "files" must include ${THEME_DIR}/ for the opener to reach a consumer.`,
  );

  // Every declared asset must exist, or the constant is a promise about nothing.
  const missing = THEME_ASSETS.filter((file) => !fs.existsSync(path.join(ASSET_SOURCE, file)));
  assert.deepEqual(missing, [], `THEME_ASSETS names files that do not exist: ${missing.join(", ")}`);
});

test("a generated app receives the canonical opener, not the template's copy", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-opener-"));
  try {
    scaffold({ target, template: "spa", install: false, git: false, log: () => {} });

    for (const file of THEME_ASSETS) {
      assert.equal(
        fs.readFileSync(path.join(target, TEMPLATE_THEME_ASSET_DESTINATION, file), "utf8"),
        fs.readFileSync(path.join(ASSET_SOURCE, file), "utf8"),
        `the generated app's ${file} is not the canonical opener`,
      );
    }
  } finally {
    fs.rmSync(target, { recursive: true, force: true });
  }
});