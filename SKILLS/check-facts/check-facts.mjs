#!/usr/bin/env node
/**
 * check-facts — stops the documentation from misstating what is verifiable.
 *
 * `docs/PRODUCT.md` claimed the CLI had 27 tests while the suite had 79. Every
 * number was green, because a number in prose is not a check.
 *
 * The cost was never the wrong number. It is that a document which misstates a
 * fact it *could have verified* teaches an agent to trust no document — and an
 * agent that catches one bad number stops reading the rules. That is the exact
 * failure this template exists to prevent, committed by the template itself.
 *
 * So the facts become checks. Each is recomputed from the repository and
 * compared with what the document claims.
 *
 * Counting is static. Running the suite from inside a check is a trap: `node
 * --test` refuses to recurse inside a test file, and the suite mutates the
 * working tree while it runs. A guard that cannot run inside the guard is not a
 * guard, so the count is read from the source instead.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Count `test(` declarations across `tests/*.test.mjs`.
 *
 * This is the count `npm test` reports for these files, because the Node runner
 * executes one top-level `test()` per declaration and the suite has no nested
 * or dynamic test generation. If that ever stops being true the count drifts,
 * and it drifts in the direction a reader would not notice — which is exactly
 * why `npm run check:facts` is verified against a real run in CI:
 * `tests/check-facts-contract.test.mjs` asserts the two agree.
 */
function testCount() {
  let total = 0;
  for (const file of fs.readdirSync(path.join(ROOT, "tests"))) {
    if (!file.endsWith(".test.mjs")) continue;
    const txt = fs.readFileSync(path.join(ROOT, "tests", file), "utf8");
    total += (txt.match(/^test\(/gm) ?? []).length;
  }
  return total;
}

/**
 * Count markdown the way check-docs does, so the two never disagree.
 *
 * `template/` is skipped for the same reason check-docs skips it: the template's
 * own README links to `./SDD/…`, which only exists after scaffolding. Counting
 * it would make this script report a number no other tool reports, and two tools
 * disagreeing about "how many documents" is worse than either being wrong.
 */
function docCount() {
  const skip = new Set([
    "node_modules", ".next", "out", ".git", "coverage", "test-results",
    "playwright-report", ".sandbox", "SDD", "dist", ".vercel", "template",
  ]);
  let n = 0;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".md")) n += 1;
    }
  })(ROOT);
  return n;
}

/**
 * Count the essential files the release workflow requires in the tarball.
 *
 * A better fact than the test count: it is a list of paths that must exist for
 * `npx create-sdd-ai-stack` to work at all, it is written down in exactly one
 * place, and it changes only when the package's shape changes — not every time
 * someone adds a test. A fact that churns is a fact people stop reading.
 */
function essentialCount() {
  const workflow = fs.readFileSync(
    path.join(ROOT, ".github", "workflows", "release.yml"),
    "utf8",
  );
  const m = /for f in ((?:"[^"]+"\s*\\?\s*)+); do/.exec(workflow);
  if (m === null) return null;
  return (m[1].match(/"[^"]+"/g) ?? []).length;
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

/**
 * Blanks out the places a number is quoted rather than asserted, so the
 * patterns below only ever see claims.
 *
 * Three contexts, each replaced with spaces to keep line numbers intact:
 *   • fenced code blocks — a bash example showing output
 *   • backticked spans — a number quoted inside a sentence about numbers
 *   • `<!-- fact:off -->` … `<!-- fact:on -->` — an explicit escape hatch
 *
 * The hatch exists because `README.md` documents this very bug and has to say
 * "this README claimed 27 tests". Without a way to write that sentence
 * honestly, it gets deleted and the check quietly stops being worth running.
 */
function unclaim(text) {
  return text
    .replace(/```[\s\S]*?```/g, (b) => b.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (s) => s.replace(/[^\n]/g, " "))
    .replace(/<!--\s*fact:off\s*-->[\s\S]*?<!--\s*fact:on\s*-->/g, (b) =>
      b.replace(/[^\n]/g, " "),
    );
}

const DOCS = ["README.md", "docs/PRODUCT.md"];
const essentials = essentialCount();

const PATTERNS = [
  { re: /\b(\d+)\s+tests?\b/g, kind: "tests", actual: testCount(), how: "npm test" },
  { re: /\b(\d+)\s+documents?\b/g, kind: "documents", actual: docCount(), how: "npm run check:docs" },
  {
    re: /\b(\d+)\s+essential files\b/g,
    kind: "essential files",
    actual: essentials,
    how: "read the `for f in` list in .github/workflows/release.yml",
  },
].filter((p) => p.actual !== null);

const stale = [];
let checked = 0;

for (const file of DOCS) {
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  const txt = unclaim(read(file));
  for (const { re, kind, actual, how } of PATTERNS) {
    for (const m of txt.matchAll(re)) {
      checked += 1;
      const claimed = Number(m[1]);
      if (claimed !== actual) {
        stale.push({ file, claimed, actual, kind, how });
      }
    }
  }
}

if (stale.length) {
  console.error(`\n✖ ${stale.length} afirmação(ões) verificável(is) fora de data:\n`);
  for (const f of stale) {
    console.error(`  ${f.file}: diz "${f.claimed} ${f.kind}", o repositório tem ${f.actual}`);
    console.error(`    corrija com o número real — rode \`${f.how}\`\n`);
  }
  console.error(
    "Um documento que erra um número que poderia conferir ensina o agente a\n" +
      "desconfiar de todos os documentos. É o problema que este template existe\n" +
      "para resolver.\n",
  );
  process.exit(1);
}

if (checked === 0) {
  console.log("⚠ check-facts: nenhuma afirmação verificável encontrada para conferir.");
  process.exit(0);
}

console.log(`✓ ${checked} afirmação(ões) conferem (${testCount()} testes, ${docCount()} documentos).`);
