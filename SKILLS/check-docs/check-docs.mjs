#!/usr/bin/env node
/**
 * SDD SKILL: check-docs
 * Validates that every relative link between markdown documents resolves.
 *
 * Usage: node SDD/SKILLS/check-docs/check-docs.mjs [root]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? path.join(here, "..", ".."));

function stripCodeFences(md) {
  return md.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

/**
 * `template/` is excluded on purpose: its README points at `./SDD/...`, which
 * only exists AFTER the scaffold. Validating it here would be a false positive.
 */
function collectMarkdown(dir) {
  const files = [];
  (function walk(p) {
    if (!fs.existsSync(p)) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      const segs = p.split(/[\\/]/);
      if (segs.some((s) => ["node_modules", ".next", "template", "test-results", "playwright-report"].includes(s))) return;
      for (const e of fs.readdirSync(p)) walk(path.join(p, e));
    } else if (/\.md$/.test(p)) {
      files.push(p);
    }
  })(dir);
  return files;
}

const files = collectMarkdown(root);

const broken = [];
const re = /\]\((\.{0,2}\/[^)#\s]+)(?:#[^)]*)?\)/g;

for (const file of files) {
  const txt = stripCodeFences(fs.readFileSync(file, "utf8"));
  for (const m of txt.matchAll(re)) {
    const target = m[1];

    // Relative to the document, which is what Markdown means.
    const fromFile = path.resolve(path.dirname(file), target);

    // Or relative to the project root. A shortcut in `.github/` or a stub at
    // the top level says `./SDD/AGENTS.md` meaning "the SDD folder of this
    // project", and resolving it from `.github/` yields `.github/SDD/…`, which
    // does not exist. Those files are read by tools that never leave the repo
    // root, so the root-relative reading is the one their readers apply.
    const fromRoot = path.resolve(root, target.replace(/^\.\//, ""));

    if (!fs.existsSync(fromFile) && !fs.existsSync(fromRoot)) {
      broken.push(`  ${path.relative(root, file)} -> ${target}`);
    }
  }
}

if (broken.length) {
  console.error(`\n✖ ${broken.length} broken link(s):\n${broken.join("\n")}\n`);
  process.exit(1);
}
console.log(`✓ ${files.length} documents, every relative link resolves.`);

