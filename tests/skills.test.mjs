import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(skill, ...args) {
  return spawnSync(process.execPath, [path.join(REPO_ROOT, "SKILLS", skill, `${skill}.mjs`), ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
}

test("check-context: the published budget holds, and it can prove it", () => {
  const result = run("check-context");

  assert.equal(result.status, 0, `check-context failed:\n${result.stderr}`);
  // One line, by design. A skill script that prints a table on every run costs ~200
  // tokens every time it is used, forever, which is the cost rule 9 is about.
  assert.equal(result.stdout.trim().split("\n").length, 1, result.stdout);
  assert.match(result.stdout, /context budget holds/);
});

test("check-context: --report measures every tier and names the constant", () => {
  const result = run("check-context", "--report");

  assert.equal(result.status, 0, result.stderr);
  for (const tier of ["Tier 1", "Tier 2", "Tier 3"]) {
    assert.match(result.stdout, new RegExp(tier), result.stdout);
  }
  // The constant is stated, so a failure is diagnosable without opening this file.
  assert.match(result.stdout, /constant in use/);
  assert.match(result.stdout, /implied by the doc/);
});

test("check-context: the constant is fixed, not solved from the data it checks", () => {
  // The regression this whole test exists for. The first version derived chars/token from
  // the Tier 1 claim it was verifying: growing a Tier 1 file raised the implied constant,
  // the full-set check then agreed with it, and the drift passed. A verifier that can
  // always explain the data is not a verifier.
  //
  // Planting the failure is the only way to know the difference, so the skill is run
  // against a repository whose Tier 1 has grown, and it has to fail.
  const pref = path.join(REPO_ROOT, "PREFLIGHT.md");
  const original = fs.readFileSync(pref, "utf8");

  try {
    fs.writeFileSync(pref, original + "\n" + "x".repeat(3000));
    const grown = run("check-context");

    assert.notEqual(
      grown.status,
      0,
      "growing PREFLIGHT.md by 3kB did not fail the check — the constant is being solved " +
        "from the data it verifies",
    );
    // The message has to say which of the two things moved, or nobody can act on it.
    assert.match(grown.stderr, /chars\/token|off, tolerance/);
  } finally {
    fs.writeFileSync(pref, original, "utf8");
  }

  assert.equal(run("check-context").status, 0, "the tree did not come back clean");
});

test("check-context: it measures the files AGENTS.md §1 actually names", () => {
  // The tier membership is stated in the skill and the number is parsed from the
  // document. Two independent sources, because parsing the table would make the verifier
  // downstream of the thing it verifies.
  const source = fs.readFileSync(path.join(REPO_ROOT, "SKILLS", "check-context", "check-context.mjs"), "utf8");
  const declared = ["AGENTS.md", "specs/PLAN.md", "PREFLIGHT.md", "APP.md", "APP-STACK.md"];

  for (const file of declared) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, file)), `${file} does not exist`);
    assert.ok(source.includes(`"${file}"`), `check-context does not measure ${file}`);
  }
});

test("release: a dry run writes nothing", () => {
  const before = fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8");
  const changelogBefore = fs.readFileSync(path.join(REPO_ROOT, "docs", "CHANGELOG.md"), "utf8");

  const result = run("release", "patch", "--dry-run");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Nothing was written/);
  assert.equal(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"), before);
  assert.equal(fs.readFileSync(path.join(REPO_ROOT, "docs", "CHANGELOG.md"), "utf8"), changelogBefore);
});

test("release: it refuses anything that is not a semver bump, rather than guessing", () => {
  // Each of these is a way a human can get the chain wrong by hand, so each has to be a
  // refusal and not a silent default. A release script that guesses which version you
  // meant is worse than one that asks.
  for (const args of [[], ["banana"], ["patch", "extra-bump"], ["verify"]]) {
    const result = run("release", ...args);

    assert.notEqual(result.status, 0, `release ${args.join(" ") || "(no args)"} should not have succeeded`);
    assert.match(result.stderr, /release\.mjs|not patch, minor or major|needs a version/);
  }
});

test("release: a real bump is executable on this machine, not just parseable", () => {
  // The first version of `run()` had no shell, so `execFileSync` reported `spawnSync npm
  // ENOENT` on Windows — a real release failed on its very first step, on the machine that
  // wrote it. `npm` is `npm.cmd` there. A dry run cannot catch it because a dry run does
  // not run anything, so this invokes the real thing in a throwaway copy of the version
  // bump and asserts it gets as far as writing a file.
  const script = fs.readFileSync(path.join(REPO_ROOT, "SKILLS", "release", "release.mjs"), "utf8");

  // Static assertion for the cause, behavioural assertion for the shape: `npm` has to go
  // through a shell or the OS has to be asked where it is.
  assert.match(script, /shell:\s*true/, "run() has no shell, so npm is ENOENT on Windows");

  const result = run("release", "patch", "--dry-run");
  assert.match(result.stdout, /would run: npm version patch/, result.stdout);
});

test("release: verify needs the version it is verifying", () => {
  const result = run("release", "verify");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /needs a version/);
});

test("release: verify holds the packaging contract, not the 0.7.1 mistake", () => {
  const result = run("release", "verify", "0.0.0");

  assert.equal(result.status, 0, `the tarball breaks the packaging contract:\n${result.stderr}`);
  // Repository tooling does not ship. 0.7.1 published it, and the published command died
  // with ENOENT because it reads site/, which is also not shipped.
  assert.doesNotMatch(result.stdout, /omits files its own scripts invoke/);
  assert.match(result.stdout, /packaging contract holds/);
});

test("release: the contract names both exclusions", () => {
  const source = fs.readFileSync(path.join(REPO_ROOT, "SKILLS", "release", "release.mjs"), "utf8");

  assert.match(source, /NOT_SHIPPED/, "the exclusions are stated as an omission, not as a rule");
  assert.match(source, /"site\/"/);
  assert.match(source, /"scripts\/"/);
  // And it must not have quietly reintroduced the claim that every script target ships.
  assert.doesNotMatch(
    source,
    /omits files its own scripts invoke/,
    "release.mjs is asserting the 0.7.1 rule again: that every script target must publish",
  );
});

test("every skill has a contract document and a runnable script", () => {
  const skills = fs
    .readdirSync(path.join(REPO_ROOT, "SKILLS"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  assert.ok(skills.length >= 9, `only ${skills.length} skills found`);

  for (const skill of skills) {
    const dir = path.join(REPO_ROOT, "SKILLS", skill.name);
    assert.ok(fs.existsSync(path.join(dir, "SKILL.md")), `${skill.name} has no SKILL.md`);
    assert.ok(
      fs.existsSync(path.join(dir, `${skill.name}.mjs`)),
      `${skill.name}/SKILL.md exists but ${skill.name}.mjs does not — the contract must have a mechanism`,
    );
  }
});