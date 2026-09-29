# CHANGELOG

Todas as mudanças relevantes deste template. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por
[SemVer](https://semver.org/lang/pt-BR/).

---

## [Não publicado]

### 🔒 Publicação no npm

- `.github/workflows/release.yml` — publica no push de tag `v*` (automático), com
  `workflow_dispatch` para disparo manual e `dry_run` para validar sem queimar versão
- Secret do repositório: **`NPM_TOKEN`** (mapeado para `NODE_AUTH_TOKEN` pelo npm)
- `.npmrc` commitado apenas com `${NODE_AUTH_TOKEN}` — **nenhum token em arquivo**
- `publishConfig`: `access: public` + `provenance` (pacote assinado via GitHub OIDC)
- Guards antes do publish: `npm test` · links da doc · tag `vX.Y.Z` == `version` ·
  10 arquivos essenciais no tarball · `concurrency: release-npm`
- `exports` no `package.json` (consumo programático: `import { scaffold } from "create-sdd-ai-stack"`)
- `docs/RELEASE.md` — passo a passo, troubleshooting e a alternativa sem token (Trusted Publishing/OIDC)
- Scripts: `version:patch|minor|major`, `check:docs`, `check:pack`
  (o `npm publish` manual saiu de propósito: **um caminho só**, o do CI)

### 🐛 `.gitignore` do template não chegava no pacote

O npm **nunca** empacota arquivo chamado `.gitignore` (é um dos default-ignore dele).
O app gerado saía **sem `.gitignore`** — ou seja, `.env.local`, `.next/` e
`node_modules/` podiam ser commitados por acidente.

A negação `!template/**/.gitignore` no campo `files` **não resolve** (npm exclui por
padrão, antes de aplicar o allowlist). Solução: o template guarda como `gitignore`
(sem ponto, que o npm empacota normalmente) e `installTemplate` renomeia para
`.gitignore` ao copiar — fonte única, sem duplicar conteúdo.

`restoreGitignore()` lança erro se o arquivo faltar, então o app **nunca** sai sem
proteção de `.env`.

### 📈 Cobertura de teste

- 20 → **22 testes** (symlink resolvendo conteúdo certo + `.gitignore` presente no app gerado)

---

## [1.0.0] — 2026-09-29

### 🎯 Objetivo
Reestruturar o core de regras para **Next.js 16 como stack padrão** (antes: React/Vite + Node),
tornar o repositório instalável como **git submodule em `SDD/`**, e transformar em **pacote npm
CLI** (`npx create-sdd-ai-stack`) com um template Next.js funcional embutido.

### ✨ Adicionado

**Regras**
- `NEXT.md` — 11 seções de regras do Next.js 16 (Server-First, Data Layer, Server Actions,
  Cache Components, Segurança, Route Handlers, Forms, Metadata, Performance, armadilhas)
- `APP-STACK.md` — ponteiro de stack do app (qual doc de regra ler)
- `stacks/` — pasta nova com regras por linguagem/ferramenta:
  `typescript.md`, `tailwind.md`, `shadcn.md`, `testing.md`, `database.md`, `ai.md`, `git.md`, `ci.md`
- `specs/history/phases/phase-0-bootstrap.md` — histórico da fase

**Template**
- `template/next/` — projeto Next.js 16 completo e validado:
  App Router com route groups, `cacheComponents`, React Compiler, Turbopack,
  Tailwind v4 com tokens, Biome, Vitest, Playwright, vertical slice de exemplo,
  `proxy.ts` com hardening de headers, `shared/server` com `server-only`
- `src/app/globals.css` — design system completo como `@theme` do Tailwind v4
- Testes: 1 unit (3 casos) + 4 E2E prontos

**CLI / npm**
- `create-sdd-ai-stack` — pacote npm com bin (`bin/create-sdd-ai-stack.mjs`)
- Opções: `--template`, `--rules-only`, `--submodule [url]`, `--install/--no-install`,
  `--git/--no-git`, `--shortcuts auto|stub|symlink`, `-y`, `--help`, `--version`
- Atalhos criados na raiz: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`,
  `.windsurfrules`, `.github/copilot-instructions.md`, `.clinerules`
- `npm run release` / `release:minor` / `release:major` (testa → versiona com tag → publica)

**SKILLS**
- `SKILLS/create-feature/` — cria vertical slice com a estrutura padrão
- `SKILLS/install-submodule/` — instala as regras em projeto existente

**Testes da própria lib**
- `tests/scaffold.test.mjs` — 17 testes cobrindo `parseArgs`, `installRules`,
  `installShortcuts` e `scaffold`

### 🔄 Alterado

- `AGENTS.md` — Next-first; documenta que vive em `SDD/` quando instalado
- `DESIGN.md` — substituído pelo design system **Executive Engineering**
  (tokens, tipografia tripla, grid 12 col/1320px, elevação em tiers, componentes)
- `ARCHITECTURE.md` — de "monorepo client/server" para Next-first com vertical slices
- `NODE.md` — de "backend padrão" para **complemento** (worker/cron/fila) com critério de uso
- `REACT.md` — de "frontend padrão" para **complemento** (Server-First)
- `APP.md` — ponteiro para `NEXT.md` e `stacks/`
- `specs/PLAN.md` — regra de "exatamente uma task `[-]`" + checklist de entrega
- `specs/tasks/TASK_TEMPLATE.md` — DoD com os comandos de gate reais
- `README.md` — reescrito como documentação do pacote npm

### 🗑️ Removido

- `specs/ROADMAP.md` vazio → reescrito
- `docs/PRODUCT.md` vazio → mantido como stub de template

### 🐛 Correções encontradas pela própria validação

1. `error.tsx` sem `"use client"` — quebrava o build
2. `reactCompiler: true` sem `babel-plugin-react-compiler` — quebrava o build
3. `biome.json` no schema 1.x — quebrava o lint no Biome 2
4. `prepare: "husky || true"` — quebrava `npm install` no Windows
5. `proxy.ts` redirecionando `/` — escondia a landing (achado pelo E2E)
6. Rota `/` duplicada entre `app/page.tsx` e `(marketing)/page.tsx`
7. `installShortcuts` retornava `undefined` no modo stub
8. symlink dos atalhos com caminho relativo quebrado (`path.relative` com caminho não-absoluto) — **achado pelo CI no Linux**, mascarado no Windows pelo fallback pra stub
9. `cache: npm` no workflow sem lockfile commitado
10. rota `/` duplicada entre `app/page.tsx` e `(marketing)/page.tsx` (achado pelo E2E)
11. `.gitignore` do template não empacotado pelo npm (achado conferindo o `npm pack`)

> O nº 8 é o melhor argumento pra manter o CI que **revalida o template a cada push**:
> o teste passava 100% na minha máquina e só quebrou no Linux.

[1.0.0]: https://github.com/marcelinosandroni/sdd-ai-stack/releases/tag/v1.0.0
