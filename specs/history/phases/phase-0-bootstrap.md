# ✅ Fase 0 — Bootstrap (CONCLUÍDA)

> **Período:** reestruturação do core SDD
> **Resultado:** template Next.js 16 funcional + regras Next-first + CLI `npx create-sdd-ai-stack`

---

## 🧭 O que era

- Stack focada em **React (Vite) + Node.js** (monorepo `client/` + `server/`)
- Sem template de projeto
- Sem regras de Next.js
- Sem CLI / pacote npm
- Regras espalhadas na raiz
- Design system genérico (Vercel/Linear padrão)

## 🧭 O que virou

| Antes | Depois |
| --- | --- |
| React + Vite como padrão | **Next.js 16 (App Router)** como padrão |
| `NODE.md` genérico | `NODE.md` como **complemento** (worker/cron/fila) |
| `REACT.md` como doc de frontend | `REACT.md` como **complemento** (Server-First) |
| — | **`NEXT.md`** com 11 seções de regra |
| regras soltas na raiz | **`stacks/`** (typescript, tailwind, shadcn, testing, database, ai, git, ci) |
| `DESIGN.md` genérico | **`DESIGN.md`** Executive Engineering com tokens completos |
| — | **`APP-STACK.md`** (ponteiro de stack) |
| — | **`template/next/`** — Next.js 16 completo e testado |
| — | **CLI npm `create-sdd-ai-stack`** |
| — | **SKILL `install-submodule`** para projeto existente |
| — | **SKILL `check-docs`** (valida links entre documentos) |
| — | **`.github/workflows/ci.yml`** que revalida o template a cada push |

## 🧪 Evidência

```text
# CLI e documentação (21 testes)
npm test  →  tests 20 | pass 20 | fail 0
node SDD/SKILLS/check-docs/check-docs.mjs  →  ✓ 29 documentos, links OK

# Template gerado (evidence real)
npm run typecheck  →  exit 0
npm run lint       →  Checked 28 files, 0 erros, 0 warnings
npm run test       →  Test Files 1 passed, Tests 3 passed
npm run test:e2e   →  4 passed
npm run build      →  ✓ Compiled successfully (Turbopack, Cache Components)
                     ┌ ○ /   ├ ○ /_not-found   └ ○ /app   ƒ Proxy
```

## 🐛 Bugs encontrados e corrigidos durante a validação

1. `import type { CreateExampleInput }` de arquivo errado (typecheck pegou)
2. Import de path errado no `container.ts` do slice (typecheck pegou)
3. `error.tsx` sem `"use client"` (build pegou)
4. `reactCompiler: true` sem `babel-plugin-react-compiler` instalado (build pegou)
5. `biome.json` no schema antigo (`recommended` → `preset`) (lint pegou)
6. `prepare: "husky || true"` quebrava `npm install` no Windows (install pegou)
7. `proxy.ts` redirecionava `/` e escondia a landing marketing (E2E pegou)
8. Dupla rota em `/` (`app/page.tsx` + `(marketing)/page.tsx`) (E2E pegou)

> **Isso é a razão de existir a regra "prova de vida anti-alucinação" do AGENTS.md.**

## 🏷️ Release

```bash
git tag v1.0.0
```
