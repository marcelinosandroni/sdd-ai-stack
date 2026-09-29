#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs, HELP } from "../src/cli.mjs";
import { scaffold } from "../lib/scaffold.mjs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

function ask(question, fallback) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return rl
    .question(`${question} `)
    .then((a) => a.trim() || fallback)
    .finally(() => rl.close());
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`\n✖ ${err.message}\n`);
    console.error(HELP);
    process.exit(1);
  }

  if (opts.help) {
    console.log(HELP);
    return;
  }
  if (opts.version) {
    console.log(pkg.version);
    return;
  }

  console.log("\n🤖 create-sdd-ai-stack — Spec-Driven Development para agentes de IA\n");

  const name = opts.name ?? (await ask("Nome do projeto:", "meu-app"));
  const target = path.resolve(process.cwd(), name);
  const usingSubmodule = Boolean(opts.submodule);

  console.log(`
  📁 projeto:  ${name}
  📦 template: ${opts.template === "none" ? "(nenhum — só regras)" : opts.template}
  🧠 regras:   ${usingSubmodule ? `submodule ${opts.submodule}` : "copiadas para ./SDD"}
`);

  if (process.stdin.isTTY) {
    const answer = await ask("Criar agora? [Y/n]", "Y");
    if (!/^y(es)?$/i.test(answer)) {
      console.log("\nCancelado. Nada foi criado.\n");
      return;
    }
  }

  try {
    const summary = scaffold({
      target,
      template: opts.template,
      install: opts.install,
      git: opts.git,
      submodule: opts.submodule,
      shortcutMode: opts.shortcutMode,
    });

    console.log(`
✅ Projeto criado em: ${summary.target}

Próximos passos:
  cd ${name}
${opts.install ? "" : "  npm install\n"}${opts.git ? "" : "  git init && git add -A && git commit -m \"chore: scaffold inicial\"\n"}
  npm run dev

⚠️  LEIA ANTES DE CODAR:
  cat SDD/AGENTS.md        # leis do agente
  cat SDD/specs/PLAN.md    # a task AGORA
  cat SDD/NEXT.md          # regras da stack (Next.js 16)

Atualizar as regras depois (se submodule):
  git submodule update --remote --merge SDD

Docs: ${pkg.homepage}
`);
  } catch (err) {
    console.error(`\n✖ Falhou: ${err.message}\n`);
    process.exit(1);
  }
}

main();
