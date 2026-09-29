#!/usr/bin/env node
/**
 * SDD SKILL: instala o core de regras (SDD/) em um projeto EXISTENTE
 * como git submodule, e cria os atalhos na raiz apontando para ./SDD/AGENTS.md
 *
 * Uso:
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs [caminho-do-projeto]
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs            # usa cwd
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs . --copy   # copia em vez de submodule
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const REPO_URL = "https://github.com/marcelinosandroni/sdd-ai-stack.git";
const SDD_DIR = "SDD";

const RULE_FILES = [
  "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md",
  "DESIGN.md", "NEXT.md", "NODE.md", "REACT.md",
];
const RULE_DIRS = ["stacks", "specs", "docs", "SKILLS"];
const SHORTCUTS = [
  "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules",
  ".windsurfrules", ".github/copilot-instructions.md", ".clinerules",
];

const STUB = `# 🤖 AGENTS.md (ponteiro)

> A fonte da verdade vive em **[SDD/AGENTS.md](./SDD/AGENTS.md)**.

\`\`\`bash
cat SDD/AGENTS.md          # leis + fluxo (LEIA PRIMEIRO)
cat SDD/specs/PLAN.md      # a task AGORA
cat SDD/NEXT.md            # regras da stack
\`\`\`

> **Não edite \`SDD/\`** sem pedir ao humano.
> Atualize com: \`git submodule update --remote --merge SDD\`
`;

const log = (m) => console.log(m);
const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: "inherit" });
const has = (cmd) => { try { execFileSync(cmd, ["--version"], { stdio: "ignore" }); return true; } catch { return false; } };

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const s = path.join(from, e.name), d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.isFile()) fs.copyFileSync(s, d);
  }
}

function installShortcuts(root) {
  for (const rel of SHORTCUTS) {
    const p = path.join(root, rel);
    if (fs.existsSync(p)) { log(`  = ${rel} (já existe, preservado)`); continue; }
    fs.mkdirSync(path.dirname(p), { recursive: true });
    try {
      fs.symlinkSync("SDD/AGENTS.md", p, "file");
      log(`  ✓ ${rel} (symlink)`);
    } catch {
      fs.writeFileSync(p, STUB, "utf8");
      log(`  ✓ ${rel} (stub)`);
    }
  }
}

function installRulesLocally(root) {
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const source = path.resolve(here, "..", "..");
  const dest = path.join(root, SDD_DIR);
  fs.mkdirSync(dest, { recursive: true });
  for (const f of RULE_FILES) {
    const s = path.join(source, f);
    if (fs.existsSync(s)) { fs.copyFileSync(s, path.join(dest, f)); log(`  ✓ SDD/${f}`); }
  }
  for (const d of RULE_DIRS) {
    const s = path.join(source, d);
    if (fs.existsSync(s)) { copyDir(s, path.join(dest, d)); log(`  ✓ SDD/${d}/`); }
  }
  return dest;
}

const args = process.argv.slice(2);
const useCopy = args.includes("--copy");
const target = path.resolve(process.cwd(), args.find((a) => !a.startsWith("-")) ?? ".");

log(`\n🤖 Instalando o core SDD em: ${target}\n`);

if (!fs.existsSync(target)) { console.error("✖ Pasta não existe."); process.exit(1); }

if (useCopy) {
  log("📋 Modo: cópia local");
  installRulesLocally(target);
  installShortcuts(target);
} else {
  if (!has("git")) { console.error("✖ git não encontrado. Use --copy."); process.exit(1); }
  if (fs.existsSync(path.join(target, ".git")) === false) {
    log("! Projeto não é um repositório git. Rode 'git init' antes ou use --copy.");
    process.exit(1);
  }
  log(`🔗 Modo: git submodule → ${REPO_URL}`);
  sh("git", ["submodule", "add", REPO_URL, SDD_DIR], target);
  installShortcuts(target);
}

log(`
✅ Pronto.

Leia agora:
  cat ${SDD_DIR}/AGENTS.md
  cat ${SDD_DIR}/specs/PLAN.md

Atualizar regras depois:
  git submodule update --remote --merge ${SDD_DIR}
`);
