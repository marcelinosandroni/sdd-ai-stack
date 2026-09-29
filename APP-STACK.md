# 🧠 APP-STACK (qual stack este app usa)

> **Ponteiro de stack.** O agente lê o doc aqui e abre o arquivo de regras correspondente.
> Trocar este arquivo é **automático** (é configuração do projeto). Trocar as regras em si, **não**.

---

## 🎯 Stack ativa

| Papel | Stack | Documento de regras |
| --- | --- | --- |
| **App (frontend + backend)** | **Next.js 16** — App Router | [NEXT.md](./NEXT.md) ⭐ **STACK PADRÃO** |
| **UI library** | shadcn/ui + Tailwind CSS v4 | [stacks/shadcn.md](./stacks/shadcn.md) · [stacks/tailwind.md](./stacks/tailwind.md) |
| **Linguagem** | TypeScript (strict) | [stacks/typescript.md](./stacks/typescript.md) |
| **Backend extra** | Node.js puro (workers, cron, filas) | [NODE.md](./NODE.md) |
| **Banco de dados** | Prisma ORM | [stacks/database.md](./stacks/database.md) |
| **Validação** | Zod | [stacks/typescript.md](./stacks/typescript.md) |
| **Testes** | Vitest + Playwright | [stacks/testing.md](./stacks/testing.md) |
| **IA / LLM** | (se o app usar) | [stacks/ai.md](./stacks/ai.md) |
| **Deploy** | Vercel | [stacks/ci.md](./stacks/ci.md) |
| **Versionamento** | Git + Conventional Commits | [stacks/git.md](./stacks/git.md) |

---

## 🔀 Como trocar a stack do app

1. Edite a tabela acima com a stack real deste projeto.
2. Se usar uma stack que não tem doc aqui, crie `SDD/stacks/<stack>.md` seguindo o padrão dos outros.
3. **Não mexa** em `AGENTS.md` §1 (que aponta o doc padrão) sem pedir ao humano.

> Enquanto `APP-STACK.md` apontar para `NEXT.md`, a stack padrão do template é Next.js.
