# ⚛️ REACT (complemento)

> **O padrão NÃO é React Client.** Next.js 16 usa **Server Components** por padrão.
> Leia este doc só quando o problema for de **componente/estado de cliente**, não de servidor.
> Regras de Next.js: [NEXT.md](./NEXT.md) §3 (Server-First).

## 🧭 Roteador

| Situação | Faça |
| --- | --- |
| Busca de dado no render | **Server Component.** Nem precisa deste doc. |
| Mutação vinda de formulário | **Server Action** ([NEXT.md](./NEXT.md) §5) |
| Só o botão tem `onClick` | Folha `"use client"` isolada (§3 do NEXT.md) |
| Estado local de UI (abrir/fechar) | `useState` neste arquivo |
| Estado que sobrevive a rota | Cookie/DB, não contexto |
| Cache remoto com optimistic update | TanStack Query (`@tanstack/react-query`) |
| Zustand/Redux | **Evite.** Substitua por props, contexto local ou `cache()` do React |

## 🚨 Regras não-negociáveis

1. **Server Component é o padrão.** `"use client"` é exceção deliberada — sempre na folha mais baixa (ver [NEXT.md](./NEXT.md) §3).
2. **Server Component pode ser async; Client Component NÃO pode** (exceto com `use()`, dentro de Suspense).
3. **Client Component nunca importa módulo `server-only`.** Isso quebra o build — e é o objetivo.
4. **Props de Server → Client precisam ser serializáveis.** Nada de função, class, Date é preciso (Date vira string).
5. **`useEffect` não busca dado.** Ele sincroniza efeito colateral. Busca = Server Component / Server Action.
6. **Estado é do mais local possível:** `useState` > contexto > store global.
7. **Lista com key estável, nunca índice.**
8. **Componente cliente pequeno e burro.** Lógica vai pro use case (`features/`).

## 🪝 Hooks — regras do React 19.2

```tsx
// ✅ Coloca hooks antes de qualquer return condicional
function Panel({ open }: { open: boolean }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => { /* sync externo */ }, [open]);
  if (!open) return null;
  return <div>{tab}</div>;
}

// ✅ Lógica não-reativa isolada em useEffectEvent
useEffectEvent(() => { onSubmitRef.current(value); });

// ✅ Atividade em background sem desmontar estado
<Activity mode="hidden">…</Activity>
```

| Hook | Use para | Não use para |
| --- | --- | --- |
| `useState` | estado local de UI | estado derivado (calcule na render) |
| `useReducer` | máquina de estado complexa | 2 estados booleanos |
| `useEffect` | sincronizar com sistema externo (DOM, socket, subscription) | buscar dado, derivar estado |
| `useMemo` | cálculo caro | performance "por garantia" |
| `useCallback` | dep de hook/estabilizar referência | performance "por garantia" |
| `useContext` | dado de UI compartilhado na subárvore | estado global de domínio |
| `useOptimistic` | UI otimista em Server Action | cache geral |

> **React Compiler está ligado** no template (`reactCompiler: true` no `next.config.ts`). `useMemo`/`useCallback` manuais são, na maioria das vezes, ruído.

## 🧩 Composição

1. **Compound components** para UI complexa (`<Select>`, `<SelectItem>`). Menos props, mais API.
2. **Composição > configuração.** 3 componentes pequenos > 1 com 15 props booleanas.
3. **Server Component compose Client Components** ("children pattern"):

```tsx
// ✅ Passa markup, não função
<Shell sidebar={<ServerRenderedSidebar />}>
  <InteractiveChart />
</Shell>
```

## 📁 Onde cada coisa mora

| Tipo | Caminho |
| --- | --- |
| UI primitiva genérica | `src/shared/ui/` |
| UI com regra de negócio | `src/features/<x>/ui/` |
| Hook transversal | `src/shared/hooks/` |
| Provider de contexto | junto do hook que consome |

## 🚫 Anti-padrões

| ❌ | ✅ |
| --- | --- |
| `"use client"` no topo do layout/page | folha isolada |
| `useEffect` + `fetch` para buscar dado | Server Component / Action |
| Zustand/Redux para estado de servidor | `cache()` do React / Server |
| Props drilling de 5 níveis | contexto local ou composição |
| `key={index}` em lista | id estável |
| `useMemo` em tudo | deixe o Compiler fazer |
| Context com objeto que muda a cada render | separe value e actions |
