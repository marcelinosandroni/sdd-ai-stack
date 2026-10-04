import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { TEMPLATES } from "../lib/constants.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Every template's own gates must be runnable **in this repository**, not only in a
 * generated app.
 *
 * The whole template design rests on `npx create-sdd-ai-stack`, so CI lints the
 * generated app — where the files a developer would trip over have already been
 * renamed by the scaffold. That hid a defect for a long time: `npm run lint` inside
 * `template/next` failed outright, and nothing failed, because the only place the
 * command was ever run was somewhere it worked.
 *
 * A gate that cannot run where it is written is not a gate. These tests keep the
 * lint configuration loadable in the template's own checkout.
 */

test("every template's Biome config is valid JSON, with no comment keys", () => {
  // Biome 2 parses `biome.json` as strict JSON. A `"//"` key or a `//` comment —
  // both natural ways to explain a setting in place — are hard errors, and the
  // failure message points at the comment rather than at the idea it documents.
  for (const template of TEMPLATES) {
    const file = path.join(REPO_ROOT, "template", template, "biome.json");
    assert.ok(fs.existsSync(file), `template/${template} has no biome.json`);

    const raw = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(
      raw,
      /^\s*\/\//m,
      `template/${template}/biome.json contains a \`//\` comment. Biome reads this file as ` +
        `strict JSON and will refuse to start. Put the reasoning in a test or a doc, not here.`,
    );

    const parsed = JSON.parse(raw);
    assert.ok(
      !Object.keys(parsed).some((k) => !k.startsWith("$") && k !== "vcs" && k !== "files" &&
        !["formatter", "linter", "javascript", "css", "json", "jsonc", "assist",
          "overrides", "root", "extends"].includes(k)),
      `template/${template}/biome.json has an unrecognised top-level key.`,
    );
  }
});

test("every template turns off Biome's git-ignore-file requirement", () => {
  // The npm packer NEVER includes a file literally named `.gitignore` — it is one
  // of its own default ignores. So each template stores it as `gitignore`, and
  // `restoreGitignore()` renames it in every generated app. The template's own
  // checkout therefore has no `.gitignore`, and Biome with `useIgnoreFile: true`
  // refuses to run at all:
  //
  //   Biome couldn't find an ignore file in the following folder
  //
  // CI never saw this, because CI lints the GENERATED app. The ignore list that
  // actually matters is `files.includes`, and it is complete.
  for (const template of TEMPLATES) {
    const config = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, "template", template, "biome.json"), "utf8"),
    );

    assert.equal(
      config.vcs?.useIgnoreFile,
      false,
      `template/${template}/biome.json sets vcs.useIgnoreFile: true. That makes \`npm run ` +
        `lint\` fail inside the template itself, and only inside this repository, where CI ` +
        `never runs it. Set it to false and rely on files.includes.`,
    );

    // The replacement has to be complete, or turning the flag off would start linting
    // dependencies and build output — which is the failure this change trades a silent
    // one for a loud one.
    const includes = config.files?.includes ?? [];
    for (const required of ["**", "!**/node_modules", "!**/coverage", "!**/SDD"]) {
      assert.ok(
        includes.includes(required),
        `template/${template}/biome.json does not exclude "${required}". With ` +
          `useIgnoreFile off, this list is the only thing keeping the lint quiet.`,
      );
    }

    // Build output, without demanding the entry for a toolchain this template does
    // not use. `.next` is meaningless to Vite and `dist` is meaningless to Next, so
    // requiring both would be asserting a template's identity rather than its safety.
    const buildDirs = ["!**/.next", "!**/dist"];
    assert.ok(
      buildDirs.some((dir) => includes.includes(dir)),
      `template/${template}/biome.json excludes neither .next nor dist. With ` +
        `useIgnoreFile off, build output gets linted.`,
    );
  }
});

test("every template ships the file the packer will rename, not a real .gitignore", () => {
  // The npm packer silently drops a literal `.gitignore`. Storing it as `gitignore`
  // and renaming at scaffold time is the only way a generated app is guaranteed to
  // have one — and shipping both would mean two files that drift.
  for (const template of TEMPLATES) {
    const base = path.join(REPO_ROOT, "template", template);
    assert.ok(
      fs.existsSync(path.join(base, "gitignore")),
      `template/${template}/gitignore is missing, so a generated app gets no .gitignore ` +
        `and ships .env.local to git.`,
    );
    assert.ok(
      !fs.existsSync(path.join(base, ".gitignore")),
      `template/${template}/.gitignore exists and will be dropped by npm pack. Keep it ` +
        `named \`gitignore\`; restoreGitignore() renames it.`,
    );
  }
});
