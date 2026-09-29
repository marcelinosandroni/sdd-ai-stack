# ⚛️ NEXT.JS — REGRAS OFICIAIS (STACK PADRÃO)

> **STACK PADRÃO DESTE TEMPLATE.** Toda aplicação nova sai em Next.js.
> Node.js puro (workers, CLIs, cron, webhooks) é **complemento**, não o padrão — ver [NODE.md](./NODE.md).
> Alvo de versão: **Next.js 16** (App Router, React 19.2, Turbopack).

---

## 🧭 1. ROTEADOR (leia só o que precisa)

| Você está fazendo...                              | Leia                     |
| ------------------------------------------------- | ------------------------ |
| Criando página/rota                              | §2 Estrutura, §3 Server |
| Buscando dados                                    | §4 Data                  |
| Escrevendo mutação (create/update/delete)         | §5 Server Actions        |
| Mexendo em cache                                  | §6 Cache Components      |
| Autenticação / rota protegida                    | §7 Segurança             |
| Criando API para terceiro                        | §8 Route Handlers        |
| Formulário                                        | §9 Forms                 |
| Metadata / SEO                                    | §10 Metadata             |
| Desempenho                                        | §11 Performance          |
| Testes                                            | [stacks/testing.md](./stacks/testing.md) |

---

## 📂 2. ESTRUTURA DE PASTAS

Enxuta, Next-first. **Não existe `client/` nem `server/` separado** — o App Router já é a fronteira.

```text
src/
├── app/                    # ROTEAMENTO (só isto é "framework")
│   ├── (marketing)/        # Route groups (não afetam a URL)
│   ├── (app)/              # Área logada
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx     # Skeleton/Suspense fallback
│   │   ├── error.tsx       # Error Boundary (precisa ser "use client")
│   │   └── not-found.tsx
│   ├── api/                # Route Handlers (exceção, não padrão)
│   ├── proxy.ts            # Network boundary (substitui middleware.ts)
│   ├── layout.tsx          # Root layout: <html>, fontes, metadata base
│   └── globals.css         # Tokens do DESIGN.md via @theme
│
├── features/               # 🌟 SLICES DE DOMÍNIO (a fatia vertical)
│   └── billing/
│       ├── domain/         # Entidades, value objects, contratos (I*.ts)
│       ├── application/    # Use cases, services, orquestração
│       ├── infrastructure/ # Prisma, HTTP clients, filas, storage
│       ├── actions.ts      # Server Actions (entrypoint de mutação)
│       ├── queries.ts      # Leitura (entrypoint de query)
│       ├── schemas.ts      # Zod: validação de entrada
│       └── ui/             # Componentes do domínio (client ou server)
│
├── shared/                 # Genérico compartilhado entre features
│   ├── ui/                 # Design system (shadcn + customizados)
│   ├── lib/                # Helpers puros (cn, formatadores)
│   ├── server/             # server-only: db, auth, config, logger
│   └── types/              # Tipos GLOGAIS de infra (não de domínio)
│
├── proxy.ts                # OU na raiz, se preferir (só 1 arquivo)
└── DI/
    └── container.ts        # Container de DI manual (server-side)
```

### Regras de ouro da estrutura
1. **`app/` só roteia.** Ele delega para `features/`. Nenhuma regra de negócio dentro de `page.tsx`.
2. **Feature não importa feature.** Precisa de algo de outra? Promova a extração para `shared/` ou evento de domínio.
3. **Interface (`I*.ts`) mora dentro do slice, junto da implementação.** Proibido `src/types/` global de domínio.
4. **UI de domínio vive em `features/*/ui/`.** `shared/ui/` é para o que é genérico de verdade (Button, Modal, Input).
5. **Route Handler é exceção.** Pense 10x antes de criar `/api`. Server Action é o padrão para mutação da própria UI.

---

## 🧊 3. SERVER-FIRST (a regra que mais economiza bundle)

| Situação                              | Diretiva          | Onde fica                    |
| ------------------------------------- | ----------------- | ---------------------------- |
| Layout, página, listagem, form estático | (nenhuma)         | **Server Component**         |
| Busca de dados no render              | (nenhuma)         | **Server Component**         |
| Botão com `onClick`, input controlado | `"use client"`    | Client Component             |
| `useState`, `useEffect`, `useRef`     | `"use client"`    | Client Component             |
| Integração com lib de browser         | `"use client"`    | Client Component             |

### Regras
1. **O padrão é Server Component.** `"use client"` é uma decisão deliberada, não automática.
2. **O `"use client"` só pode estar na folha mais baixa possível.** Se ele sobe, ele **arrasta a árvore inteira** para o bundle do cliente. Errou? Extraia o trecho interativo para um arquivo só.
3. **Client Component só pode passar para Server Component: `children`, `action` (bound), e dados serializáveis.** Jamais uma função comum, nunca um objeto de DI.
4. **Proibido `useEffect` para buscar dados.** Se precisa buscar, é Server Component ou Server Action.
5. **Event handler que é uma requisição ao servidor → `<form action={serverAction}>`**, não `onClick` + `fetch`.

### Exemplo do padrão "folha cliente"
```tsx
// features/billing/ui/subscribe-button.tsx
"use client";
import { useFormStatus } from "react-dom";
import { subscribeAction } from "../actions";

// ✅ FOLHA: só isto vai pro bundle do cliente
export function SubscribeButton({ planId }: { planId: string }) {
  return (
    <form action={subscribeAction.bind(null, planId)}>
      <button type="submit" className="btn-primary">
        <SubmitLabel />
      </button>
    </form>
  );
}

function SubmitLabel() {
  const { pending } = useFormStatus();
  return <span>{pending ? "Processando..." : "Assinar"}</span>;
}
```

```tsx
// app/(app)/billing/page.tsx  — continua NO SERVER
import { SubscribeButton } from "@/features/billing/ui/subscribe-button";

export default async function BillingPage() {
  const subscription = await getSubscription(); // direto, sem useEffect
  return (
    <main>
      <PlanList />
      <SubscribeButton planId={subscription.planId} />
    </main>
  );
}
```

---

## 📦 4. DATA LAYER

1. **Toda leitura passa por `features/*/queries.ts`.** Nenhum `fetch`/Prisma direto em `page.tsx`.
2. **Query = função `async` simples.** Sem react-query no server. O cache é do Next (§6).
3. **Client-side com estado remoto e interativo → TanStack Query.** Mas a fonte da verdade é o servidor; se não precisa de optimistic/background refetch, nem use.
4. **`unstable_cache` / `revalidate` do modelo antigo = PROIBIDO.** Vai para `'use cache'`.
5. **Tipagem no limite:** todo retorno de repository/query é tipado. `any` é proibido em fronteira.

```ts
// features/billing/queries.ts
import "server-only";
import { db } from "@/shared/server/db";
import { cache } from "react";

export const getSubscription = cache(async (userId: string) => {
  return db.subscription.findUnique({ where: { userId } });
});
```

> `cache()` do React deduplica a mesma chamada dentro do mesmo render. Use à vontade.

---

## ⚡ 5. SERVER ACTIONS

```ts
// features/billing/actions.ts
"use server";
import { z } from "zod";
import { requireUser } from "@/shared/server/auth";
import { db } from "@/shared/server/db";
import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";

const SubscribeSchema = z.object({
  planId: z.string().min(1),
  coupon: z.string().optional(),
});

export async function subscribeAction(_prev: State, formData: FormData) {
  // 1. AUTENTICAÇÃO — primeira linha, sempre
  const user = await requireUser();

  // 2. VALIDAÇÃO — Zod no server é a ÚNICA fonte de verdade
  const parsed = SubscribeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  // 3. AUTORIZAÇÃO (foco/objeto) — depois da auth, antes do dado
  if (user.role === "banned") {
    return { ok: false, error: "Acesso negado" };
  }

  // 4. MUTAÇÃO via use case da camada application (nada de regra aqui)
  await new CreateSubscriptionUseCase(db).execute({ userId: user.id, ...parsed.data });

  // 5. CACHE — read-your-writes em UI interativa
  updateTag(`subscription-${user.id}`);
  revalidatePath("/billing");

  return { ok: true };
}
```

### Regras de Server Actions
1. **São endpoints HTTP públicos.** Tudo que é validação/auth que importa TEM que ser dentro da action. Nunca confie no form.
2. **Ordem fixa:** `auth → validação → autorização → mutação → cache`.
3. **Input sempre via Zod.** `FormData`, `searchParams`, `params` e JSON do body entram crus.
4. **Nunca exponha objeto de DB.** Faça `select` explícito do que a UI precisa.
5. **Erro: retorne estado, não lance.** `throw` só para erro inesperado (vai pro `error.tsx`).
6. **`revalidateTag(tag)` (1 arg) está DEPRECIADO.** Use `revalidateTag(tag, 'max')` ou `updateTag(tag)` em actions.
7. **Ação só pode importar de `features/*` e `shared/`.** Nunca de `app/`.

---

## ⚡ 6. CACHE COMPONENTS (Padrão Next 16)

Ative no `next.config.ts`:
```ts
const nextConfig = { cacheComponents: true };
export default nextConfig;
```

| Quero...                                   | Use                                     |
| ------------------------------------------ | --------------------------------------- |
| Cache de leitura (HTML shell)              | `'use cache'` + `cacheLife('max')`      |
| Marcar cache para invalidação              | `cacheTag('user-123')`                  |
| Invalidação com leitura na mesma request   | `updateTag('user-123')` (só em Action)  |
| SWR (usuário vê velho, revalida em bg)      | `revalidateTag('tag', 'max')`           |
| Atualizar dado NÃO cacheado (contador, etc) | `refresh()` (só em Action)              |
| Given time-varying (agora, Math.random)     | `connection()` + `<Suspense>`           |

**PROIBIDO:** `export const dynamic`, `export const revalidate`, `export const fetchCache`, `unstable_cache`, `fetch(..., { next: { revalidate } })`. Todos substituídos pelo modelo acima.

```ts
// ✅ Correto
export async function getBlogPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");
  return db.post.findMany();
}

// ❌ Proibido
export const revalidate = 3600;
```

**Regra de ouro:** `use cache` o mais perto possível da leitura. Envolva a página inteira só como último recurso.

---

## 🔐 7. SEGURANÇA

1. **`proxy.ts` NÃO é fronteira de segurança.** É otimização de UX (redirect rápido). Por causa do CVE-2025-29927, o header interno `x-middleware-subrequest` é confiavel por padrão — **nunca** confie nele.
2. **Autorização vai na camada de dado.** `requireUser()` / `requireRole()` dentro de cada action/query, o mais perto possível do banco.
3. **Zero validação só no client.** Client-side Zod é UX. O Zod do servidor é segurança.
4. **Env:** `NEXT_PUBLIC_*` vai pro bundle do browser. Nunca coloque secret lá. Valide env com Zod em `shared/server/env.ts` no boot.
5. **Imagens remotas:** só `images.remotePatterns` no `next.config.ts`. `images.domains` está deprecado.
6. **Server-only:** adicione `import "server-only"` no topo de todo módulo com credencial/DB.
7. **`next/image` com `src` local + query string** exige `images.localPatterns`. Sem isso, quebrou.

---

## 🔌 8. ROUTE HANDLERS (`app/api/*/route.ts`)

Use **só** para: webhook de terceiro, endpoint público de terceiro, ou download de arquivo.
Para o resto: Server Action.

```ts
// app/api/webhooks/stripe/route.ts
import { z } from "zod";
import { headers } from "next/headers";

const StripeEvent = z.object({ id: z.string(), type: z.string() });

export async function POST(request: Request) {
  const raw = await request.text();                    // ← assinatura precisa do corpo cru
  const parsed = StripeEvent.safeParse(JSON.parse(raw));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  await new ProcessStripeEventUseCase(db).execute(parsed.data);
  return Response.json({ received: true });
}
```

Regras: valide **tudo** (inclusive o body cru), sempre responda com `Response.json`, `await` em `headers()`/`cookies()`, e nunca exponha stack trace.

---

## 📝 9. FORMS

1. **Padrão:** `<form action={serverAction}>` com `useFormStatus` para o loading. Zero JS de estado.
2. **Precisa de controlled input / validação ao vivo?** → Client Component isolado com `useActionState`.
3. **Erro de campo** renderize **próximo ao campo**, com `aria-invalid` e `aria-describedby`.
4. **Desabilite o botão no `pending`.** Sem duplo submit.
5. **Sucesso:** `toast` (shadcn `sonner`) + `updateTag`/`revalidatePath`. Erro: toast vermelho + mensagem no formulário.

---

## 🔍 10. METADATA & SEO

```ts
// app/(marketing)/page.tsx
export const metadata: Metadata = {
  title: { default: "Marca", template: "%s | Marca" },
  description: "...",
};
export async function generateMetadata({ params }): Promise<Metadata> { /* por rota */ }
```
- `metadata` **sempre estático** quando possível. `generateMetadata` só quando o dado é o assunto da rota.
- `params` e `searchParams` são **Promises** no Next 16: `const { slug } = await params;`
- Cacheie o que for possível: `async function getMetadata(){ "use cache"; cacheLife('hours'); ... }`
- `viewport` e `themeColor` vão no `viewport` export, não em `metadata`.
- Gera `sitemap.ts` e `robots.ts` em `app/`.

---

## ⚡ 11. PERFORMANCE

| Regra | Como |
| --- | --- |
| `next/image` sempre, com `sizes` explícito em grid/list | `<Image src fill sizes="(max-width:768px) 100vw, 33vw" />` |
| `next/font` para tudo (zero layout shift, zero request externo) | `import { Manrope, JetBrains_Mono } from "next/font/google"` |
| `next/link` para navegação interna | `<Link href>` |
| `Suspense` no limite, não na página inteira | streamed shell |
| `use cache` em tudo que é leitura de DB em rota estável | §6 |
| Bundle client mínimo | `"use client"` na folha (§3) |
| Analise antes de otimizar | `next build` mostra o custo de cada rota |

---

## 🚨 ARMADILHAS DO NEXT 16 (não caia nelas)

1. `params`/`searchParams` são **async**. `const { id } = params` → undefined silencioso.
2. `cookies()`, `headers()`, `draftMode()` são **async**.
3. `middleware.ts` foi **renomeado para `proxy.ts`** (função exportada `proxy`). `middleware.ts` é ignorado em silêncio no build.
4. `revalidateTag(tag)` de 1 argumento está **depreciado**.
5. `next lint` **foi removido**. Use Biome/ESLint direto.
6. Turbopack é o **padrão**. `--webpack` só em Emergency Exit.
7. Parallel routes exigem `default.js` explícito, senão **o build falha**.
8. Route segment configs (`dynamic`, `revalidate`, `fetchCache`) **não existem** com `cacheComponents`.
9. `images.domains` → `images.remotePatterns`.
10. AMP removido. `next/legacy/image` removido.

---

## 📎 REGRAS complementares

- **Node.js puro (workers, cron, filas, webhooks pesados):** [NODE.md](./NODE.md)
- **React (quando a lógica é puramente de componente):** [REACT.md](./REACT.md)
- **Design/UI:** [DESIGN.md](./DESIGN.md)
- **TypeScript, Tailwind, shadcn, testes:** [stacks/](./stacks/README.md)
