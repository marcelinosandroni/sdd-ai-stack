# 🤖 LEIS ABSOLUTAS DO AGENTE IA (AGENTS.md)

> 🛑 **VOCÊ É UM AGENTE AUTÔNOMO** sob Spec-Driven Development (SDD).
> Sua memória falha em contexto longo. **Sua ÚNICA fonte da verdade são os arquivos de especificação deste repositório.** Se está aqui, vale. Se não está, não invente.

> 📦 **Onde este arquivo mora:** na raiz do pacote `create-sdd-ai-stack`.
> Quando instalado num projeto, ele fica em **`SDD/AGENTS.md`** e todos os caminhos abaixo são relativos a `SDD/`.
> Por isso todos os links usam prefixo `SDD/`.

---

## 🎯 0. RESUMO EXECUTIVO (30 segundos)

| Pergunta | Resposta |
| --- | --- |
| Stack padrão? | **Next.js 16** (App Router) |
| Backend extra? | **Node.js** puro, só para worker/cron/webhook |
| Onde eu leio as regras? | `SDD/` — comece por `SDD/AGENTS.md` (este arquivo) |
| O que eu faço primeiro? | Ler `SDD/specs/PLAN.md` e pegar a **única** task `[-]` |
| Quando paro? | Quando a task virar `[x]` e eu colar a evidência do terminal |
| Posso editar regras? | **NÃO.** Ver [§6](#-6-regra-de-permissão-de-docs) |
| Como commito? | Conventional Commits + identidade fixa. Ver `SDD/stacks/git.md` |

---

## 📚 1. MAPEAMENTO DE CONTEXTO (ordem obrigatória de leitura)

Sempre que for acionado, leia nesta exata ordem:

1. **`SDD/AGENTS.md`** (este arquivo) — leis e fluxo.
2. **`SDD/specs/PLAN.md`** — a **única** tarefa pendente agora.
3. **`SDD/APP.md`** + **`SDD/APP-STACK.md`** — o que é este app e qual a stack dele.
4. **`SDD/ARCHITECTURE.md`** — arquitetura global.
5. **`SDD/NEXT.md`** — regras da stack padrão (ou o doc da stack deste app, se `APP-STACK.md` apontar outro).
6. **`SDD/DESIGN.md`** — regras de UI/UX (só se for mexer em UI).
7. **`SDD/stacks/README.md`** — índice das regras por ferramenta (só se precisar).

> ⚠️ **Regra de hiperfoco (TDAH):** leia **o mínimo necessário**. Não leia tudo "por garantia". Abra o doc da stack só quando a task exigir.

---

## 🗺️ 2. ROTEADOR DE REGRAS (onde está o quê)

```text
SDD/
├── AGENTS.md          ← VOCÊ ESTÁ AQUI (leis + fluxo)
├── APP.md             ← o que é este app (regras de negócio)
├── APP-STACK.md       ← qual stack este app usa (ponteiro)
├── ARCHITECTURE.md    ← arquitetura global (vertical slices)
├── DESIGN.md          ← design system (tokens, tipografia, componentes)
├── NEXT.md            ← Next.js 16  ⭐ STACK PADRÃO
├── NODE.md            ← Node.js puro (worker, cron, fila)
├── REACT.md           ← React (hooks, estado, composição)
├── stacks/            ← regras por linguagem/ferramenta
│   ├── typescript.md  tailwind.md  shadcn.md  testing.md
│   └── database.md    ai.md        git.md     ci.md
├── specs/             ← SDD operacional
│   ├── PLAN.md        (a task AGORA)
│   ├── BACKLOG.md     (ideias soltas, débito técnico)
│   ├── ROADMAP.md     (visão macro)
│   ├── history/phases/  (fases concluídas)
│   └── tasks/         (TASK-PHASE-TASK.md)
├── docs/
│   ├── PRODUCT.md     changelog        PLANNING.md
└── SKILLS/            ← automações (scripts) do projeto
```

| Preciso saber...            | Abra                          |
| --------------------------- | ----------------------------- |
| A próxima task              | `specs/PLAN.md`               |
| As regras do Next.js        | `NEXT.md`                     |
| Tokens de cor/fonte         | `DESIGN.md`                   |
| Como commitar                | `stacks/git.md`               |
| Como escrever teste          | `stacks/testing.md`           |
| Regras de TypeScript         | `stacks/typescript.md`        |
| Estrutura de pasta           | `ARCHITECTURE.md`             |
| Qual stack este app usa      | `APP-STACK.md`                |

---

## 🧠 3. COMPORTAMENTO OBRIGATÓRIO

1. **Proativo e criativo, mas disciplinado.** Sugira melhoria de arquitetura, mas **pergunte antes** de alterar regra.
2. **Fim de ciclo = comemorar e perguntar.** Ao concluir uma fase: comemore, pergunte ao humano se segue, ou sugira o próximo desafio.
3. **Não invente regra.** Se a resposta não está em `SDD/`, **pergunte**. Nunca "improvisar" arquitetura.
4. **Falhou o teste? Pare.** Volte, corrija, rode de novo. **PROIBIDO avançar com teste vermelho.**
5. **Tamanho de task:** o dev tem TDAH. Se a task levar > 1h, **quebre em duas** antes de começar.

---

## 🔄 4. FLUXO DE ENTREGA (o gated workflow)

Ao encontrar sua task em `specs/PLAN.md`:

1. **Refinar** — leia a task + o doc de regra relevante. Entenda 100% antes de escrever.
2. **Instalar pacotes** — **NUNCA** rode `npm install` na raiz. Use `cd` explícito se houver sub-pastas.
3. **Implementar** — só o necessário (máx 5 arquivos por passo). Use scripts de `SKILLS/` quando existirem.
4. **Testar** — `typecheck` + `test:unit` + `test:e2e`. Crie teste de TODO tipo: unit, integração, E2E. Mokar dados para teste rápido.
5. **Prova de vida anti-alucinação** — para marcar `[x]`, **cole o output verde do terminal** na resposta (comando + resultado + evidência Playwright). **Você está PROIBIDO de mentir sobre teste.**
6. **Concluir** — marque `[x]` em `specs/PLAN.md` e **encerre a resposta**.

### Loop de falha 🛑
> Erro? Volte. Corrija. Teste de novo. **Teste vermelho = task não concluída.** Sem exceção, sem "deve funcionar".

---

## 🛠️ 5. SISTEMA DE SKILLS (automação)

- Se um padrão se repete, **transforme em SKILL**: script em `SDD/SKILLS/<nome>/`.
- Antes de codar na mão, verifique se já existe uma SKILL que faz isso.
- Mantenha nomes descritivos para que **você mesmo** consiga descobrir e rodar.

---

## 🌿 6. REGRA DE PERMISSÃO DE DOCS

| Ação | Permissão |
| --- | --- |
| Atualizar `specs/PLAN.md`, `specs/tasks/*`, `docs/changelog.md`, `docs/PRODUCT.md`, `docs/PLANNING.md` | ✅ **AUTOMÁTICO** (obrigatório após mudança) |
| Criar task nova em `specs/tasks/` | ✅ Automático quando a fase pedir |
| Editar `APP-STACK.md` para trocar a stack do app | ✅ Automático (é configuração do projeto) |
| **Editar** `NEXT.md`, `NODE.md`, `REACT.md`, `DESIGN.md`, `ARCHITECTURE.md`, `AGENTS.md`, `stacks/*` | 🛑 **PROIBIDO sem pedir** ao humano primeiro |

> Se identificar melhoria nessas arquiteturas, **PERGUNTE** antes de mudar. Elas são a lei do template.

---

## 📝 7. GIT, COMMIT E VERSIONAMENTO

- **Gitflow + Conventional Commits + SemVer com tags.**
- **Identidade fixa:** Marcelino Sandroni <marcelino.sandroni@gmail.com>.
- **Padrão de mensagem:** `tipo(escopo): descrição curta. (Agent: <Ferramenta> - <Modelo>)`
  - Ex.: `feat(chat): cria interface IVideo. (Agent: Cursor - Claude)`
  - Tipos: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `style` `build` `ci`.
- Detalhes completos: `stacks/git.md`.

### Limpeza de memória (fim de fase)
Quando **todas** as tasks da fase no `specs/PLAN.md` estiverem `[x]`:
1. Resuma a fase em `specs/history/phases/phase-N-finished.md`.
2. Apague as tasks concluídas de `specs/tasks/`.
3. Gere a tag SemVer: `git tag vX.Y.Z`.
4. **Um** commit de arquivamento.
5. Limpe o `specs/PLAN.md` e pergunte: **"Qual o próximo desafio, chefe?"**

---

## 🚨 8. ARMADILHAS CONHECIDAS (Next 16)

Não caia nestas (detalhes em `NEXT.md` §11):
- `params`/`searchParams`/`cookies()`/`headers()` são **async**.
- `middleware.ts` foi renomeado para **`proxy.ts`** (função `proxy`). Arquivo antigo é ignorado em silêncio.
- `revalidateTag(tag)` de 1 argumento **depreciado** → use `updateTag` em actions.
- `next lint` **removido** → use Biome/ESLint direto.
- `export const dynamic/revalidate` **não existem** com `cacheComponents` → use `'use cache'` + `cacheLife`.
- Turbopack é o **padrão** do build.
- Parallel routes exigem `default.js` explícito.

---

## 🧭 9. COMO ESTE PROJETO FOI MONTADO

- Este repositório é o **template** (`create-sdd-ai-stack`). As regras vivem em `SDD/`.
- Consumo: `npx create-sdd-ai-stack meu-app` (copia as regras + o template Next) **ou** `git submodule add ... SDD` (só as regras).
- Detalhes: [`README.md`](./README.md).
