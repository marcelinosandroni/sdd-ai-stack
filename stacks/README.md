# 🧱 STACKS — REGRAS POR LINGUAGEM E FERRAMENTA

> **Leia o índice, depois abra só o arquivo do que você está tocando.**
> Stack padrão do projeto: **[Next.js](../NEXT.md)**. React e Node são complementos.

## 📇 Índice

| Arquivo | Quando abrir |
| --- | --- |
| [typescript.md](./typescript.md) | Tipos, interfaces, genéricos, strict mode |
| [tailwind.md](./tailwind.md) | Estilo, tokens, classes utilitárias |
| [shadcn.md](./shadcn.md) | Componentes de UI, primitives, variações |
| [testing.md](./testing.md) | Unit, integração, E2E, cobertura |
| [database.md](./database.md) | Prisma, migrations, queries, transações |
| [ai.md](./ai.md) | Integrações com LLM/IA, streaming, tokens |
| [git.md](./git.md) | Commits, branches, PRs, releases |
| [ci.md](./ci.md) | GitHub Actions, lint, typecheck, deploy |

## 🎯 Módulos de regra fora desta pasta

| Arquivo | Escopo |
| --- | --- |
| [../NEXT.md](../NEXT.md) | Next.js 16 (App Router, RSC, Cache Components) — **PADRÃO** |
| [../NODE.md](../NODE.md) | Node.js puro (workers, cron, filas, scripts) |
| [../REACT.md](../REACT.md) | React (hooks, estado, composição) |
| [../DESIGN.md](../DESIGN.md) | Design system completo (tokens, tipografia, componentes) |
| [../ARCHITECTURE.md](../ARCHITECTURE.md) | Arquitetura global e vertical slices |

## 🚫 Regra de ouro

> **Antes de instalar qualquer lib, prove que o nativo resolve.**
> `fetch` > axios. `<dialog>` > lib de modal. CSS > tailwind plugin.
> Se a lib entrar, ela entra com uma nota em `docs/CHANGELOG.md` explicando o porquê.
