# CHANGELOG

Todas as mudanças relevantes deste template. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); versionamento por
[SemVer](https://semver.org/lang/pt-BR/).

---

## [0.1.17] — 2026-09-29

> **Primeira versão publicada.** O projeto segue em `0.x` de propósito: a API de
> regras e o template ainda vão mudar com base no uso real. `0.y.z` comunica
> isso sem versionar breaking changes a cada duas semanas.

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

- 20 → **27 testes** (symlink resolvendo o conteúdo certo · `.gitignore` no app gerado ·
  provenance fora do `publishConfig` · `--provenance` explícito no CI ·
  `NODE_AUTH_TOKEN` ausente do passo Publica · `_authToken` fora do `.npmrc` do projeto ·
  token injetado via `GITHUB_ENV`)

### 🐛 `.npmrc` do projeto zerava a autenticação (404 na primeira publicação)

```
npm error code E404
npm error 404 Not Found - PUT https://registry.npmjs.org/create-sdd-ai-stack - Not found
```

**Não era o pacote ausente** — o `npm publish` cria o pacote sozinho na primeira vez.
O 404 no PUT significa que o registry não reconheceu o usuário como autorizado.

Causa: o `.npmrc` do projeto declarava
`//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}`. O npm lê os arquivos nesta
ordem — **projeto > usuário > global** — então esse placeholder **sombreava** o token
real do `~/.npmrc`. Com a variável vazia, o token efetivo ficava vazio:

| Comando | Antes | Depois |
| --- | --- | --- |
| `npm whoami` | `401 Unauthorized` | `marcelinosandroni` |
| `npm publish` (1ª vez) | `404 Not Found` (PUT) | cria o pacote |

O mesmo defeito atingia o caminho por token **no CI**, porque o `.npmrc` do repositório
também é copiado para o runner e tem prioridade sobre o `~/.npmrc` gerado pelo
`setup-node`.

Correções:
- `.npmrc` do projeto ficou só com `registry=` (o comentário no arquivo explica por quê)
- CI passou a injetar `NODE_AUTH_TOKEN` via `$GITHUB_ENV` em vez de escrever token em
  arquivo — assim o OIDC continua engatando quando não há secret
- três testes de regressão, todos verificados reintroduzindo o bug de propósito

### 🐛 `publishConfig.provenance` quebrava o publish local

Com 2FA ligado, o bootstrap local do pacote falhou:

```
npm error code EUSAGE
npm error Automatic provenance generation not supported for provider: null
```

A causa era o **nosso** `package.json`: `publishConfig.provenance: true`.

O npm lê `publishConfig` **com prioridade sobre flag de CLI e sobre variável de
ambiente** — então `--provenance=false` e `NPM_CONFIG_PROVENANCE=false` **não resolvem**.
O `publishConfig` vence os dois, e o provenance passou a ser exigido também no publish
local, onde não existe provedor OIDC.

Correção: `provenance` saiu do `publishConfig` (ficou só `access: public`) e passou a ser
controlado **por invocação** — o workflow de release passa `--provenance` explicitamente,
o publish local não passa nada.

Três testes de regressão agora travam esse comportamento (o terceiro foi verificado
reintroduzindo o bug de propósito):
- `provenance` não pode estar no `publishConfig`
- o passo `Publica` passa `--provenance`
- o passo `Publica` não define `NODE_AUTH_TOKEN` (senão o OIDC não engata)

### 🔐 Autenticação: 2FA no npm quebrou o publish por token

Com 2FA ligado na conta, `npm publish` por token passa a exigir **OTP do autenticador**,
que o CI não tem como digitar:

```
npm error code EOTP
npm error This operation requires a one-time password from your authenticator.
```

Três saídas, e o workflow agora suporta as duas principais:

- **Bootstrap local + Trusted Publishing (OIDC)** — publica a primeira versão da máquina
  com `--otp`, configura o publisher no npmjs.com, **apaga o token**. Da frente em diante
  o CI publica sem credencial nenhuma. É o caminho recomendado.
- **Token com "Bypass 2FA"** — funciona hoje, mas o npm avisa que publicação direta com
  token granular **será removida em janeiro de 2027**, e há bug aberto onde o bypass é
  ignorado pelo npm 11.x ([npm/cli#9268](https://github.com/npm/cli/issues/9268)).
- **Token stage-only** — o CI sobe a versão, um maintainer aprova com 2FA.

Mudanças no workflow:

- `npm install -g npm@latest` no job de publish — **OIDC exige npm ≥ 11.5.1** e o Node 22
  do runner do GitHub vem com npm 10.x. Sem isso o OIDC nunca engata.
- `NODE_AUTH_TOKEN` **removido** do passo `Publica`. O npm só usa OIDC quando o auth está
  **ausente**; com a variável no ambiente, ele ignora o OIDC e volta a falhar por token.
- Step `Autentica` virou condicional: com `NPM_TOKEN` escreve o token; sem ele, **não
  escreve nada** no `.npmrc` e deixa o npm escolher o OIDC sozinho.

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

[0.1.17]: https://github.com/marcelinosandroni/sdd-ai-stack/releases/tag/v0.1.17
