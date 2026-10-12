import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));

/**
 * What `npm pack` would actually put in the tarball.
 *
 * 0.7.0 published `npm run version:sync` and not the file it runs, because `scripts/`
 * was missing from `files`. The repository was green — 169 tests, every gate passing —
 * and the published artifact was broken, so "the script exists in the repository" and
 * "the script ships" turned out to be different claims with only the first one tested.
 *
 * The fix that shipped in 0.7.1 added `scripts/` to `files`, which was also wrong: the
 * script reads `site/`, which is deliberately not published, so it could not run from an
 * install either. It was taken back out in 0.7.2.
 *
 * What remains is the part that was always true and never tested — the file list is
 * read from what `npm pack` actually produces, so that the two exclusions below are
 * asserted against the real tarball instead of against somebody's reading of `files`.
 *
 * This was found by installing the package and opening it, not by reading a diff. A gate
 * that only ever runs over a green working tree says nothing about the artifact that
 * leaves it.
 */

/** What `npm pack` would actually put in the tarball. Cached: the test file runs it once. */
let packedFiles;

function packList() {
  if (packedFiles) return packedFiles;

  // `npm` is `npm.cmd` on Windows, so `execFileSync` without a shell reports ENOENT on
  // the program rather than on the path. `execSync` takes a command string and runs it
  // through the platform shell, which is the portable form here. The command is a fixed
  // literal with no interpolated input.
  const raw = execSync("npm pack --dry-run --json", {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  const parsed = JSON.parse(raw);
  // npm has shipped both shapes for `pack --json`: an array of pack results, and an
  // object keyed by package name. Whichever this machine has, the file list is the same
  // claim, so both are read rather than one being assumed.
  const result = Array.isArray(parsed) ? parsed[0] : parsed[pkg.name];

  assert.ok(result, `npm pack returned an unexpected shape: ${raw.slice(0, 200)}`);
  packedFiles = result.files.map((f) => f.path.replace(/\\/g, "/"));
  return packedFiles;
}

/** `node lib/scaffold.mjs --x` and `npm run foo && node bar/baz.mjs` both yield paths. */
function referencedPaths(command) {
  return [...command.matchAll(/(?:^|[\s|&;])(?:node|bash|sh)\s+([^\s|&;]+\.(?:mjs|js|sh))/g)].map(
    (match) => match[1],
  );
}

test("every local file a script invokes exists in the repository", () => {
  const missing = [];

  for (const [name, command] of Object.entries(pkg.scripts)) {
    for (const relative of referencedPaths(command)) {
      if (!fs.existsSync(path.join(REPO_ROOT, relative))) {
        missing.push(`${name} → ${relative}`);
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    `a script points at a file that does not exist:\n${missing.join("\n")}`,
  );
});

test("the pack list is not empty, and the core directories are in it", () => {
  const shipped = packList();

  assert.ok(shipped.length > 100, `only ${shipped.length} files would be published`);
  for (const required of ["lib/", "bin/", "themes/", "template/next/", "template/spa/"]) {
    assert.ok(
      shipped.some((file) => file.startsWith(required)),
      `nothing under ${required} would be published`,
    );
  }
});

test("the repository's own tooling does not ship", () => {
  // `scripts/` is a maintainer's tool: `sync-version.mjs` reads `site/src/content.ts`,
  // and `site/` is deliberately not published. Shipping the script would put a file in
  // every install that cannot run — the published 0.7.1 did exactly that, and the fix
  // was to take it back out rather than to make it work, because a command that fails
  // with ENOENT is worse than a command that is not offered.
  //
  // This was published once and found by installing it, so the decision is asserted
  // rather than left to the next person who reads `files` and wonders.
  const shipped = packList();
  const local = Object.entries(pkg.scripts).filter(([, command]) =>
    referencedPaths(command).some((p) => p.startsWith("scripts/")),
  );

  assert.ok(
    !shipped.some((file) => file.startsWith("scripts/")),
    "scripts/ is in the tarball. Its files read site/, which is not published, so they " +
      "cannot run from an install.",
  );
  assert.ok(
    local.length > 0,
    "no script points at scripts/ any more. If that was deliberate, update this test " +
      "rather than leaving it asserting nothing.",
  );
  for (const [name] of local) {
    assert.ok(name.length > 0);
  }
});

test("the published package is the kit, not the presentation", () => {
  // The site is how this repository is presented, not something a generated project
  // needs. Shipping it would add a second Next.js app and its own dependencies to every
  // install. Asserted because it is a decision someone will otherwise "fix" by accident.
  const shipped = packList();

  assert.ok(!shipped.some((file) => file.startsWith("site/")), "site/ is in the tarball");
  assert.ok(!pkg.files.includes("site"), "site is listed in package.json files");
});