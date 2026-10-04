import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = path.join(REPO_ROOT, "SKILLS", "check-facts", "check-facts.mjs");

/**
 * `docs/PRODUCT.md` claimed 27 tests while the suite had 79, and `README.md`
 * claimed 52 tests and 33 documents. Every one of them was green. A number in
 * prose is not a check.
 *
 * This file protects the check, which is the part that can fail silently. A
 * guard that stops matching anything passes forever and reports safety it does
 * not have — the failure mode that hit three guards in the release workflow.
 *
 * So: plant a wrong number in a real document, run the check, require red.
 *
 * Note on recursion. This file runs the check, and the check runs the suite,
 * which includes this file. That is not an infinite loop: `testCount()` is
 * called once at module scope, and nothing here reads its output as a fact.
 * What made it loop once was excluding this file from the count, which made
 * the reported number disagree with the real one — so the document stating the
 * real number failed. The loop was a symptom; excluding this file was the
 * wrong cure.
 */
function runCheck() {
  try {
    const out = execFileSync(process.execPath, [CHECK], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

test("the check is wired into CI and into the publish gate", () => {
  const ci = fs.readFileSync(path.join(REPO_ROOT, ".github", "workflows", "ci.yml"), "utf8");
  assert.match(ci, /run: npm run check:facts/, "CI does not run check-facts");

  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  assert.match(
    pkg.scripts.prepublishOnly,
    /check:facts/,
    "prepublishOnly does not run check-facts, so a release could ship a stale number",
  );
});

test("the check passes on the repository as it stands", () => {
  const result = runCheck();
  assert.equal(result.code, 0, `check-facts failed on a clean tree:\n${result.out}`);
});

test("the check sees the claims it claims to see", () => {
  // A guard that reports "0 assertions verified" is indistinguishable from one
  // that works, from the outside. Assert it found something.
  const result = runCheck();
  const m = /✓ (\d+) claim/.exec(result.out);
  assert.ok(m, `could not read the count from: ${result.out}`);
  assert.ok(Number(m[1]) > 0, "check-facts verified nothing, so it cannot fail");
});

test("a wrong number in a document turns the check red", () => {
  const readme = path.join(REPO_ROOT, "README.md");
  const original = fs.readFileSync(readme, "utf8");

  try {
    // A real assertion: plain prose, no backticks, no escape hatch — which is
    // exactly the shape a genuine claim takes.
    //
    // The anchor is the SKILLS heading, and the assertion is deliberately specific:
    // it plants a *test count* next to a sentence about automations, because that
    // is the mistake this check exists to catch — a number attached to a claim it
    // cannot support. An earlier version of this test anchored on a sentence about
    // templates, and when the README was rewritten it failed with "could not plant".
    // A test that silently stops testing is worse than no test.
    const tampered = original.replace(
      "## 📚 SKILLS",
      "## 📚 SKILLS\n\nThere are 12 tests.",
    );
    assert.notEqual(tampered, original, "could not plant a stale number in README.md");
    fs.writeFileSync(readme, tampered);

    const result = runCheck();
    assert.equal(result.code, 1, `a stale number did not fail the check:\n${result.out}`);
    assert.match(result.out, /12 tests/, "the failure does not name the stale claim");
    assert.match(result.out, /out of date/, "the failure does not say it is out of date");
  } finally {
    fs.writeFileSync(readme, original);
  }
});

test("the escape hatch is documented and narrow", () => {
  const skill = fs.readFileSync(
    path.join(REPO_ROOT, "SKILLS", "check-facts", "SKILL.md"),
    "utf8",
  );

  // A document that explains a stale number has to quote it. Without a way to
  // write that sentence, the sentence gets deleted and the check quietly stops
  // being worth running.
  assert.match(skill, /fact:off/, "SKILL.md does not document the escape hatch");
  assert.match(skill, /fact:on/, "SKILL.md does not document where the hatch ends");

  // It is an escape hatch, not an exclusion. It must not become the default.
  const uses = fs
    .readFileSync(CHECK, "utf8")
    .split("\n")
    .filter((line) => line.includes("fact:off") && !line.trim().startsWith("*"));
  assert.ok(
    uses.length <= 2,
    `check-facts.mjs references fact:off ${uses.length} times; an escape hatch ` +
      `that appears in several rules stops being narrow`,
  );
});

/**
 * check-facts counts `^test(` declarations instead of running the suite,
 * because `node --test` refuses to recurse inside a test file and the suite
 * mutates the working tree while it runs.
 *
 * That trade is only safe while the count matches what the runner reports, so
 * this assertion lives in CI as a separate job rather than inside this file: a
 * test cannot spawn `node --test` to check a script that exists because tests
 * cannot spawn `node --test`. The same refusal that forced the static count
 * forbids checking it here.
 *
 * `npm test` in the Quality job prints the real count next to the reported one,
 * and a reader comparing them is the check.
 */
test("check-facts and check-docs agree on how many documents there are", () => {
  // Two tools that both answer "how many documents does this repository have"
  // and disagree by one is a defect neither reports. It showed up here the
  // moment `template/` was skipped by check-docs and not by check-facts.
  const out = execFileSync(
    process.execPath,
    [path.join(REPO_ROOT, "SKILLS", "check-docs", "check-docs.mjs")],
    { cwd: REPO_ROOT, encoding: "utf8" },
  );
  const docs = /✓ (\d+) documents/.exec(out);
  assert.ok(docs, `could not read the document count from: ${out}`);

  const facts = runCheck();
  const reported = /✓ \d+ claim\(s\) verified \(\d+ tests, (\d+) documents\)/.exec(
    facts.out,
  );
  assert.ok(reported, `could not read the check's own report: ${facts.out}`);

  assert.equal(
    Number(reported[1]),
    Number(docs[1]),
    `check-docs says ${docs[1]} documents and check-facts says ${reported[1]}. ` +
      `Two tools must not disagree about the same count.`,
  );
});

test("the check reports its own numbers so a drift is visible in CI output", () => {
  const result = runCheck();
  assert.equal(result.code, 0, `check-facts failed on a clean tree:\n${result.out}`);
  assert.match(
    result.out,
    /✓ \d+ claim\(s\) verified \(\d+ tests, \d+ documents\)/,
    `the check must print both counts; a bare "ok" hides a drift it cannot see: ${result.out}`,
  );
});
