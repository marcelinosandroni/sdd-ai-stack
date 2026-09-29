# 🏗️ ARQUITETURA GLOBAL

> **Next.js 16, App Router, Vertical Slices.** Sem `client/` vs `server/` separado — o framework já é a fronteira.

## 🧠 O princípio

Uma **feature** (fatia vertical) é a unidade de mudança. Ela carrega **tudo** que aquele domínio precisa:

```text
src/features/chat/
├── domain/          # Entidades, contratos (I*.ts) — ZERO dependência externa
├── application/     # Use cases (lógica de negócio pura)
├── infrastructure/  # Prisma, HTTP client, filas, storage
├── container.ts     # Montagem de dependências (DI do slice)
├── queries.ts       # Entrada de LEITURA
├── actions.ts       # Entrada de ESCRITA (Server Actions)
└── ui/              # Componentes do domínio
```

**Consequência prática:** para entender um requisito, você abre **uma** pasta. Nada se espalha.

## 📂 Estrutura root

```text
meu-projeto/
├── src/
│   ├── app/          # ROTEAMENTO (só roteia, zero regra de negócio)
│   ├── features/     # 🌟 SLICES DE DOMÍNIO
│   ├── shared/       # Genérico compartilhado
│   │   ├── ui/       # Design system (shadcn)
│   │   ├── lib/      # Helpers puros
│   │   ├── server/   # server-only: db, auth, env, logger
│   │   └── hooks/    # Hooks transversais
│   └── proxy.ts      # Network boundary (opcional)
├── SDD/              # As regras (submodule) ← o que o agente lê
├── tests/            # unit/ integration/ e2e/
└── public/
```

## 🔀 Fluxo de uma requisição

```text
Browser
  ↓
proxy.ts (rede: redirect, rewrite)  ← NÃO é segurança
  ↓
app/…/page.tsx  (Server Component)
  ↓
features/x/queries.ts   (leitura, com 'use cache' se cabível)
  ↓
features/x/application/ (use case)
  ↓
features/x/infrastructure/ (Prisma / API externa)
  ↓
render (PPR: shell estático + conteúdo dinâmico)
```

```text
Browser <form action={…}>
  ↓
app/…/page.tsx  (Server Action) — auth → zod → autorização → use case → cache
  ↓
revalidate / updateTag
  ↓
re-render do shell
```

## 🧩 Shared vs Feature — a régua de decisão

| Pergunta                                   | Resposta                            |
| ------------------------------------------ | ----------------------------------- |
| "Isso é genérico e não é de um domínio?"  | `shared/`                           |
| "Só este domínio usa?"                     | `features/<dominio>/`               |
| "Precisa de DB/rede/segredo?"              | `infrastructure/` (ou `shared/server`) |
| "É UI primitiva (Button, Dialog)?"         | `shared/ui/`                        |
| "É UI com regra de negócio?"               | `features/<dominio>/ui/`            |

**Proibido:** `features/a` importando `features/b`. Se precisar, extraia para `shared/` ou use evento de domínio.

## 📏 Onde cada tipo de código mora

| Tipo | Local | Por quê |
| --- | --- | --- |
| Regra de negócio | `features/x/application/` | Testável, isolada, sem Next |
| Contrato de domínio | `features/x/domain/` | Zero dependência (inverte a direção) |
| SQL / Prisma query | `features/x/infrastructure/` | Trocável sem tocar no domínio |
| Server Action | `features/x/actions.ts` | Entrada de escrita, com auth+validação |
| Query (leitura) | `features/x/queries.ts` | Entrada de leitura, com cache |
| Componente de rota | `app/…/page.tsx` | Só layout + composição |
| Config global (env, db, auth) | `shared/server/` | Ponto único de boot |
| Token de design | `app/globals.css` | Fonte única do tema |

## 🧪 Testabilidade

A arquitetura existe para isso: **`application/` e `domain/` não importam Next nem Prisma.** Você instancia o use case com um repositório falso e testa em 5ms.

```ts
const useCase = new CreateExampleUseCase(fakeRepo);
```

## 🚫 Anti-padrões estruturais

| ❌ | ✅ |
| --- | --- |
| `src/utils/`, `src/services/`, `src/models/` (pastas genéricas) | `features/<dominio>/` |
| Lógica de negócio em `page.tsx` | `page.tsx` delega para use case |
| `features/a` importando `features/b` | `shared/` ou evento |
| `types/` global com tipo de domínio | `I*.ts` dentro do slice |
| Prisma importado em Server Component | via `queries.ts` |
| CSS inline / hex literal | tokens do [DESIGN.md](./DESIGN.md) |
| API route para tudo | Server Action para mutação de UI |

## 🧭 Complementary: Node.js

O App Router cobre web. **Node.js puro** entra **só** para o que o App Router não faz: worker de fila, cron, consumer de webhook pesado, CLI de batch. Ver [NODE.md](./NODE.md).
