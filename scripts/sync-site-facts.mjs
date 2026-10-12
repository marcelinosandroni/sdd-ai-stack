#!/usr/bin/env node
/**
 * Copy the facts the site commits into `site/src/content.ts`.
 *
 *   node scripts/sync-site-facts.mjs          # write
 *   node scripts/sync-site-facts.mjs --check  # exit 1 if stale
 *
 * The site is deployed with `site/` as its Vercel root, so it cannot read the
 * repository at build time — neither `package.json` nor `stacks/`. An import would
 * fail the deploy rather than the test. So these values are committed, this script
 * writes them, and a guard asserts them.
 *
 * That is not a workaround for the constraint, it is the constraint's only honest
 * arrangement. Anything derived — and the version was `v0.2.0` while npm sat at
 * `0.6.0`, which is the failure this repository exists to prevent, on the page whose
 * whole argument is "this tool verifies what it states".
 *
 * Two facts, for the same reason:
 *
 *   VERSION      the published version, from package.json
 *   STACK_COUNT  the language and framework stacks, from STACK_DOCS in lib/constants
 *
 * STACK_COUNT is derived from a list, not by globbing `stacks/`. Everything in that
 * folder is a rule file, but only twelve of them are stacks: `typescript` is a
 * language the others assume, `tailwind` and `shadcn` are libraries a project may
 * never use, and `testing` applies to all of them. Counting the folder would say 25
 * stacks and mean it. The classification lives in `lib/constants.mjs` where the
 * scaffold already keeps its own facts, and `tests/stack-counts.test.mjs` asserts the
 * classification covers the folder exactly — so a new rule file cannot be added
 * without deciding what it is, and "12" cannot rot into 13.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { STACK_DOCS } from "../lib/constants.mjs";

// `scripts/` sits directly under the repository root, so one level up is the root.
// Two levels up lands in the PARENT directory, which is how the first version of this
// script read a `package.json` one directory too high — and the guard caught it on its
// first run, which is the whole reason the guard exists.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "site", "src", "content.ts");
const PACKAGE = path.join(ROOT, "package.json");

const CHECK_ONLY = process.argv.includes("--check");

/**
 * Each fact, with the exact line the sync writes and the guard parses.
 *
 * `shape` is not decoration: the parsers are regexes over this file, so a rewritten
 * declaration that keeps the value but changes the shape breaks both at once, with an
 * error that says nothing about which of the two broke. It is checked instead.
 */
const FACTS = [
  {
    name: "VERSION",
    pattern: /^export const VERSION = "([^"]+)";$/m,
    read: () => JSON.parse(fs.readFileSync(PACKAGE, "utf8")).version,
    line: (value) => `export const VERSION = "${value}";`,
    // 0.7.0 shipped with a stale version and nobody could tell from the output.
    stale: (declared, actual) => `site says v${declared}, package.json says ${actual}`,
  },
  {
    name: "STACK_COUNT",
    pattern: /^export const STACK_COUNT = (\d+);$/m,
    read: () => String(STACK_DOCS.length),
    line: (value) => `export const STACK_COUNT = ${value};`,
    stale: (declared, actual) =>
      `site says ${declared} stacks, STACK_DOCS lists ${actual}`,
  },
];

let source = fs.readFileSync(CONTENT, "utf8");
const stale = [];
const written = [];

for (const fact of FACTS) {
  const declared = fact.pattern.exec(source)?.[1];

  if (declared === undefined) {
    console.error(`✖ site/src/content.ts has no \`export const ${fact.name} = …;\` line.`);
    console.error("  Add it back in this exact shape — the sync and the guard both parse it.");
    process.exit(1);
  }

  const actual = fact.read();

  if (declared === actual) {
    console.log(`✓ ${fact.name.padEnd(11)} ${actual}`);
    continue;
  }

  if (CHECK_ONLY) {
    stale.push(`  ${fact.name}: ${fact.stale(declared, actual)}`);
    continue;
  }

  source = source.replace(fact.pattern, fact.line(actual));
  written.push(`  ${fact.name}: ${declared} → ${actual}`);
}

if (stale.length > 0) {
  console.error("✖ site/src/content.ts is out of date:");
  console.error(stale.join("\n"));
  console.error("  Fix it with: npm run site:sync");
  process.exit(1);
}

if (written.length > 0) {
  fs.writeFileSync(CONTENT, source, "utf8");
  console.log("✓ wrote:\n" + written.join("\n"));
}