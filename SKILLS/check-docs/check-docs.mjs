#!/usr/bin/env node
/**
 * SDD SKILL: check-docs
 * Valida que todo link relativo entre documentos markdown resolve.
 *
 * Uso: node SDD/SKILLS/check-docs/check-docs.mjs [raiz]
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
 * `template/` é excluído de propósito: o README dele aponta para `./SDD/...`,
 * que só existe DEPOIS do scaffold. Validar aqui daria falso positivo.
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
    const target = path.resolve(path.dirname(file), m[1]);
    if (!fs.existsSync(target)) broken.push(`  ${path.relative(root, file)} -> ${m[1]}`);
  }
}

if (broken.length) {
  console.error(`\n✖ ${broken.length} link(s) quebrado(s):\n${broken.join("\n")}\n`);
  process.exit(1);
}
console.log(`✓ ${files.length} documentos, todos os links relativos resolvem.`);
