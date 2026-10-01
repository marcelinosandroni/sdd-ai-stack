import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOGFOOD = path.join(REPO_ROOT, "SKILLS", "dogfood", "dogfood.mjs");
const CI = path.join(REPO_ROOT, ".github", "workflows", "ci.yml");

function runDogfood(args = []) {
  try {
    const out = execFileSync(process.execPath, [DOGFOOD, ...args], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      timeout: 600_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

/**
 * The dogfood is the only check that runs the template against something the
 * template did not produce.
 *
 * Six bugs reached `main` green because every other gate validates *this*
 * repository, which has the three files a generated app lacks:
 * `tests/cli-flags.test.mjs`, its own `package.json`, and
 * `.github/workflows/release.yml`.
 *
 * So this file has one job: make sure the dogfood still walks, still finds, and
 * still runs in CI. A dogfood that quietly stops walking is the same class of
 * failure as a guard that stopped matching.
 */
test("the dogfood walks a generated app and it passes", () => {
  const result = runDogfood();

  assert.equal(result.code, 0, `dogfood failed:\n${result.out}`);
  assert.match(result.out, /✓ dogfood: \d+ checks passed/, result.out);

  // Each walk is a distinct guarantee. Losing one silently would put the whole
  // phase back to zero with a green log.
  //
  // The four below need no dependencies, so they run in the fast path. The
  // slice typecheck and the shipped-test check need `npm install`, and they are
  // asserted separately below with `--full` — otherwise this test would cost
  // 80 seconds and the suite would stop being run.
  for (const step of [
    "create-task",
    "create-feature",
    "every shipped skill runs in the generated app",
    "every relative link in the generated app resolves",
  ]) {
    assert.ok(
      result.out.includes(step),
      `dogfood no longer checks "${step}" — it is the reason this file exists`,
    );
  }
});

test("with dependencies installed, the generated slice compiles and is tested", () => {
  // `--full` costs ~80s and this runs in the unit suite. Asserted here rather
  // than skipped: "create-feature ships a test" was one of the six bugs, and a
  // guard that only runs in CI is a guard nobody runs before merging.
  if (!process.env.SDD_DOGFOOD_FULL) {
    return;
  }
  const result = runDogfood(["--full"]);
  assert.equal(result.code, 0, `dogfood --full failed:\n${result.out}`);
  assert.ok(
    result.out.includes("create-feature ships a test"),
    "the full dogfood no longer checks that the generated slice has a test",
  );
  assert.ok(
    result.out.includes("the generated slice typechecks"),
    "the full dogfood no longer checks that the generated slice compiles",
  );
}, { skip: "set SDD_DOGFOOD_FULL=1 to run (≈80s, needs npm install)" });

test("the dogfood runs in CI", () => {
  const ci = fs.readFileSync(CI, "utf8");

  // A check nothing runs is a comment. This is the whole point of the phase.
  assert.match(
    ci,
    /run: node SKILLS\/dogfood\/dogfood\.mjs/,
    "ci.yml does not run the dogfood. The six bugs it found all reached main " +
      "green; without this job the seventh will too.",
  );
});

test("the dogfood reads its gates from PREFLIGHT.md, not from a hardcoded list", () => {
  const source = fs.readFileSync(DOGFOOD, "utf8");

  // If the list were hardcoded here it would drift from the document that tells
  // an agent what to run — and that drift is exactly the failure being guarded.
  assert.match(
    source,
    /preflightGates[\s\S]*readFileSync[\s\S]*PREFLIGHT\.md/,
    "dogfood.mjs does not read PREFLIGHT.md; it is using a hardcoded gate list",
  );

  const gates = /const gates = \[\.\.\.preflight\.matchAll\(\/npm run \(\[\\w:-\]\+\)\/g\)\]/.test(source);
  assert.ok(
    gates,
    "the gate list is not extracted from PREFLIGHT.md with the expected pattern",
  );
});

test("a gate that could not run is reported as skipped, never as passed", () => {
  const source = fs.readFileSync(DOGFOOD, "utf8");

  // Firefox does not launch on the Windows sandbox this was written on. CI runs
  // both browsers. Reporting that as a failure reports the machine as the
  // product, and a red suite that means "the machine" gets ignored.
  assert.match(
    source,
    /skipped:[\s\S]*environment, not app|environment, not app/,
    "dogfood has no way to distinguish an unrunnable gate from a broken app",
  );
  assert.match(
    source,
    /browserType\.launch/,
    "dogfood does not recognise the Playwright browser-startup failure",
  );
});

test("the dogfood is not shipped to a consuming app", () => {
  const constants = fs.readFileSync(path.join(REPO_ROOT, "lib", "constants.mjs"), "utf8");

  // It imports lib/scaffold.mjs, which is deliberately not copied into SDD/.
  // Copied, it dies on import in every generated app — the exact failure the
  // dogfood reports on others.
  assert.match(
    constants,
    /RULE_SKILL_COPY_SKIP[\s\S]*?"dogfood"/,
    "dogfood is not in RULE_SKILL_COPY_SKIP, so it is copied into every app " +
      "where it cannot run",
  );
});
