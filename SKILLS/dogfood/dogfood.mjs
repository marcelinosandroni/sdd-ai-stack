#!/usr/bin/env node
/**
 * dogfood — generate an app and walk the cycle the rules describe.
 *
 * Everything else in this repository is validated against *this* repository: it
 * has `tests/cli-flags.test.mjs`, its own `package.json`, its own
 * `.github/workflows/release.yml`. A generated app has none of those three.
 *
 * Phase 3 validated the rules by letting an agent follow them here. They were
 * never validated in a project the template *generated*, and the gap was not
 * theoretical:
 *
 *   • `biome.json` pins schema 2.5.14 while `@biomejs/biome` is `^2.0.0`. The
 *     first patch release after the pin breaks `npm run lint` for every new app.
 *   • all four `check-*` skills crash on ENOENT, because they read files that
 *     exist here and nowhere else.
 *   • `TASK_TEMPLATE.md` links `../../DESIGN.md`, two levels up, from a file
 *     three levels deep. No test ever created a `phase-N/` folder here.
 *   • `PREFLIGHT.md` states "6 passed" and "20 passed" — this repository's
 *     counts, shipped inside someone else's project.
 *
 * None of those is visible from the template. All of them are visible from the
 * generated app, which is the only place they exist.
 *
 * ## What it does
 *
 *   1. generates an app into a temp directory
 *   2. runs every gate `PREFLIGHT.md` tells an agent to run
 *   3. runs `create-task` and `create-feature` — the automations an agent calls
 *   4. typechecks the generated slice, because the skill promises it compiles
 *   5. runs every `check-*` the app ships, because shipping a script that
 *      crashes is worse than not shipping it
 *   6. resolves every relative link in the app, because a broken link in the
 *      document an agent reads first teaches it to distrust the rest
 *
 * ## What it deliberately skips
 *
 * `npm install` (~60s) and the E2E suite (~40s plus browser download). Both run in
 * CI.yml against the template already; repeating them here would triple the job
 * to re-prove what the Template job proves. This script is about what a generated
 * app has that the template does not — the rules, the skills, and the automations.
 *
 * `--full` runs everything, for a release check.
 *
 * ## Usage
 *
 *   node SKILLS/dogfood/dogfood.mjs
 *   node SKILLS/dogfood/dogfood.mjs --full      # install + e2e too
 *   node SKILLS/dogfood/dogfood.mjs --keep      # leave the app on disk
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { scaffold } from "../../lib/scaffold.mjs";
import { TEMPLATES } from "../../lib/constants.mjs";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const full = process.argv.includes("--full");
const keep = process.argv.includes("--keep");
const isWindows = process.platform === "win32";

/* ────────────────────────────────────────────────────────────
   Running a command
   ──────────────────────────────────────────────────────────── */

function run(cmd, args, cwd, { timeout = 600_000, shell = isWindows } = {}) {
  try {
    const stdout = execFileSync(cmd, args, {
      cwd,
      encoding: "utf8",
      timeout,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      // Windows shims are .cmd, so the shell is required for `npm`.
      //
      // It is NOT required for `node`, and it breaks there: the interpreter path
      // contains a space ("C:\Program Files\nodejs\node.exe") and a shell splits
      // it. check-facts lost an afternoon to the same thing.
      shell,
    });
    return { code: 0, out: stdout };
  } catch (error) {
    return {
      code: error.status ?? 1,
      out: `${error.stdout ?? ""}${error.stderr ?? ""}`,
    };
  }
}

function npm(cwd, script, { timeout } = {}) {
  return run("npm", ["run", script, "--silent"], cwd, { timeout });
}

/** `node <script>` — no shell, because the interpreter path may contain a space. */
function node(cwd, script, args = [], opts = {}) {
  return run(process.execPath, [script, ...args], cwd, { shell: false, ...opts });
}

/* ────────────────────────────────────────────────────────────
   Findings
   ──────────────────────────────────────────────────────────── */

const findings = [];
const passes = [];
const skipped = [];

function pass(name, detail = "") {
  passes.push({ name, detail });
}

function fail(name, detail, { expected = "" } = {}) {
  findings.push({ name, detail, expected });
}

/**
 * A gate that did not run, with the reason.
 *
 * Printed in its own column so it never reads as a pass. The distinction
 * matters: "the host has no browser" and "the app is broken" are different
 * sentences, and collapsing them is how a red suite gets ignored once.
 */
function consoleSkipped(name, why) {
  skipped.push({ name, why });
  console.log(`  ○ ${name}  — skipped: ${why}`);
}

/* ────────────────────────────────────────────────────────────
   The walk
   ──────────────────────────────────────────────────────────── */

function generateApp(root, template) {
  const result = scaffold({
    target: root,
    template,
    install: false,
    git: false,
    shortcutMode: "stub",
    log: () => {},
  });
  return result;
}

/**
 * Every gate PREFLIGHT.md names, in the order it names them.
 *
 * Read from the generated app's own PREFLIGHT.md rather than a hardcoded list —
 * a list here would drift from the document that tells an agent what to run, and
 * that drift is exactly the failure this script exists to catch.
 */
function preflightGates(appRoot) {
  const preflight = fs.readFileSync(path.join(appRoot, "SDD", "PREFLIGHT.md"), "utf8");
  const gates = [...preflight.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);
  return [...new Set(gates)].filter((s) => !s.includes(":") || s.startsWith("test"));
}

function checkLinks(appRoot) {
  const broken = [];
  const skip = new Set([
    "node_modules",
    ".next",
    ".vite",
    "dist",
    ".git",
    "test-results",
    "playwright-report",
    "blob-report",
  ]);

  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(full);
      } else if (entry.name.endsWith(".md")) {
        const text = fs.readFileSync(full, "utf8")
          .replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, " "));
        for (const [, target] of text.matchAll(/\]\((\.{0,2}\/[^)#\s]+)(?:#[^)]*)?\)/g)) {
          const fromFile = path.resolve(path.dirname(full), target);
          const fromRoot = path.resolve(appRoot, target.replace(/^\.\//, ""));
          if (!fs.existsSync(fromFile) && !fs.existsSync(fromRoot)) {
            broken.push(`${path.relative(appRoot, full)} -> ${target}`);
          }
        }
      }
    }
  })(appRoot);

  return broken;
}

/** A skill is only useful if it runs where it lands. */
function checkSkillsRun(appRoot) {
  const skillsDir = path.join(appRoot, "SDD", "SKILLS");
  if (!fs.existsSync(skillsDir)) return [];

  const broken = [];
  for (const name of fs.readdirSync(skillsDir)) {
    const script = path.join(skillsDir, name, `${name}.mjs`);
    if (!fs.existsSync(script)) continue;

    const result = node(appRoot, script, [], { timeout: 120_000 });
    // A skill may legitimately exit non-zero (check-coverage reports a floor, a
    // check reports violations). What must never happen is a crash — an
    // ENOENT, a stack trace, a module it cannot resolve.
    const crashed =
      /ENOENT|Cannot find module|ReferenceError|TypeError|is not a function/.test(result.out);

    if (crashed) {
      const first = result.out.split("\n").find((l) => /ENOENT|Cannot find module/.test(l));
      broken.push(`SDD/SKILLS/${name} — ${first?.trim() ?? "crashed"}`);
    }
  }
  return broken;
}

/**
 * The evidence block must not state this repository's counts.
 *
 * `PREFLIGHT.md` is copied into every generated app, and it used to say
 * "6 passed" and "20 passed (Chromium + Firefox)" — this repository's numbers,
 * shipped inside someone else's project. A template that hands you a count is a
 * template that hands you a lie you cannot check.
 */
function checkNoBorrowedCounts(appRoot) {
  const preflight = path.join(appRoot, "SDD", "PREFLIGHT.md");
  if (!fs.existsSync(preflight)) return [];

  const text = fs.readFileSync(preflight, "utf8");
  const borrowed = [];
  // A count is borrowed when it is a concrete number offered as something to
  // copy. Placeholders — `N passed` — are what a template should carry.
  //
  // Matched on the number alone, not on the surrounding text: the line reads
  // `- \`npm run test\` → 6 passed (6)`, and anchoring on "test" before it does
  // not survive the backticks. Verified: an anchored version found nothing and
  // passed a file that plainly had a borrowed count in it.
  for (const m of text.matchAll(/(\d+)\s+passed/g)) {
    borrowed.push(`"${m[1]} passed"`);
  }
  return borrowed;
}

/* ────────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────────── */

/**
 * Playwright reports a browser it cannot start as a test failure, so a missing
 * browser is indistinguishable from a broken app. `browserType.launch: spawn
 * UNKNOWN` is the signature — the runner is fine, the host cannot spawn it.
 *
 * Firefox does not launch on this Windows sandbox at all, and CI runs both
 * browsers successfully against the same template. Reporting that as a failing
 * gate would be reporting the machine as the product.
 */
function unavailableBrowsers(out) {
  const launches = (out.match(/browserType\.launch/g) ?? []).length;
  const failures = (out.match(/browserType\.launch: spawn UNKNOWN/g) ?? []).length;
  return launches > 0 && launches === failures;
}

/**
 * Walk one template's whole cycle.
 *
 * Extracted from the top level because the loop below has to run it more than once.
 * A `dogfood` that hardcoded `next` was not "the pipeline, verified" — it was "Next,
 * verified", while the CLI advertised a `--template` flag. Two templates is the
 * number that makes the difference visible.
 */
function walkTemplate(template) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `sdd-dogfood-${template}-`));

  console.log(`\n🐕 dogfood [${template}] — generating an app in ${root}\n`);

  generateApp(root, template);
  console.log("   generated. walking the cycle PREFLIGHT.md describes.\n");

  if (full) {
    const install = run("npm", ["install", "--no-audit", "--no-fund"], root, {
      timeout: 900_000,
    });
    if (install.code === 0) pass(`[${template}] npm install`);
    else fail(`[${template}] npm install`, "failed");
  }

  const hasNodeModules = fs.existsSync(path.join(root, "node_modules"));

  // ── 1. the gates PREFLIGHT.md names ────────────────────────────────────────
  if (hasNodeModules) {
    for (const gate of preflightGates(root)) {
      const result = npm(root, gate);
      if (result.code === 0) {
        pass(`[${template}] npm run ${gate}`);
      } else if (gate.startsWith("test:e2e") && unavailableBrowsers(result.out)) {
        consoleSkipped(
          `[${template}] npm run test:e2e`,
          "the host cannot start a Playwright browser — environment, not app",
        );
      } else {
        fail(`[${template}] npm run ${gate}`, firstMeaningfulLine(result.out));
      }
    }
  } else {
    console.log("   (skipping the gates: --full is needed to install dependencies)\n");
  }

  // ── 2. the automations an agent calls ──────────────────────────────────────
  const createTask = node(
    root,
    path.join(root, "SDD", "SKILLS", "create-task", "create-task.mjs"),
    ["0", "1", "Dogfood slice"],
  );
  if (createTask.code === 0) pass(`[${template}] create-task`);
  else fail(`[${template}] create-task`, firstMeaningfulLine(createTask.out));

  const createFeature = node(
    root,
    path.join(root, "SDD", "SKILLS", "create-feature", "create-feature.mjs"),
    ["dogfood-slice", "Dogfood slice"],
  );
  if (createFeature.code === 0) pass(`[${template}] create-feature`);
  else fail(`[${template}] create-feature`, firstMeaningfulLine(createFeature.out));

  // ── 3. the slice the skill says "COMPILES" ─────────────────────────────────
  //
  // This is the check that exposed the skill as Next-shaped. It only became
  // interesting once a second template existed: `create-feature` emitted a Server
  // Action importing `next/cache` into a Vite app, and this check is what said so.
  if (createFeature.code === 0 && hasNodeModules) {
    const sliceTest = path.join(root, "tests", "unit", "dogfood-slice.test.ts");
    if (!fs.existsSync(sliceTest)) {
      fail(
        `[${template}] create-feature ships a test for the slice it generates`,
        "create-feature produced no tests/unit/dogfood-slice.test.ts, and its own " +
          "output tells the agent to write one. A slice that compiles and cannot be " +
          "tested is a slice nobody will test.",
        { expected: "tests/unit/<slice>.test.ts" },
      );
    } else {
      pass(`[${template}] create-feature ships a test`);
    }

    const typecheck = npm(root, "typecheck");
    if (typecheck.code === 0) pass(`[${template}] the generated slice typechecks`);
    else {
      fail(`[${template}] the generated slice typechecks`, firstMeaningfulLine(typecheck.out));
    }

    const lint = npm(root, "lint");
    if (lint.code === 0) pass(`[${template}] the generated slice lints`);
    else fail(`[${template}] the generated slice lints`, firstMeaningfulLine(lint.out));
  }

  // ── 4. every skill the app ships must run where it lands ───────────────────
  const crashed = checkSkillsRun(root);
  if (crashed.length) {
    fail(
      `[${template}] every shipped skill runs in the generated app`,
      crashed.join("\n     "),
      { expected: "no skill crashes with ENOENT or an unresolvable module" },
    );
  } else {
    pass(`[${template}] every shipped skill runs in the generated app`);
  }

  // ── 5. every relative link in the app resolves ─────────────────────────────
  const brokenLinks = checkLinks(root);
  if (brokenLinks.length) {
    fail(
      `[${template}] every relative link in the generated app resolves`,
      brokenLinks.join("\n     "),
      { expected: "0 dead links" },
    );
  } else {
    pass(`[${template}] every relative link in the generated app resolves`);
  }

  // ── 6. no document states this repository's numbers ────────────────────────
  const borrowed = checkNoBorrowedCounts(root);
  if (borrowed.length) {
    fail(
      `[${template}] no document ships this repository's counts as if they were the app's`,
      borrowed.join("\n     "),
      { expected: "placeholders, or no count at all — the consumer's first run supplies them" },
    );
  } else {
    pass(`[${template}] no document ships this repository's counts as if they were the app's`);
  }

  // ── 7. the theme reached the app, unchanged ────────────────────────────────
  //
  // A second template is only worth having if the design system is genuinely
  // portable. Without this check, "the theme is an asset" stays a claim about a file
  // in this repository while every generated app quietly carries its own copy.
  const canonical = path.join(PKG_ROOT, "themes", "executive", "tokens.css");
  const copy = path.join(root, "src", "app", "theme.css");
  if (fs.existsSync(canonical) && fs.existsSync(copy)) {
    const same =
      fs.readFileSync(canonical, "utf8").trim() === fs.readFileSync(copy, "utf8").trim();
    if (same) {
      pass(`[${template}] the generated app carries the canonical theme`);
    } else {
      fail(
        `[${template}] the generated app carries the canonical theme`,
        "src/app/theme.css differs from themes/executive/tokens.css. Two templates " +
          "sharing one design is the claim; two token files is the counterexample.",
        { expected: "byte-identical to themes/executive/tokens.css" },
      );
    }
  }

  return root;
}

/**
 * Which templates to walk.
 *
 * `TEMPLATES` is the single list, read from the same constant the CLI validates
 * `--template` against. A second hardcoded list here would be a second thing to
 * forget — and its failure is silent: a new template ships, this script keeps testing
 * the old one, and the seam rots behind a green gate.
 */
const requested = process.argv.find((a) => a.startsWith("--templates="))?.split("=")[1];
const startedAt = Date.now();

const toWalk = requested
  ? requested.split(",").map((s) => s.trim()).filter(Boolean)
  : TEMPLATES;

for (const unknown of toWalk.filter((t) => !TEMPLATES.includes(t))) {
  fail(`unknown template: ${unknown}`, `known templates: ${TEMPLATES.join(", ")}`);
}

const roots = [];
for (const template of toWalk) {
  roots.push(walkTemplate(template));
}

// ── report ────────────────────────────────────────────────────────────────
const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

console.log("─".repeat(64));
for (const { name, detail } of passes) {
  console.log(`  ✓ ${name}${detail ? `  ${detail}` : ""}`);
}
console.log("─".repeat(64));

if (findings.length === 0) {
  console.log(
    `\n✓ dogfood: ${passes.length} checks passed across ${toWalk.length} template(s) ` +
      `(${toWalk.join(", ")}) in ${seconds}s.`,
  );
  for (const r of roots) {
    if (!keep) fs.rmSync(r, { recursive: true, force: true });
    if (fs.existsSync(r)) console.log(`  ${r}`);
  }
  console.log();
  process.exit(0);
}

console.error(
  `\n✖ dogfood: ${findings.length} finding(s) across ${toWalk.length} template(s) in ${seconds}s.\n`,
);
for (const f of findings) {
  console.error(`  ${f.name}`);
  if (f.expected) console.error(`    expected: ${f.expected}`);
  console.error(`    got:      ${f.detail}\n`);
}
console.error(
  "Every one of these was green on main in this repository. They exist only\n" +
    "in a generated app, which is the only place they can exist.\n",
);
console.error(`  apps left at: ${roots.join(", ")}\n`);

process.exit(1);

/** First line that is not a progress message. */
function firstMeaningfulLine(out) {
  const line = out
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("npm notice") && !l.startsWith(">") && !l.startsWith("["));
  return line ?? "(no output)";
}
