import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));

/**
 * Every script has to be able to run.
 *
 * `version:sync` was added to `package.json` and the file it points at was not in the
 * `files` array. The repository was green — 165 tests, every gate passing — and the
 * published tarball did not contain `scripts/sync-version.mjs`. So `npm i -g
 * create-sdd-ai-stack` gave you a package whose `version:sync` died with
 * `Cannot find module`.
 *
 * Nothing checked it, because "the script exists in the repository" and "the script
 * ships" are different claims, and only the first one was ever tested. This is the
 * second one, asserted against what npm actually packs rather than against the `files`
 * array — the array is the thing that was wrong, and re-deriving it would inherit the
 * mistake.
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

  assert.deepEqual(missing, [], `a script points at a file that does not exist:\n${missing.join("\n")}`);
});

test("every local file a script invokes is in the published tarball", () => {
  const shipped = new Set(packList());
  const missing = [];

  for (const [name, command] of Object.entries(pkg.scripts)) {
    for (const relative of referencedPaths(command)) {
      const normalized = relative.replace(/^\.\//, "").replace(/\\/g, "/");
      if (!shipped.has(normalized)) {
        missing.push(`${name} → ${normalized}`);
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    `a script points at a file npm does not publish:\n${missing.join("\n")}\n\n` +
      `The repository is green and the published package is broken: "npm run ${Object.keys(pkg.scripts)[0]}" ` +
      `works for whoever cloned it and fails for whoever installed it. Add the directory to "files" in ` +
      `package.json.`,
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

test("the site is not published, and that is deliberate", () => {
  // The site is how this repository is presented, not something a generated project
  // needs. Shipping it would add a second Next.js app and its own dependencies to every
  // install. Asserted because it is a decision someone will otherwise "fix" by accident.
  const shipped = packList();

  assert.ok(
    !shipped.some((file) => file.startsWith("site/")),
    "site/ is in the tarball. It is the marketing site, not part of the kit.",
  );
  assert.ok(!pkg.files.includes("site"), "site is listed in package.json files");
});