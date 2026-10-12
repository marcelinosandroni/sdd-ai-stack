#!/usr/bin/env node
/**
 * Copy the published version from `package.json` into the site.
 *
 * The site is deployed with `site/` as its Vercel root, so it cannot import the
 * repository's `package.json` at build time — it is not in that build context. So the
 * version is committed, and this script keeps it honest.
 *
 * It existed because the page said `v0.2.0` while npm was already at `0.6.0`: a
 * marketing page that lies about its own version on the very page whose argument is
 * "this tool verifies what it states". A guard now fails the build when the two drift,
 * and this is the command that fixes it.
 *
 *   node scripts/sync-version.mjs          # write
 *   node scripts/sync-version.mjs --check  # exit 1 if stale
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// `scripts/` sits directly under the repository root, so one level up is the root.
// Two levels up lands in the PARENT directory, which is how the first version of this
// script read a `package.json` one directory too high — and the guard caught it on
// its first run, which is the whole reason the guard exists.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "site", "src", "content.ts");
const PACKAGE = path.join(ROOT, "package.json");

const DECLARATION = /^export const VERSION = "([^"]+)";$/m;

const version = JSON.parse(fs.readFileSync(PACKAGE, "utf8")).version;
const current = fs.readFileSync(CONTENT, "utf8");
const match = DECLARATION.exec(current);

if (!match) {
  console.error("✖ site/src/content.ts has no `export const VERSION = \"…\";` line.");
  console.error("  Add it back in this exact shape — the sync and the guard both parse it.");
  process.exit(1);
}

if (match[1] === version) {
  console.log(`✓ site version is ${version}`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  console.error(`✖ site says v${match[1]}, package.json says ${version}.`);
  console.error("  Fix it with: npm run version:sync");
  process.exit(1);
}

fs.writeFileSync(
  CONTENT,
  current.replace(DECLARATION, `export const VERSION = "${version}";`),
  "utf8",
);
console.log(`✓ site version ${match[1]} → ${version}`);