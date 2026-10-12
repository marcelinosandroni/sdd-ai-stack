#!/usr/bin/env node
/**
 * The release chain, as one command.
 *
 *   node SDD/SKILLS/release/release.mjs <patch|minor|major> [--dry-run]
 *   node SDD/SKILLS/release/release.mjs verify 0.7.2
 *
 * This chain was run by hand four times in one session: bump the version, sync the site,
 * open the changelog section, commit, push, open the PR, wait for CI, tag, publish, then
 * verify the package. Every link is already a script. The chain was not, and a chain
 * executed by hand four times in a row is a chain that eventually skips a step — which is
 * how 0.7.0 shipped advertising a command whose file was not in the tarball.
 *
 * It stops at the tag. `release.yml` already refuses to publish while CI on the tag's
 * commit is red, and that guard is better than anything this file could reimplement: it
 * runs on the runner, against the real commit, with the real workflow. Duplicating it
 * here would be the worse of two.
 *
 * So the division is: everything local runs here, the tag is pushed here, and the
 * publish is CI's. `--dry-run` stops before the first mutation, which is the default
 * shape for a command that rewrites a version number in four files.
 *
 * Every failure prints what it was about to do and why it stopped. A release script that
 * dies on a stack trace after having rewritten half the tree is worse than no script.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `SKILLS/release/` — two levels up is the repository root.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * The one manifest `npm version` writes.
 *
 * `site/package.json` is deliberately NOT here. It is a separate package with its own
 * version that has never tracked the root's, and asserting they match was wrong in a way
 * that looked right: the chain stopped on a file it was never supposed to touch.
 *
 * What genuinely has to agree is the version the site *displays*, which is a committed
 * constant in `site/src/content.ts` rather than a manifest — see `SITE_VERSION_LINE`.
 */
const ROOT_MANIFEST = "package.json";
const SITE_VERSION_LINE = /^export const VERSION = "([^"]+)";$/m;
const CHANGELOG = path.join(ROOT, "docs", "CHANGELOG.md");

const [bump, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");

if (!bump) {
  usage(
    "no bump given. Pass patch, minor or major — or `verify` with a version to check " +
      "that a published tarball is complete.",
  );
}

/**
 * Print to stderr and exit 1.
 *
 * Every abort goes through here, and every one of them names the step. A half-finished
 * release is recoverable; a half-finished release nobody can tell the state of is not.
 */
function abort(step, reason, remedy) {
  console.error(`✖ release: stopped at "${step}" — ${reason}`);
  if (remedy) console.error(`  ${remedy}`);
  process.exit(1);
}

function usage(message) {
  console.error(
    [
      "release.mjs — the local half of a release: bump, sync, changelog, commit, tag.",
      "",
      "  node SDD/SKILLS/release/release.mjs <patch|minor|major> [--dry-run]",
      "  node SDD/SKILLS/release/release.mjs verify <version>",
      "",
      ...(message ? [`  ${message}`] : []),
    ].join("\n"),
  );
  process.exit(1);
}

/**
 * Run a command in the repository, letting its output through.
 *
 * The shell is per-command, and getting that wrong twice is how this function came to
 * exist:
 *
 * - Without a shell, `npm` is `npm.cmd` on Windows and `execFileSync` reports
 *   `spawnSync npm ENOENT` — on the program, not on the path. A real release failed on its
 *   first step, on the machine that wrote it.
 * - With a shell everywhere, `process.execPath` becomes `C:\Program Files\nodejs\node.exe`
 *   and the space breaks it. The Windows error for that is a Portuguese sentence about
 *   batch files, which told the reader nothing.
 *
 * So: shell for the `.cmd` shims, no shell for everything with a real path.
 */
function run(step, command, args) {
  if (dryRun) {
    console.log(`  would run: ${[command, ...args].join(" ")}`);
    return "";
  }
  try {
    return execFileSync(command, args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: NEEDS_SHELL.has(command),
    });
  } catch (error) {
    const reason = (error.stderr || "").trim().split("\n").filter(Boolean).slice(-1)[0];
    abort(
      step,
      reason || `\`${command}\` could not be run (${error.code ?? error.message}). ` +
        "On Windows an unqualified npm is npm.cmd and needs a shell; a path with a space in " +
        "it does not.",
      `run \`${[command, ...args].join(" ")}\` by hand to see the full output`,
    );
  }
}

/** Commands that resolve to a `.cmd` shim on Windows and therefore need a shell. */
const NEEDS_SHELL = new Set(["npm", "npx"]);

function currentVersion() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
}

/** Semver's own rules, small enough to state and strict enough to be worth stating. */
function nextVersion(version, kind) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) abort("version", `\`${version}\` is not semver`, "fix package.json and retry");

  const [major, minor, patch] = match.slice(1).map(Number);
  return kind === "major" ? `${major + 1}.0.0`
    : kind === "minor" ? `${major}.${minor + 1}.0`
    : `${major}.${minor}.${patch + 1}`;
}

if (bump === "verify") {
  const version = flags[0];
  if (!version) usage("verify needs a version: `verify 0.7.2`");

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const listing = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      // `npm` is `npm.cmd` on Windows; `execFileSync` without a shell reports ENOENT on
      // the program rather than on the path. The argv is fixed, with no input in it.
      shell: true,
    }),
  );
  const result = Array.isArray(listing) ? listing[0] : listing[pkg.name];
  const files = result.files.map((f) => f.path.replace(/\\/g, "/"));

  // The packaging contract, stated once. `tests/package-scripts.test.mjs` holds the same
  // two rules in CI; duplicating them here would be how the two drift apart.
  //
  // It is NOT "every script target ships". That was tried, published as 0.7.1, and was
  // wrong: `scripts/sync-site-facts.mjs` reads `site/`, which is deliberately not shipped,
  // so the command existed in the install and died with ENOENT when run. Repository
  // tooling does not ship, and the test that forgot that is what shipped the mistake.
  const REQUIRED = ["bin/", "lib/", "themes/", "template/next/", "template/spa/", "AGENTS.md"];
  const NOT_SHIPPED = ["site/", "scripts/"];

  const problems = [];
  for (const entry of REQUIRED) {
    if (!files.some((file) => file.startsWith(entry))) problems.push(`missing ${entry}`);
  }
  for (const entry of NOT_SHIPPED) {
    if (files.some((file) => file.startsWith(entry))) {
      problems.push(`${entry} is published — site is the presentation and scripts/ is repo tooling; neither runs from an install`);
    }
  }

  if (problems.length > 0) {
    abort("verify", `the tarball for ${version} breaks the packaging contract:\n    ${problems.join("\n    ")}`);
  }

  console.log(`✓ ${version}: ${files.length} files, packaging contract holds`);
  process.exit(0);
}

if (!["patch", "minor", "major"].includes(bump)) {
  usage(`\`${bump}\` is not patch, minor or major.`);
}

// Exactly one bump, and no surprises. `release patch extra-bump` used to ignore the
// second word and release anyway, which is the class of thing a release script must never
// do quietly — the version it writes is published under your name.
const extra = flags.filter((flag) => flag !== "--dry-run");
if (extra.length > 0) {
  usage(`unexpected argument${extra.length > 1 ? "s" : ""}: ${extra.join(", ")}. One bump, or none.`);
}

const from = currentVersion();
const to = nextVersion(from, bump);

if (dryRun) {
  console.log(`release ${from} → ${to} (${bump})  [dry run — nothing written]`);
}

// 1. Bump. `npm version` writes both manifests and refuses a dirty tree, which is the
//    behaviour we want: a release that cannot describe its own diff is not a release.
run("bump", "npm", ["version", bump, "--no-git-tag-version"]);

// 4. The gates. Publishing is not this script's job, but a release should not reach a tag
//    before anyone noticed a red build locally. `site:check` runs first because it is the
//    one a bump can break — the site commits the version, so a bump that skips it ships a
//    page naming the version it replaces, which is how 0.2.0 outlived 0.6.0 on npm.
run("sync", process.execPath, ["scripts/sync-site-facts.mjs"]);

// 3. Changelog section. The header is MECHANICAL and is written; the body is a JUDGEMENT
//    and is not. `release patch` otherwise stops with "add one by hand", which is a
//    manual step in the middle of the chain the chain exists to remove — and a manual step
//    is where 0.7.0 shipped a command whose file was not in the tarball.
//
//    It opens an existing `[Unreleased]` if there is one and inserts a fresh section
//    otherwise, always with a prompt line, because an empty section is indistinguishable
//    from a forgotten one.
if (!dryRun) {
  const today = new Date().toISOString().slice(0, 10);
  const marker = "## [Unreleased]";
  const changelog = fs.readFileSync(CHANGELOG, "utf8");

  if (changelog.includes(`## [${to}]`)) {
    abort("changelog", `${to} already has a section`, "bump to a version that does not exist yet");
  }

  const section = `## [${to}] — ${today}\n\n<!-- What changed, and why it was worth a release. -->\n`;
  const updated = changelog.includes(marker)
    ? changelog.replace(marker, section)
    : // Insert below the first `---` that follows the title, which is where a new section
      // belongs and where the existing ones already live.
      changelog.replace(/(---\r?\n)/, `$1\n${section}\n`);

  fs.writeFileSync(CHANGELOG, updated, "utf8");
  console.log(`✓ opened ## [${to}] in docs/CHANGELOG.md`);
}

// 5. Both manifests, then the commit and the tag. The commit is left local, not pushed:
//    `main` is protected and every change goes through a pull request, so a release is a
//    PR and a tag, not a push.
//
//    The dry run exits HERE, before the verification below. It used to fall through, and
//    the verification correctly complained that package.json still said the old version —
//    a dry run that fails because it did not do the thing it said it would not do.
if (dryRun) {
  console.log(`  would verify: ${ROOT_MANIFEST} and the site's VERSION both at ${to}, changelog section opened`);
  console.log(`  would commit and tag v${to}`);
  console.log(`\n${from} → ${to}. Nothing was written.`);
  process.exit(0);
}

const declared = JSON.parse(fs.readFileSync(path.join(ROOT, ROOT_MANIFEST), "utf8")).version;
if (declared !== to) abort("verify", `${ROOT_MANIFEST} says ${declared}, expected ${to}`);

const shown = SITE_VERSION_LINE.exec(
  fs.readFileSync(path.join(ROOT, "site", "src", "content.ts"), "utf8"),
)?.[1];
if (shown !== to) {
  abort(
    "verify",
    `the site displays v${shown}, expected v${to}. A release that ships a page naming the ` +
      "version it replaces is exactly the bug that left 0.2.0 on the site while npm said 0.6.0.",
    "run `npm run site:sync` and check what it changed",
  );
}

console.log(`✓ ${ROOT_MANIFEST} and the site's VERSION both at ${to}`);

run("commit", "git", ["add", "-A"]);
run("commit", "git", ["commit", "-m", `chore(release): ${to}. (Agent: OpenCode - Big Pickle)`]);
run("tag", "git", ["tag", "-a", `v${to}`, "-m", `${to}.`]);

console.log(`\n${from} → ${to}`);
console.log("  staged: one commit and the tag v" + to);
console.log("  next:   open the PR, wait for CI, merge, then `git push origin v" + to + "`");
console.log("  the tag is not pushed here — release.yml guards CI on the tagged commit, and a");
console.log("  tag pushed before that guard runs is a publish the guard cannot stop.");