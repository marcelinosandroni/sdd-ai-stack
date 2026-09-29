import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  COPY_IGNORE,
  PKG_ROOT,
  RULE_DIRS,
  RULE_FILES,
  SDD_DIR,
  SHORTCUTS,
} from "./constants.mjs";

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function copyDir(from, to, { ignore = new Set() } = {}) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest, { ignore });
    } else if (entry.isFile()) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    }
  }
}

/** Cria symlink relativo. Retorna "symlink" ou null se o SO não permitir. */
function trySymlink(targetAbs, linkPath) {
  const rel = path.relative(path.dirname(linkPath), targetAbs).split(path.sep).join("/");
  try {
    fs.symlinkSync(rel, linkPath, "file");
    return "symlink";
  } catch {
    return null;
  }
}

const STUB_BODY = `# 🤖 AGENTS.md (ponteiro)

> Este arquivo é um **atalho** para as regras do projeto.
> A fonte da verdade vive em **[SDD/AGENTS.md](./SDD/AGENTS.md)**.

## 🚨 LEIA AGORA

\`\`\`bash
cat SDD/AGENTS.md
\`\`\`

**Leitura mínima obrigatória para começar qualquer tarefa:**

1. \`SDD/AGENTS.md\` — leis do agente e fluxo de entrega
2. \`SDD/specs/PLAN.md\` — a task que está sendo feita AGORA
3. \`SDD/APP.md\` + \`SDD/APP-STACK.md\` — o que é este app e qual a stack
4. O doc de regra da stack: \`SDD/NEXT.md\` (padrão), \`SDD/NODE.md\`, \`SDD/REACT.md\`
5. \`SDD/DESIGN.md\` — só se for mexer em UI
6. \`SDD/stacks/README.md\` — índice das regras por ferramenta

> **Não edite os arquivos em \`SDD/\`** sem pedir ao humano. Eles são a lei do template.
> Para atualizar: \`git submodule update --remote --merge SDD\` (se submodule) ou \`npm run sdd:sync\`.
`;

function writeShortcut(root, relPath, mode) {
  const linkPath = path.join(root, relPath);
  // caminho ABSOLUTO do destino — path.relative() exige isso,
  // senão o segundo argumento é resolvido contra process.cwd() e o link nasce quebrado
  const targetAbs = path.join(root, SDD_DIR, "AGENTS.md");
  ensureDir(path.dirname(linkPath));

  if (fs.existsSync(linkPath)) return "skipped";
  if (mode === "stub") return writeStub(linkPath);

  return trySymlink(targetAbs, linkPath) ?? writeStub(linkPath);
}

function writeStub(linkPath) {
  fs.writeFileSync(linkPath, STUB_BODY, "utf8");
  return "stub";
}

function run(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

function has(cmd) {
  try {
    execFileSync(cmd, ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
    return true;
  } catch {
    return false;
  }
}

/* ────────────────────────────────────────────────────────────
   Installers
   ──────────────────────────────────────────────────────────── */

/** Copia as regras do template para <target>/SDD/ */
export function installRules(target, { log = () => {} } = {}) {
  const dest = path.join(target, SDD_DIR);
  ensureDir(dest);

  for (const file of RULE_FILES) {
    const src = path.join(PKG_ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(dest, file));
      log(`  ✓ SDD/${file}`);
    }
  }

  for (const dir of RULE_DIRS) {
    const src = path.join(PKG_ROOT, dir);
    if (!fs.existsSync(src)) continue;
    copyDir(src, path.join(dest, dir), { ignore: COPY_IGNORE });
    log(`  ✓ SDD/${dir}/`);
  }

  return dest;
}

/** Instala a pasta SDD/ como git submodule apontando para o repo remoto. */
export function installSubmodule(target, url, { log = () => {} } = {}) {
  const dest = path.join(target, SDD_DIR);
  if (!has("git")) {
    log("  ! git não encontrado. Copiando as regras localmente.");
    return installRules(target, { log });
  }
  ensureDir(target);
  run("git", ["submodule", "add", url, SDD_DIR], target);
  installShortcuts(target, { log });
  return dest;
}

/** Cria os atalhos na raiz do projeto apontando para ./SDD/AGENTS.md */
export function installShortcuts(target, { log = () => {}, mode = "auto" } = {}) {
  const results = SHORTCUTS.map((rel) => ({ rel, kind: writeShortcut(target, rel, mode) }));
  for (const { rel, kind } of results) {
    log(`  ✓ ${rel} (${kind})`);
  }
  return results;
}

/** Copia o template de projeto (Next.js) para o alvo. */
export function installTemplate(target, template, { log = () => {} } = {}) {
  const src = path.join(PKG_ROOT, "template", template);
  if (!fs.existsSync(src)) {
    throw new Error(`Template "${template}" não encontrado em ${src}`);
  }
  copyDir(src, target, { ignore: new Set([".git"]) });
  log(`  ✓ template/${template} → ${target}`);
  return target;
}

/* ────────────────────────────────────────────────────────────
   Orquestração
   ──────────────────────────────────────────────────────────── */

/**
 * Cria um projeto completo: template + regras + atalhos.
 * @returns {object} resumo do que foi feito
 */
export function scaffold(options) {
  const {
    target,
    template = "next",
    install = false,
    git = false,
    submodule = null,
    shortcutMode = "auto",
    log = console.log,
  } = options;

  const abs = path.resolve(target);
  const summary = { target: abs, template, rules: false, shortcuts: [], git: false, install: false };

  if (fs.existsSync(abs) && fs.readdirSync(abs).length > 0) {
    throw new Error(`Pasta "${abs}" já existe e não está vazia. Escolha outro nome.`);
  }
  ensureDir(abs);

  // 1. Template do app (primeiro, para não colidir com SDD/)
  if (template && template !== "none") {
    log(`\n📦 Template: ${template}`);
    installTemplate(abs, template, { log });
  }

  // 2. Regras
  log("\n🧠 Regras SDD:");
  if (submodule) {
    log(`  → instalando como submodule: ${submodule}`);
    installSubmodule(abs, submodule, { log });
  } else {
    installRules(abs, { log });
    installShortcuts(abs, { log, mode: shortcutMode });
  }
  summary.rules = true;

  // 3. Git
  if (git) {
    if (has("git")) {
      log("\n🌿 Git:");
      run("git", ["init"], abs);
      run("git", ["add", "-A"], abs);
      run(
        "git",
        ["-c", "user.name=Marcelino Sandroni", "-c", "user.email=marcelino.sandroni@gmail.com",
          "commit", "-m", `chore: scaffold inicial com SDD AI Stack. (Agent: create-sdd-ai-stack)`],
        abs,
      );
      summary.git = true;
    } else {
      log("\n! git não encontrado. Pulando init.");
    }
  }

  // 4. Dependências
  if (install) {
    if (fs.existsSync(path.join(abs, "package.json"))) {
      log("\n📥 Instalando dependências…");
      run("npm", ["install"], abs);
      summary.install = true;
    } else {
      log("\n! Sem package.json — pulando instalação.");
    }
  }

  return summary;
}
