# 🚀 [NOME DO SEU APP AQUI]

> ⚠️ **FOCA AQUI:** Substitua esse bloco pela descrição real da aplicação. O que ela faz? Qual problema resolve? Quem é o usuário final? Direto ao ponto, sem enrolação.

## 🏗️ Stack e Arquitetura

Este projeto segue **Spec-Driven Development** com **Next.js 16** e **Vertical Slices**.

**Leia antes de tocar em uma linha de código:**

| Documento | Escopo |
| --- | --- |
| [🤖 AGENTS.md](./AGENTS.md) | **Leis do agente + fluxo de entrega (LEIA PRIMEIRO)** |
| [🎯 specs/PLAN.md](./specs/PLAN.md) | A task que está sendo feita AGORA |
| [🧠 APP-STACK.md](./APP-STACK.md) | Qual stack este app usa (ponteiro) |
| [⚛️ NEXT.md](./NEXT.md) | Regras do Next.js 16 — **stack padrão** |
| [🟢 NODE.md](./NODE.md) | Regras do Node.js puro (workers, cron, filas) |
| [⚛️ REACT.md](./REACT.md) | Regras do React |
| [🎨 DESIGN.md](./DESIGN.md) | Design system (tokens, tipografia, componentes) |
| [🏗️ ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura global (vertical slices) |
| [🧱 stacks/](./stacks/README.md) | TypeScript, Tailwind, shadcn, testes, DB, IA, Git, CI |

## 🛠️ Stack Principal

- **App (fullstack):** Next.js 16 (App Router, Server Actions, Route Handlers)
- **UI:** React 19.2 (Server Components por padrão) + Tailwind v4 + shadcn/ui
- **Dados:** Prisma + [PostgreSQL / MySQL / SQLite]
- **Validação:** Zod
- **Testes:** Vitest (unit/integr) + Playwright (E2E)
- **Backend extra (se houver):** Node.js puro para worker/cron/fila
- **Deploy:** [Vercel / Node VPS / Railway]

---

## 📝 Detalhes Específicos do App

*(Escreva AQUI as regras de negócio únicas, integrações e fluxos que só este app tem. **Não deixe em branco**.)*

- **Integrações de Terceiros:** [Ex: OpenAI, Stripe, WhatsApp API]
- **Features Principais:**
  - [Ex: Geração de vídeo por IA]
  - [Ex: Dashboard de métricas executivas]
- **Regras Críticas de Negócio:**
  - [Ex: O usuário só pode gerar 5 vídeos por dia na conta free]
- **Entidades de Domínio:** [Liste as entidades principais e suas invariantes]
- **Regras de Autorização:** [Ex: Admin vê tudo; membro só o próprio workspace]
