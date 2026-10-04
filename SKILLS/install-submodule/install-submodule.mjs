#!/usr/bin/env node
/**
 * SDD SKILL: installs the rules core (SDD/) into an EXISTING project as a git
 * submodule, and creates the root shortcuts pointing at ./SDD/AGENTS.md
 *
 * Usage:
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs [project-path]
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs            # uses cwd
 *   node SDD/SKILLS/install-submodule/install-submodule.mjs . --copy   # copies instead of a submodule
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const REPO_URL = "https://github.com/marcelinosandroni/sdd-ai-stack.git";
const SDD_DIR = "SDD";

const RULE_FILES = [
  "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md",
  "DESIGN.md", "stacks/next.md", "stacks/node.md", "stacks/react.md",
];
const RULE_DIRS = ["stacks", "specs", "docs", "SKILLS"];
const SHORTCUTS = [
  "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules",
  ".windsurfrules", ".github/copilot-instructions.md", ".clinerules",
];

const STUB = `# 🤖 AGENTS.md (pointer)

> The source of truth lives in **[SDD/AGENTS.md](./SDD/AGENTS.md)**.

\`\`\`bash
cat SDD/AGENTS.md          # laws + flow (READ FIRST)
cat SDD/specs/PLAN.md      # the task RIGHT NOW
cat SDD/stacks/next.md            # the stack rules
\`\`\`

> **Do not edit \`SDD/\`** without asking the human.
> To update: \`git submodule update --remote --merge SDD\`
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
    if (fs.existsSync(p)) { log(`  = ${rel} (already exists, preserved)`); continue; }
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

log(`\n🤖 Installing the SDD core in: ${target}\n`);

if (!fs.existsSync(target)) { console.error("✖ Folder does not exist."); process.exit(1); }

if (useCopy) {
  log("📋 Mode: local copy");
  installRulesLocally(target);
  installShortcuts(target);
} else {
  if (!has("git")) { console.error("✖ git not found. Use --copy."); process.exit(1); }
  if (fs.existsSync(path.join(target, ".git")) === false) {
    log("! The project is not a git repository. Run 'git init' first, or use --copy.");
    process.exit(1);
  }
  log(`🔗 Mode: git submodule → ${REPO_URL}`);
  sh("git", ["submodule", "add", REPO_URL, SDD_DIR], target);
  installShortcuts(target);
}

log(`
✅ Done.

Read now:
  cat ${SDD_DIR}/AGENTS.md
  cat ${SDD_DIR}/specs/PLAN.md

Update the rules later:
  git submodule update --remote --merge ${SDD_DIR}
`);
