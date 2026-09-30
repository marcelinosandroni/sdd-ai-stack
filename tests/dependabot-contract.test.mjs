import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CI = path.join(REPO_ROOT, ".github", "workflows", "ci.yml");
const DEPENDABOT = path.join(REPO_ROOT, ".github", "dependabot.yml");
const TEMPLATE_PKG = path.join(REPO_ROOT, "template", "next", "package.json");
const README = path.join(REPO_ROOT, "README.md");

const pkg = JSON.parse(fs.readFileSync(TEMPLATE_PKG, "utf8"));

/** The major every gate in this repository is actually run on. */
function ciTemplateNodeMajor() {
  const yml = fs.readFileSync(CI, "utf8");
  // The job that generates the app and runs typecheck, lint, test, build, e2e.
  const job = yml.slice(yml.indexOf("\n  template:"));
  const m = /node-version:\s*(\d+)/.exec(job);
  return m ? Number(m[1]) : null;
}

test("the template's type package matches the runtime its CI uses", () => {
  const major = ciTemplateNodeMajor();
  assert.ok(major, "could not read node-version from the template CI job");

  const types = pkg.devDependencies["@types/node"];
  const pinned = Number(/(\d+)/.exec(types)[1]);

  // @types/node describes the runtime API. A newer major than the runtime
  // describes functions the runtime does not have — and the typecheck fails in
  // a way that looks like a template bug rather than a version mismatch.
  assert.equal(
    pinned,
    major,
    `@types/node is pinned to ${pinned} but the template CI builds on Node ${major}. ` +
      `Type packages must describe the runtime that runs them.`,
  );
});

test("Dependabot cannot bump @types/node past the runtime", () => {
  const yml = fs.readFileSync(DEPENDABOT, "utf8");
  const ignore = /dependency-name:\s*"@types\/node"\s*\n\s*update-types:\s*\[([^\]]*)\]/.exec(yml);
  assert.ok(ignore, "@types/node has no ignore rule in dependabot.yml");

  const types = ignore[1].split(",").map((s) => s.trim().replace(/"/g, ""));

  // It originally said ["minor", "patch"], which ignored the safe bumps and let
  // every major through. Dependabot opened 22.20.4 -> 26.6.3 and it had to be
  // closed by hand. A guard inverted from its own comment.
  assert.ok(
    types.includes("version-update:semver-major"),
    `@types/node ignores [${types.join(", ")}] — majors must be ignored, ` +
      `or Dependabot will offer types for a runtime that does not exist`,
  );
  assert.ok(
    !types.includes("minor") && !types.includes("patch"),
    `@types/node ignores [${types.join(", ")}] — those bumps are safe; the pin ` +
      `tracks the runtime minor, and blocking them stalls the pin behind the runtime`,
  );
});

test("the README states the Node version the repository is verified on", () => {
  const readme = fs.readFileSync(README, "utf8");
  const major = ciTemplateNodeMajor();

  // Undocumented, the pin is a private detail that drifts silently. The README
  // is the first thing a user reads and the only place they learn what is tested.
  assert.match(
    readme,
    new RegExp(`\\*\\*Node\\.js\\*\\*\\s*\\|\\s*${major}\\.x`),
    `the README does not state that the repository is verified on Node ${major}`,
  );
});

test("Dependabot covers the template and the workflows, and nothing that is not ours", () => {
  const yml = fs.readFileSync(DEPENDABOT, "utf8");

  assert.match(
    yml,
    /package-ecosystem:\s*npm[\s\S]*?directory:\s*\/template\/next/,
    "Dependabot does not watch template/next, so its dependencies never get updates",
  );
  assert.match(
    yml,
    /package-ecosystem:\s*github-actions[\s\S]*?directory:\s*\/$/m,
    "Dependabot does not watch the workflows",
  );
});

test("the dependency groups cover the template's actual dependencies", () => {
  const yml = fs.readFileSync(DEPENDABOT, "utf8");

  // A group whose patterns match nothing is dead configuration that reads like
  // a policy. Every group is asserted to match at least one real dependency.
  const declared = { ...pkg.dependencies, ...pkg.devDependencies };
  const groups = [...yml.matchAll(/^ {6}(\S+):\n((?:^ {8}.*\n?)*)/gm)];

  assert.ok(groups.length > 0, "no dependency groups found");

  for (const [, name, body] of groups) {
    const patterns = [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    assert.ok(patterns.length > 0, `the "${name}" group lists no patterns`);

    const matches = patterns.some((p) =>
      Object.keys(declared).some((dep) => dep === p || dep.startsWith(p.replace(/\*$/, ""))),
    );
    assert.ok(
      matches,
      `the "${name}" group matches no dependency in template/next/package.json: ` +
        patterns.join(", "),
    );
  }
});
