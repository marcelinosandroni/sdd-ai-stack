import { DEFAULT_SUBMODULE_URL, DEFAULT_TEMPLATE, TEMPLATES } from "../lib/constants.mjs";

export const HELP = `
create-sdd-ai-stack — projeto pronto para agentes de IA (Spec-Driven Development)

USO
  npx create-sdd-ai-stack <nome-do-app> [opções]

EXEMPLO
  npx create-sdd-ai-stack meu-dashboard
  npx create-sdd-ai-stack meu-dashboard --no-install
  npx create-sdd-ai-stack meu-dashboard --submodule
  npx create-sdd-ai-stack meu-dashboard --rules-only

OPÇÕES
  --template <${TEMPLATES.join("|")}|none>   Template de projeto (padrão: ${DEFAULT_TEMPLATE})
  --rules-only            Instala só as regras (sem app), em ./SDD
  --submodule [url]       Instala ./SDD como git submodule (padrão: repo oficial)
  --no-install            Não roda npm install
  --install               Roda npm install (padrão: não roda)
  --git / --no-git        git init + primeiro commit (padrão: não roda)
  --shortcuts <auto|stub|symlink>
                          Como criar os atalhos da raiz (padrão: auto)
  -y, --yes               Não pede confirmação
  -h, --help              Esta ajuda
  -v, --version           Versão

O QUE É CRIADO
  <app>/
  ├── src/ …            template Next.js 16 (App Router, Tailwind v4, Biome, Vitest)
  ├── SDD/              as regras: AGENTS.md, NEXT.md, DESIGN.md, stacks/, specs/…
  ├── AGENTS.md         atalho → ./SDD/AGENTS.md
  ├── CLAUDE.md, GEMINI.md, .cursorrules, .github/copilot-instructions.md …
  └── package.json

DOCS
  https://github.com/marcelinosandroni/sdd-ai-stack
`;

export function parseArgs(argv) {
  const opts = {
    name: null,
    template: DEFAULT_TEMPLATE,
    install: false,
    git: false,
    submodule: null,
    rulesOnly: false,
    shortcutMode: "auto",
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];

    switch (arg) {
      case "-h":
      case "--help":
        opts.help = true;
        break;
      case "-v":
      case "--version":
        opts.version = true;
        break;
      case "-y":
      case "--yes":
        break;
      case "--rules-only":
        opts.rulesOnly = true;
        opts.template = "none";
        break;
      case "--install":
        opts.install = true;
        break;
      case "--no-install":
        opts.install = false;
        break;
      case "--git":
        opts.git = true;
        break;
      case "--no-git":
        opts.git = false;
        break;
      case "--submodule": {
        const value = argv[i + 1];
        if (value && !value.startsWith("-")) {
          opts.submodule = value;
          i++;
        } else {
          opts.submodule = DEFAULT_SUBMODULE_URL;
        }
        break;
      }
      case "--template": {
        const value = next();
        if (!value) throw new Error("--template exige um valor");
        if (value !== "none" && !TEMPLATES.includes(value)) {
          throw new Error(`Template inválido: "${value}". Use: ${TEMPLATES.join(", ")} ou none.`);
        }
        opts.template = value;
        break;
      }
      case "--shortcuts": {
        const value = next();
        if (!["auto", "stub", "symlink"].includes(value)) {
          throw new Error(`--shortcuts inválido: "${value}". Use: auto, stub, symlink.`);
        }
        opts.shortcutMode = value;
        break;
      }
      default:
        if (arg.startsWith("-")) throw new Error(`Opção desconhecida: ${arg}`);
        if (!opts.name) opts.name = arg;
    }
  }

  return opts;
}
