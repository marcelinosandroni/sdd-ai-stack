import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { TEMPLATES } from "../lib/constants.mjs";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The per-template essentials, by suffix.
 *
 * `release.yml` cannot import from the test suite, so it rebuilds this list from
 * `TEMPLATES` and greps `npm pack` output with `template/$t/<suffix>`. These two
 * representations have to agree, and the test below is what makes them.
 *
 * The suffixes are the files without which a generated app is broken. `gitignore` is
 * the one that matters most: npm pack drops a literal `.gitignore`, so an app that
 * does not get it back ships `.env.local` to git, and nothing about that is visible
 * at pack time.
 */
export const TEMPLATED_SUFFIXES = ["gitignore", "package.json", "src/app/theme.css"];

/** Next-only, because these files only mean something in a Next app. */
export const NEXT_ONLY_FILES = ["template/next/src/proxy.ts", "template/next/components.json"];

/**
 * The files the release workflow asserts are in the tarball.
 *
 * `release.yml` greps `npm pack` output for each of these. That guard shipped
 * with a wrong path — `template/next/proxy.ts` instead of
 * `template/next/src/proxy.ts` — and could never have passed. It was only found
 * because the dry run was executed instead of assumed.
 *
 * So the list lives here, in a test, and the workflow reads it from the same
 * source of truth. A guard that has never gone green is not a guard.
 */
export const ESSENTIAL_FILES = [
  "bin/create-sdd-ai-stack.mjs",
  "lib/scaffold.mjs",
  "AGENTS.md",
  "PREFLIGHT.md",
  "DESIGN.md",
  "APP-STACK.md",
  "stacks/README.md",
  "stacks/clean-code.md",
  "stacks/language.md",
  "themes/matrix/tokens.css",
  "SKILLS/create-feature/SKILL.md",
  "SKILLS/create-task/SKILL.md",
  "SKILLS/check-rules/check-rules.mjs",
  "SKILLS/check-docs/SKILL.md",
];

/**
 * Would npm include `file` in the tarball, given this `files` array?
 *
 * Reads npm's actual rule instead of shelling out to `npm pack`: a positive
 * entry is a path prefix, and a later `!` entry cancels it.
 *
 * Packing for real was the first version of this test, and it broke inside
 * `prepublishOnly` — the outer `npm publish` already holds the lock, so the
 * nested pack produced nothing and the whole publish died. A test that cannot
 * run in the one place it most needs to run is a test that gets deleted.
 */
function wouldPack(file, files) {
  let included = false;
  for (const entry of files) {
    const negated = entry.startsWith("!");
    const pattern = negated ? entry.slice(1) : entry;
    const matches = file === pattern || file.startsWith(`${pattern}/`);
    if (matches) {
      included = !negated;
    }
  }
  return included;
}

function packageFiles() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).files ?? [];
}

test("the package files array would ship every essential file", () => {
  const missing = ESSENTIAL_FILES.filter((file) => !wouldPack(file, packageFiles()));
  assert.deepEqual(
    missing,
    [],
    `these would NOT be in the tarball, so the release guard would fail on them: ${missing.join(", ")}`,
  );
});

test("the files array does not ship node_modules or a build output", () => {
  const files = packageFiles();

  // These negations keep a developer's local install out of the tarball. Without
  // them the package is 16.803 files and 153 MB, which is exactly what shipped
  // once before.
  for (const junk of [
    "template/next/node_modules/some-package/index.js",
    "template/next/.next/build-manifest.json",
    "template/next/coverage/lcov.info",
  ]) {
    assert.equal(
      wouldPack(junk, files),
      false,
      `${junk} would be published. The negation for it is missing from "files".`,
    );
  }
});

test("the release workflow lists exactly the files this test requires", () => {
  // The workflow has its own copy, because a workflow cannot import from the
  // test suite. This test is what stops the two copies from drifting, and it is
  // the regression test for the wrong-path bug.
  const workflow = fs.readFileSync(
    path.join(REPO_ROOT, ".github", "workflows", "release.yml"),
    "utf8",
  );

  for (const file of ESSENTIAL_FILES) {
    assert.ok(
      workflow.includes(file),
      `release.yml does not assert ${file}, but the test requires it in the tarball`,
    );
  }
});

test("the release workflow checks every template's essentials, without naming one", () => {
  // The per-template list is built from `TEMPLATES` rather than written out, so a
  // second template is covered without editing this file. That only holds if the
  // workflow really does interpolate — so the assertion is on the loop's shape, not
  // on a path, because a path spelled out for `next` is the bug.
  const workflow = fs.readFileSync(
    path.join(REPO_ROOT, ".github", "workflows", "release.yml"),
    "utf8",
  );

  assert.match(
    workflow,
    /for t in \$TEMPLATES/,
    "release.yml does not loop over the templates, so a second template is unguarded",
  );

  for (const suffix of TEMPLATED_SUFFIXES) {
    assert.ok(
      workflow.includes(`"template/$t/${suffix}"`),
      `release.yml does not assert template/$t/${suffix}, so a generated app could ship ` +
        `without it. An app with no .gitignore commits its secrets.`,
    );
  }

  for (const file of NEXT_ONLY_FILES) {
    assert.ok(
      workflow.includes(file),
      `release.yml does not assert ${file}`,
    );
  }
});

test("the essential files exist on disk, so the guard tests the real thing", () => {
  // A path that does not exist cannot appear in the pack, so the first test
  // would pass for the wrong reason if these were typo'd.
  const missing = ESSENTIAL_FILES.filter((file) => !fs.existsSync(path.join(REPO_ROOT, file)));
  assert.deepEqual(missing, [], `these do not exist: ${missing.join(", ")}`);

  const missingTemplates = TEMPLATES.flatMap((t) =>
    TEMPLATED_SUFFIXES.map((s) => `template/${t}/${s}`),
  ).filter((file) => !fs.existsSync(path.join(REPO_ROOT, file)));
  assert.deepEqual(
    missingTemplates,
    [],
    `these do not exist: ${missingTemplates.join(", ")}`,
  );
});
