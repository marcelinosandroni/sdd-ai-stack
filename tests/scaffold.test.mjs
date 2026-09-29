import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { scaffold, installRules, installShortcuts } from "../lib/scaffold.mjs";
import { parseArgs } from "../src/cli.mjs";
import { DEFAULT_SUBMODULE_URL } from "../lib/constants.mjs";

const silent = () => {};

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
}

/* ── parseArgs ───────────────────────────────────────────── */

test("parseArgs: lê nome e defaults", () => {
  const o = parseArgs(["meu-app"]);
  assert.equal(o.name, "meu-app");
  assert.equal(o.template, "next");
  assert.equal(o.install, false);
  assert.equal(o.git, false);
  assert.equal(o.submodule, null);
});

test("parseArgs: --rules-only desliga o template", () => {
  const o = parseArgs(["app", "--rules-only"]);
  assert.equal(o.template, "none");
});

test("parseArgs: --submodule sem url usa a oficial", () => {
  const o = parseArgs(["app", "--submodule"]);
  assert.equal(o.submodule, DEFAULT_SUBMODULE_URL);
});

test("parseArgs: --submodule com url usa a informada", () => {
  const o = parseArgs(["app", "--submodule", "https://exemplo.com/x.git"]);
  assert.equal(o.submodule, "https://exemplo.com/x.git");
});

test("parseArgs: rejeita template inválido", () => {
  assert.throws(() => parseArgs(["app", "--template", "angular"]), /Template inválido/);
});

test("parseArgs: rejeita opção desconhecida", () => {
  assert.throws(() => parseArgs(["app", "--nao-existe"]), /Opção desconhecida/);
});

test("parseArgs: rejeita --shortcuts inválido", () => {
  assert.throws(() => parseArgs(["app", "--shortcuts", "hardlink"]), /--shortcuts inválido/);
});

/* ── installRules ────────────────────────────────────────── */

test("installRules: cria SDD/ com todos os documentos", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const sdd = path.join(root, "SDD");

  for (const f of [
    "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md",
    "DESIGN.md", "NEXT.md", "NODE.md", "REACT.md",
  ]) {
    assert.ok(fs.existsSync(path.join(sdd, f)), `faltou SDD/${f}`);
  }

  for (const d of ["stacks", "specs", "docs", "SKILLS"]) {
    assert.ok(fs.statSync(path.join(sdd, d)).isDirectory(), `faltou SDD/${d}/`);
  }

  assert.ok(fs.existsSync(path.join(sdd, "stacks", "README.md")));
  assert.ok(fs.existsSync(path.join(sdd, "stacks", "typescript.md")));
  assert.ok(fs.existsSync(path.join(sdd, "specs", "PLAN.md")));
});

test("installRules: NÃO embute a própria lib (bin/src/lib/template)", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const sdd = path.join(root, "SDD");

  for (const leaked of ["bin", "src", "lib", "tests", "template", "node_modules"]) {
    assert.ok(!fs.existsSync(path.join(sdd, leaked)), `SDD/ não deveria conter ${leaked}`);
  }
});

test("installRules: o AGENTS.md instalado aponta para SDD/ e não para raiz", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const text = fs.readFileSync(path.join(root, "SDD", "AGENTS.md"), "utf8");
  assert.match(text, /SDD\/AGENTS\.md/);
  assert.match(text, /Next\.js 16/);
});

/* ── installShortcuts ────────────────────────────────────── */

test("installShortcuts: modo stub cria todos os atalhos com ponteiro", () => {
  const root = tmp();
  installRules(root, { log: silent });
  installShortcuts(root, { log: silent, mode: "stub" });

  for (const rel of [
    "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules",
    ".windsurfrules", path.join(".github", "copilot-instructions.md"), ".clinerules",
  ]) {
    const p = path.join(root, rel);
    assert.ok(fs.existsSync(p), `faltou atalho ${rel}`);
    const text = fs.readFileSync(p, "utf8");
    assert.match(text, /SDD\/AGENTS\.md/, `atalho ${rel} não aponta para SDD/AGENTS.md`);
  }
});

test("installShortcuts: modo symlink cria atalho que resolve o conteúdo certo", () => {
  const root = tmp();
  installRules(root, { log: silent });
  const results = installShortcuts(root, { log: silent, mode: "symlink" });

  for (const rel of ["AGENTS.md", "CLAUDE.md"]) {
    const p = path.join(root, rel);
    assert.ok(fs.existsSync(p), `atalho ${rel} não foi criado (nem symlink nem stub)`);

    const text = fs.readFileSync(p, "utf8");
    const kind = results.find((r) => r.rel === rel).kind;

    // Guard do bug do caminho relativo: se virou symlink, TEM que ler as regras.
    // existsSync() segue symlink, então um link quebrado nem chegaria até aqui.
    if (kind === "symlink") {
      assert.match(text, /LEIS ABSOLUTAS DO AGENTE IA/, `symlink ${rel} não resolve para SDD/AGENTS.md`);
    } else {
      // fallback (Windows sem dev mode): stub com ponteiro explícito
      assert.match(text, /SDD\/AGENTS\.md/, `stub ${rel} não aponta para SDD/AGENTS.md`);
    }
  }
});

test("installShortcuts: não sobrescreve arquivo existente", () => {
  const root = tmp();
  fs.writeFileSync(path.join(root, "AGENTS.md"), "meu conteudo", "utf8");
  const res = installShortcuts(root, { log: silent, mode: "stub" });
  const found = res.find((r) => r.rel === "AGENTS.md");
  assert.equal(found.kind, "skipped");
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), "meu conteudo");
});

/* ── scaffold ────────────────────────────────────────────── */

test("scaffold: cria app completo (template + SDD + atalhos)", () => {
  const parent = tmp();
  const target = path.join(parent, "meu-app");
  const s = scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });

  assert.ok(s.rules);
  assert.ok(fs.existsSync(path.join(target, "package.json")));
  assert.ok(fs.existsSync(path.join(target, "next.config.ts")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "layout.tsx")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "globals.css")));
  assert.ok(fs.existsSync(path.join(target, "src", "proxy.ts")));
  assert.ok(fs.existsSync(path.join(target, "src", "features", "example")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "(marketing)", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "src", "app", "(app)", "app", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "tests", "e2e", "routes.spec.ts")));
  assert.ok(fs.existsSync(path.join(target, "tests", "unit", "create-example.test.ts")));
  assert.ok(!fs.existsSync(path.join(target, "src", "app", "page.tsx")));
  assert.ok(fs.existsSync(path.join(target, "SDD", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(target, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(target, "README.md")));
});

test("scaffold: template next declara cacheComponents e reactCompiler", () => {
  const parent = tmp();
  const target = path.join(parent, "app-cfg");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });
  const cfg = fs.readFileSync(path.join(target, "next.config.ts"), "utf8");
  assert.match(cfg, /cacheComponents:\s*true/);
  assert.match(cfg, /reactCompiler:\s*true/);
});

test("scaffold: template não traz node_modules nem .next", () => {
  const parent = tmp();
  const target = path.join(parent, "app-limpo");
  scaffold({ target, template: "next", log: silent, shortcutMode: "stub" });
  assert.ok(!fs.existsSync(path.join(target, "node_modules")));
  assert.ok(!fs.existsSync(path.join(target, ".next")));
});

test("scaffold: --rules-only não cria src/", () => {
  const parent = tmp();
  const target = path.join(parent, "so-regras");
  scaffold({ target, template: "none", log: silent, shortcutMode: "stub" });
  assert.ok(!fs.existsSync(path.join(target, "src")));
  assert.ok(fs.existsSync(path.join(target, "SDD", "AGENTS.md")));
});

test("scaffold: recusa pasta não vazia", () => {
  const target = tmp();
  fs.writeFileSync(path.join(target, "existe.txt"), "x", "utf8");
  assert.throws(() => scaffold({ target, log: silent }), /já existe e não está vazia/);
});
