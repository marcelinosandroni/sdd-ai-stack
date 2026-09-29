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

  const name = opts.name ?? (await ask("Project name:", "meu-app"));
  const target = path.resolve(process.cwd(), name);
  const usingSubmodule = Boolean(opts.submodule);

  console.log(`
  📁 project:  ${name}
  📦 template: ${opts.template === "none" ? "(none — rules only)" : opts.template}
  🧠 rules:    ${usingSubmodule ? `submodule ${opts.submodule}` : "copied into ./SDD"}
`);

  // `--yes` skips the confirmation. Before this fix the flag was parsed and
  // thrown away, so a TTY user was still asked — and a script piping stdin
  // non-interactively was never asked either way.
  if (process.stdin.isTTY && !opts.yes) {
    const answer = await ask("Create it now? [Y/n]", "Y");
    if (!/^y(es)?$/i.test(answer)) {
      console.log("\nCancelled. Nothing was created.\n");
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
✅ Project created at: ${summary.target}

Next steps:
  cd ${name}
${opts.install ? "" : "  npm install\n"}${opts.git ? "" : "  git init && git add -A && git commit -m \"chore: initial scaffold\"\n"}
  npm run dev

⚠️  READ BEFORE YOU CODE:
  cat SDD/AGENTS.md              # agent laws + delivery flow
  cat SDD/specs/PLAN.md          # the task RIGHT NOW
  cat SDD/stacks/next.md         # the stack rules (Next.js 16)

Update the rules later (if submodule):
  git submodule update --remote --merge SDD

Docs: ${pkg.homepage}
`);
  } catch (err) {
    console.error(`\n✖ Failed: ${err.message}\n`);
    process.exit(1);
  }
}

main();
