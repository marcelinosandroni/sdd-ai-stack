# 🤖 create-sdd-ai-stack

> **O kit de regras de desenvolvimento para agentes de IA, baseado em Spec-Driven Development (SDD).**
> Stack padrão: **Next.js 16**. Um `npx` e você tem um projeto com regras, arquitetura, design system e SDD prontos.

```bash
npx create-sdd-ai-stack meu-dashboard
```

---

## 🎯 O que é isto

Um **template de regras + código** para agentes de IA (Claude Code, Cursor, Copilot, Codex, Gemini CLI, Cline, Windsurf…).

O agente abre o projeto, lê **uma** sequência de arquivos, e já sabe:
o que construir agora, como estruturar, como escrever código, como commitar, quando parar.

| Entrega | O que você recebe |
| --- | --- |
| **Regras** | `SDD/` com leis do agente, stack, design, arquitetura, SDD e stacks por ferramenta |
| **Template** | App Next.js 16 completo, com design system já aplicado e buildando |
| **CLI** | `npx create-sdd-ai-stack <nome>` — cria tudo em 1 comando |
| **Submodule** | Instala só as regras em qualquer projeto, com atalhos na raiz |

---

## ⚡ Começando

### 1. Projeto novo (recomendado)

```bash
npx create-sdd-ai-stack meu-app
cd meu-app
npm run dev
```

O que nasce:

```text
meu-app/
├── src/
│   ├── app/           # rotas (marketing pública + /app logado)
│   ├── features/      # vertical slice de exemplo (domain/application/infrastructure/ui)
│   ├── shared/        # design system, lib, server-only
│   ├── proxy.ts       # network boundary + headers
│   └── app/globals.css# TOKENS DO DESIGN SYSTEM
├── tests/             # unit + e2e prontos
├── SDD/               # 🧠 as regras
├── AGENTS.md          # → atalho para ./SDD/AGENTS.md
├── CLAUDE.md, GEMINI.md, .cursorrules, .github/copilot-instructions.md, …
└── package.json
```

### 2. Projeto existente (só as regras)

```bash
# Opção A — submodule (atualiza com git)
git submodule add https://github.com/marcelinosandroni/sdd-ai-stack.git SDD
node SDD/SKILLS/install-submodule/install-submodule.mjs

# Opção B — CLI
npx create-sdd-ai-stack . --rules-only
```

Os atalhos da raiz (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`…) apontam para `./SDD/AGENTS.md`,
então **todo agente já começa pelo lugar certo** — sem você precisar configurar nada.

Atualizar as regras depois:

```bash
git submodule update --remote --merge SDD
```

> ⚠️ O `.gitignore` do app gerado protege `.env.local`, `.next/` e `node_modules/`.
> Nunca commite um `.env` de verdade — só o `.env.example` (que tem placeholders).

### 3. Opções da CLI

```bash
npx create-sdd-ai-stack meu-app --template next      # template (padrão)
npx create-sdd-ai-stack meu-app --rules-only         # só as regras
npx create-sdd-ai-stack meu-app --install            # roda npm install
npx create-sdd-ai-stack meu-app --git                # git init + 1º commit
npx create-sdd-ai-stack meu-app --submodule          # SDD/ como git submodule
npx create-sdd-ai-stack meu-app --submodule <url>    # de um fork seu
npx create-sdd-ai-stack meu-app --shortcuts stub     # sem symlink (Windows sem dev mode)
```

---

## 🧠 O mapa das regras (`SDD/`)

```text
SDD/
├── AGENTS.md            ⭐ leis + fluxo — LEIA PRIMEIRO
├── specs/PLAN.md        ⭐ a task AGORA
├── APP.md               o que é este app
├── APP-STACK.md         qual stack este app usa
├── NEXT.md              ⭐ Next.js 16 (stack padrão)
├── NODE.md              Node.js puro (worker, cron, fila)
├── REACT.md             React (server-first)
├── DESIGN.md            🎨 design system completo
├── ARCHITECTURE.md      🏗️ vertical slices
├── stacks/              🧱 por ferramenta
│   ├── typescript.md    tailwind.md     shadcn.md
│   ├── testing.md       database.md     ai.md
│   └── git.md           ci.md
├── specs/               SDD operacional
│   ├── PLAN.md  BACKLOG.md  ROADMAP.md
│   ├── tasks/TASK_TEMPLATE.md
│   └── history/phases/
├── docs/                PRODUCT.md  CHANGELOG.md  PLANNING.md
└── SKILLS/              automações (create-feature, install-submodule)
```

### Ordem de leitura imposta pelo `AGENTS.md`

```text
1. SDD/AGENTS.md      leis e fluxo
2. SDD/specs/PLAN.md  a única task [-]
3. SDD/APP.md         o que é este app
4. SDD/APP-STACK.md   qual stack
5. SDD/NEXT.md        regras da stack
6. SDD/DESIGN.md      só se mexer em UI
7. SDD/stacks/…       só a ferramenta que está tocando
```

> Cada doc de regra tem um **roteador no topo**: "se você está fazendo X, leia §Y".
> Isso mantém o contexto do agente pequeno — importante, porque contexto longo é onde o agente morre.

---

## 🎨 Design System

O `DESIGN.md` implementa o **Executive Engineering**: ardósia profunda (nunca preto puro),
micro-bordas de 1px, acentos em lime neon `#BAF336` e mint `#34D399`, tipografia tripla
(**Manrope** estrutural + **JetBrains Mono** técnica + **Playfair Display** editorial), grid de 12 colunas com max 1320px.

Os tokens vivem em `src/app/globals.css` (bloco `@theme` do Tailwind v4) e viram utilitários
(`bg-surface-raised`, `text-text-secondary`, `text-label-mono`, `border-border-subtle`…) +
primitivos (`btn-primary`, `btn-secondary`, `card`, `card-metric`, `chip`, `field`).

**Um lugar só.** Mudou o design? Muda no `@theme`, nunca no componente.

---

## 🏗️ Arquitetura

Vertical slices. Uma pasta por domínio, com tudo que aquele domínio precisa:

```text
src/features/<dominio>/
├── domain/           # entidades + contratos (I*.ts) — zero dependência
├── application/      # use cases — regra pura, sem Next, sem Prisma
├── infrastructure/   # Prisma, HTTP, filas
├── container.ts      # DI do slice
├── queries.ts        # entrada de leitura
├── actions.ts        # entrada de escrita (Server Action)
└── ui/               # componentes do domínio
```

Motivo de ser assim: **para entender um requisito você abre uma pasta só** — e o
`application/` é testável sem mock de infra.

---

## 🚀 Publicar no npm

Fluxo único: **você versiona, o GitHub Actions publica.**

```bash
npm run version:minor              # 0.1.17 → 0.2.0 (commita + cria tag v0.2.0)
git push origin main
git push origin --tags            # ← dispara a publicação
```

A primeira vez precisa resolver a autenticação. Com **2FA ligado na conta npm**, um token
comum não publica (`EOTP` — o CI não tem como digitar o OTP). Duas saídas:

```bash
# A. Recomendado: publica a 1ª versão da sua máquina, ativa OIDC e apaga o token
npm publish --access public --provenance=false --otp=123456
#   ⚠️ --provenance=false é obrigatório fora do CI: o npm exige OIDC para gerar
#      provenance e falha com "provider: null" se não achar o provedor
# depois: npmjs.com → create-sdd-ai-stack → Settings → Trusted publishing
#   owner: marcelinosandroni · repo: sdd-ai-stack · workflow: release.yml · allow: npm publish
gh secret delete NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack

# B. Ponte: token granular com "Bypass 2FA" marcado (deprecado pelo npm em jan/2027)
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

O workflow escolhe o modo sozinho: **com** `NPM_TOKEN` usa token, **sem** ele usa OIDC.
Nada de token fica gravado em arquivo.

**Guards antes de publicar:** `npm test` (22 testes) · links da doc · tag `vX.Y.Z` bate com
o `package.json` · 10 arquivos essenciais presentes no tarball · `npm ≥ 11.5.1` · `concurrency` · provenance.

📖 Passo a passo completo (os 3 caminhos de auth, troubleshooting e o caminho stage-only)
em [`docs/RELEASE.md`](./docs/RELEASE.md).

---

## 🔌 Agentes suportados

Os atalhos da raiz são criados para:

| Arquivo | Agente |
| --- | --- |
| `AGENTS.md` | padrão de mercado (Cursor, Codex, Windsurf, Cline, Gemini) |
| `CLAUDE.md` | Claude Code |
| `GEMINI.md` | Gemini CLI |
| `.cursorrules` | Cursor (formato antigo) |
| `.windsurfrules` | Windsurf |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.clinerules` | Cline |

Todos apontam para `SDD/AGENTS.md`. Nenhuma configuração manual necessária.

---

## 🧪 Verificação

```bash
npm test        # 20 testes da CLI, do scaffold e da documentação
```

O template em `template/next/` é validado de verdade: `typecheck` + `lint` + `test` + `test:e2e` + `build`.

---

## 📚 SKILLS

| SKILL | O que faz |
| --- | --- |
| `create-feature` | Cria um vertical slice novo com domain/application/container/queries/actions |
| `install-submodule` | Instala as regras em projeto existente + cria atalhos |
| `check-docs` | Valida que todo link relativo entre documentos resolve |

---

## 🛡️ Qualidade

```bash
npm test                          # 22 testes: CLI, scaffold e integridade da documentação
node SDD/SKILLS/check-docs/check-docs.mjs   # 29 documentos, links relativos
npm run check:pack                # confere o que vai para o npm (71 arquivos, ~62 kB)
```

O template em `template/next/` é validado de verdade: `typecheck` + `lint` + `test` + `test:e2e` + `build`.
O CI (`.github/workflows/ci.yml`) refaz essa validação a cada push, **gerando o app a partir do próprio template**.

---

## 👨‍💻 Autor

**Marcelino Sandroni** — [github.com/marcelinosandroni](https://github.com/marcelinosandroni)

MIT License.
