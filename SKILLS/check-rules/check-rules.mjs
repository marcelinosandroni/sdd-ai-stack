#!/usr/bin/env node
/**
 * check-rules — makes the written rules executable.
 *
 * The rules in stacks/*.md are prose. Prose is not a control: an agent reads
 * `language.md`, writes Portuguese, and the CI is green anyway. This script
 * turns the load-bearing rules into checks.
 *
 * It runs against:
 *   • the generated app (does the template obey the template's own rules?)
 *   • this repository (does the source obey them too?)
 *
 * Every finding names the rule it comes from, so a failure is actionable
 * without opening the docs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const findings = [];
function report(rule, file, message) {
  findings.push({ rule, file, message });
}

const SKIP_DIRS = new Set([
  "node_modules", ".next", "out", ".git", "coverage", "test-results",
  "playwright-report", ".sandbox", "SDD", "dist", ".vercel",
]);

function walk(root, { extensions = null, onFile } = {}) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walk(full, { extensions, onFile });
    } else if (entry.isFile()) {
      if (extensions && !extensions.some((ext) => entry.name.endsWith(ext))) continue;
      onFile(full);
    }
  }
}

const rel = (p) => path.relative(PKG_ROOT, p).split(path.sep).join("/");

/* ════════════════════════════════════════════════════════════
   RULE 1 — language.md §1: English in the repository
   Code, error strings, test names. Not identifiers, not UI copy
   shown to a Brazilian user.
   ════════════════════════════════════════════════════════════ */

// High-signal Portuguese words that never appear in English code. Deliberately
// conservative: a false positive costs more than a missed noun.
const PT_IN_CODE = [
  /\bN[ãa]o foi possível\b/,
  /\bTente novamente\b/,
  /\bVoc[êe]\b/,
  /\bRecurso n[ãa]o encontrado\b/,
  /\bVoltar ao in[íi]cio\b/,
  /\bseu usu[áa]rio\b/,
  /\bn[ãa]o commit/i,
  /\balterar\b/,
  /\barquivo\b/,
  /\bc[óo]digo\b/,
  /\bconfigura[çc][ãa]o\b/,
  /\bvalida[çc][ãa]o\b/,
  /\bimplementa[çc][ãa]o\b/,
];

const CODE_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js", ".css"];

function checkEnglish(root, { includeMarkdown = false } = {}) {
  const extensions = includeMarkdown ? [...CODE_EXTENSIONS, ".md"] : CODE_EXTENSIONS;
  walk(root, {
    extensions,
    onFile(file) {
      const text = fs.readFileSync(file, "utf8");
      for (const pattern of PT_IN_CODE) {
        const match = pattern.exec(text);
        if (match) {
          const line = text.slice(0, match.index).split("\n").length;
          report("language.md §1", rel(file), `line ${line}: "${match[0]}" — English by default`);
        }
      }
    },
  });
}

/* ════════════════════════════════════════════════════════════
   RULE 2 — git.md §1: never hardcode somebody else's identity
   ════════════════════════════════════════════════════════════ */

const FOREIGN_IDENTITY = /user\.name=[^"'\s]+\s+[A-Z][a-z]+/;

function checkIdentity(root) {
  walk(root, {
    extensions: CODE_EXTENSIONS,
    onFile(file) {
      const text = fs.readFileSync(file, "utf8");
      // The library quoting its own doc comment is fine; committing with it is not.
      const lines = text.split("\n");
      lines.forEach((line, i) => {
        const isComment = /^\s*(\/\/|\*|\/\*)/.test(line);
        if (isComment) return;
        if (/user\.name=/.test(line) && FOREIGN_IDENTITY.test(line)) {
          report("git.md §1", rel(file), `line ${i + 1}: hardcoded identity in a run() argument`);
        }
      });
    },
  });
}

/* ════════════════════════════════════════════════════════════
   RULE 3 — no personal identity in the rules that ship to users
   ════════════════════════════════════════════════════════════ */

// The name is assembled from fragments so this script does not trip its own
// check when it runs against a generated app.
const AUTHOR = ["Marcelino", "Sandroni"].join(" ");

const PERSONAL = [
  new RegExp(`The (?:dev|developer) \\(${AUTHOR}\\)`, "i"),
  new RegExp(`Fixed identity.{0,20}${AUTHOR}`, "i"),
  new RegExp(`${AUTHOR.replace(".", "\\.")} <`, "i"),
];

function checkNoPersonalName(root) {
  const rulesRoot = path.join(root, "SDD");
  if (!fs.existsSync(rulesRoot)) return;
  walk(rulesRoot, {
    extensions: [".md", ".mjs", ".sh"],
    onFile(file) {
      const text = fs.readFileSync(file, "utf8");
      for (const pattern of PERSONAL) {
        if (pattern.test(text)) {
          report(
            "git.md §1 / language.md §1",
            rel(file),
            "the template's own name is hardcoded; the rules ship to every consumer",
          );
        }
      }
    },
  });
}

/* ════════════════════════════════════════════════════════════
   RULE 4 — AGENTS.md §4: never install at the root of a
   generated app. Detects the rule contradicting the layout.
   ════════════════════════════════════════════════════════════ */

function checkInstallRule(appRoot) {
  const agents = path.join(appRoot, "SDD", "AGENTS.md");
  if (!fs.existsSync(agents)) return;
  const text = fs.readFileSync(agents, "utf8");
  if (/NEVER[^.]*npm install[^.]*root/i.test(text)) {
    report(
      "AGENTS.md §4",
      rel(agents),
      "says never to install at the root, but in a generated app the root IS the project",
    );
  }
}

/* ════════════════════════════════════════════════════════════
   RULE 5 — testing.md: the pyramid must be representable
   ════════════════════════════════════════════════════════════ */

function checkTestLayout(appRoot) {
  const testing = path.join(appRoot, "SDD", "stacks", "testing.md");
  if (!fs.existsSync(testing)) return;
  const text = fs.readFileSync(testing, "utf8");
  const required = ["unit", "e2e"];
  for (const layer of required) {
    if (!fs.existsSync(path.join(appRoot, "tests", layer))) {
      report("testing.md", rel(path.join(appRoot, "tests", layer)), "the rules name this test layer");
    }
  }
  // The rule text itself must not tell the agent to run a watch-mode command
  // as if it were a gate.
  if (/npm run test:unit\b(?!.*--run|.*watch)/.test(text) && !/watch/i.test(text)) {
    report("testing.md", rel(testing), "documents a watch command without saying it is a watch");
  }
}

/* ════════════════════════════════════════════════════════════
   RULE 6 — every command the docs tell the agent to run must
   exist in package.json
   ════════════════════════════════════════════════════════════ */

function checkCommandsExist(appRoot) {
  const pkgPath = path.join(appRoot, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const appScripts = new Set(Object.keys(JSON.parse(fs.readFileSync(pkgPath, "utf8")).scripts ?? {}));

  // The rules legitimately mention the CLI repo's own scripts too (the guard
  // that checks the rules is one of them). A command is only wrong if it
  // exists in NEITHER package.
  const cliScripts = new Set(
    Object.keys(JSON.parse(fs.readFileSync(path.join(PKG_ROOT, "package.json"), "utf8")).scripts ?? {}),
  );

  const docs = ["AGENTS.md", "specs/PLAN.md", "specs/tasks/TASK_TEMPLATE.md"];
  for (const doc of docs) {
    const full = path.join(appRoot, "SDD", doc);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const match of text.matchAll(/npm run ([\w:-]+)/g)) {
      const script = match[1];
      if (!appScripts.has(script) && !cliScripts.has(script)) {
        report(
          "AGENTS.md §4",
          rel(full),
          `runs "npm run ${script}" but no package.json in this project defines it`,
        );
      }
    }
  }
}

/* ════════════════════════════════════════════════════════════
   RULE 8 — PRODUCT.md §"What we deliberately do NOT deliver":
   the app ships the gates it claims to ship, and says so.

   This template deliberately does NOT deliver turnkey CI/CD. That is a
   decision, not an omission, and a decision that is invisible in the generated
   app is indistinguishable from forgetting.

   So the generated app must:
     • run every gate the rules tell an agent to run — a rule naming a command
       that does not exist is a rule the agent cannot obey
     • say in its own README that it has no CI, and where the rules for it are

   The second half is the one that matters. The gates are in package.json
   whether or not anyone runs them; the README is what makes the absence a
   choice instead of a gap.
   ════════════════════════════════════════════════════════════ */

const REQUIRED_APP_SCRIPTS = ["typecheck", "lint", "test", "build"];

function checkAppIsShippable(appRoot) {
  const pkgPath = path.join(appRoot, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const scripts = Object.keys(pkg.scripts ?? {});

  for (const script of REQUIRED_APP_SCRIPTS) {
    if (!scripts.includes(script)) {
      report(
        "PRODUCT.md §what we do NOT deliver",
        rel(pkgPath),
        `has no "${script}" script. The rules tell an agent to run it before ` +
          `every commit, so without it the first instruction is already ` +
          `unobeyable.`,
      );
    }
  }

  // The absence of CI must be stated, or it reads as an oversight.
  const readme = path.join(appRoot, "README.md");
  if (!fs.existsSync(readme)) return;

  const text = fs.readFileSync(readme, "utf8");
  const mentionsCI = /GitHub Actions|\.github\/workflows|workflow/i.test(text);
  if (!mentionsCI) {
    report(
      "PRODUCT.md §what we do NOT deliver",
      rel(readme),
      "does not mention CI at all. This template ships no workflow on purpose; " +
        "the generated app should say so and point at SDD/stacks/ci.md, or the " +
        "absence reads like an oversight rather than a decision.",
    );
  }
}

/* ════════════════════════════════════════════════════════════
   RULE 7 — DESIGN.md and the tokens must agree
   ════════════════════════════════════════════════════════════ */

const HEX = /#[0-9a-fA-F]{6}/g;

function checkTokensAgree(repoRoot) {
  const designPath = path.join(repoRoot, "DESIGN.md");
  const cssPath = path.join(repoRoot, "template", "next", "src", "app", "globals.css");
  if (!fs.existsSync(designPath) || !fs.existsSync(cssPath)) return;

  const design = new Map();
  for (const line of fs.readFileSync(designPath, "utf8").split("\n")) {
    const match = /^\|\s*`([a-z-]+)`\s*\|\s*`(#[0-9A-F]{6})`/i.exec(line);
    if (match) design.set(match[1], match[2].toLowerCase());
  }

  const css = fs.readFileSync(cssPath, "utf8");
  const fromCss = new Map();
  for (const match of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/g)) {
    fromCss.set(match[1], match[2].toLowerCase());
  }

  // The token names are not identical between the two files by design, so only
  // compare the ones whose name matches exactly — a mismatch there is a typo.
  for (const [name, value] of fromCss) {
    if (!design.has(name)) continue;
    if (design.get(name) !== value) {
      report(
        "DESIGN.md §2",
        rel(cssPath),
        `--color-${name} is ${value} but DESIGN.md documents ${design.get(name)}`,
      );
    }
  }
}


/* ════════════════════════════════════════════════════════════
   RUN
   ════════════════════════════════════════════════════════════ */

const target = process.argv[2] ? path.resolve(process.argv[2]) : PKG_ROOT;
const isGeneratedApp = fs.existsSync(path.join(target, "SDD", "AGENTS.md"));

// The library and its template source: English, no personal identity.
checkEnglish(path.join(PKG_ROOT, "lib"));
checkEnglish(path.join(PKG_ROOT, "bin"));
checkEnglish(path.join(PKG_ROOT, "SKILLS"), { includeMarkdown: false });
checkIdentity(PKG_ROOT);
checkTokensAgree(PKG_ROOT);

if (isGeneratedApp) {
  // A generated app: the template must obey the rules it ships.
  checkEnglish(path.join(target, "src"));
  checkEnglish(path.join(target, "tests"), { includeMarkdown: false });
  checkNoPersonalName(target);
  checkInstallRule(target);
  checkTestLayout(target);
  checkCommandsExist(target);
  checkAppIsShippable(target);
} else {
  // This repository: the rules themselves must not carry the author's name.
  checkNoPersonalName(PKG_ROOT);
}

if (findings.length === 0) {
  console.log("✓ check-rules: no violation found.");
  process.exit(0);
}

const byRule = new Map();
for (const finding of findings) {
  if (!byRule.has(finding.rule)) byRule.set(finding.rule, []);
  byRule.get(finding.rule).push(finding);
}

console.error(`✖ check-rules: ${findings.length} violation(s).\n`);
for (const [rule, items] of byRule) {
  console.error(`  ${rule}`);
  for (const item of items) {
    console.error(`    ${item.file} — ${item.message}`);
  }
  console.error("");
}
process.exit(1);
