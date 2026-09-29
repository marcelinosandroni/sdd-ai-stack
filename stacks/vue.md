# 💚 VUE

> **Vue's default is the right default.** Reach for Pinia only when you need to.
> Language: [javascript.md](./javascript.md). Spine: [clean-code.md](./clean-code.md).

---

## 🎯 Versions

| Piece | Version |
| --- | --- |
| Vue | 3.5+ (`useTemplateRef`, destructureable props) |
| Build | Vite 6+ |
| Router | Vue Router 4 |
| State | `ref`/`reactive`/`computed` first. Pinia only for shared state |
| Types | `<script setup lang="ts">` with `defineProps<T>()` |

> **Never Options API** in new code. Composition API everywhere, uniformly.

---

## 🚨 Rules

1. **`<script setup>` only.** No `export default {}`.
2. **One component per file.** `InvoiceCard.vue`, never `Invoices.vue` with three things.
3. **`ref` for primitives, `reactive` for objects.** `reactive` returns a proxy and
   unwrapping surprises people. Default to `ref`.
4. **`computed` for anything derived.** Never a watcher that copies a value.
5. **`watch` only for side effects** (fetch, localStorage, analytics). A watcher that
   assigns to another ref is a bug generator.
6. **Props are readonly.** Never `props.x = y`. Emit an event instead.
7. **Destructure props** in Vue 3.5+ when you need reactivity; otherwise
   `props.x` in the template.
8. **`defineEmits` with a typed payload.** `defineEmits<{ select: [id: string] }>()`.
9. **`defineModel`** for two-way binding instead of manual `modelValue` + `update:`.
10. **`key` on every `v-for`.** `v-for="i in list" :key="i.id"`. Never the index.
11. **No Options API, no `Vue.observable`, no `Vue.extend`.**
12. **No TS in a template without understanding it** — `lang="ts"` is mandatory.
13. **Composables named `useX`** and holding one responsibility each, in `composables/`.
14. **Provide/inject with a typed InjectionKey**, never a raw string.
15. **No Pinia for server state.** Fetch in the composable; a cache library (TanStack
    Query) or a simple `ref` is enough. Pinia is client state, not a server cache.

---

## 📂 Layout

```text
src/
├── features/
│   └── billing/
│       ├── components/
│       │   ├── InvoiceCard.vue
│       │   └── InvoiceList.vue
│       ├── composables/
│       │   └── useInvoices.ts
│       ├── api/
│       │   └── invoices.ts        # fetch + mappers
│       ├── types.ts
│       └── routes.ts
├── shared/
│   ├── components/               # generic only
│   └── composables/
├── domain/                       # pure. no vue import
└── main.ts
```

---

## 🎯 Component contract

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { useInvoices } from "../composables/useInvoices";

const { invoices, loading, error } = useInvoices();

const emit = defineEmits<{ select: [id: string] }>();

const totalMinor = computed(() =>
  invoices.value.reduce((sum, invoice) => sum + invoice.amountMinor, 0),
);
</script>

<template>
  <section>
    <p v-if="loading">Loading…</p>
    <p v-else-if="error" role="alert">{{ error.message }}</p>
    <ul v-else>
      <li v-for="invoice in invoices" :key="invoice.id">
        <InvoiceCard :invoice="invoice" @select="emit('select', $event)" />
      </li>
    </ul>
    <p>Total: {{ totalMinor }}</p>
  </section>
</template>
```

**`v-if`/`v-else-if`/`v-else` on the state, not scattered around the template.** One branch
per state, and the states are exhaustive.

---

## 🧩 Composables

```ts
// composables/useInvoices.ts
import { ref, shallowRef } from "vue";
import { listInvoices } from "../api/invoices";
import type { Invoice } from "../types";

export function useInvoices() {
  const invoices = shallowRef<Invoice[]>([]);
  const loading = ref(false);
  const error = shallowRef<Error | null>(null);

  async function reload(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      invoices.value = await listInvoices();
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error("unknown", { cause });
      throw error.value;                 // rethrow: let the caller decide
    } finally {
      loading.value = false;
    }
  }

  return { invoices: readonly(invoices), loading: readonly(loading), error: readonly(error), reload };
}
```

`shallowRef` for arrays and objects: Vue makes deep reactivity on a large list expensive
and almost never what you want.

---

## 🔌 Router

| Concern | Do | Never |
| --- | --- | --- |
| Lazy routes | `() => import("./routes")` | importing everything at boot |
| Guards | auth in `beforeEach`, authorisation in the component/composable | a global guard that fetches data |
| Data | in the composable, on mount | a global store fetch per route |
| Scroll | `scrollBehavior` in the router | manual `window.scrollTo` |
| Meta | typed via `declare module 'vue-router'` | untyped `to.meta.title as string` |

---

## 🧪 Testing

| Layer | Tool | Notes |
| --- | --- | --- |
| Composables | Vitest | plain. `ref` works outside a component |
| Component | Vitest + `@vue/test-utils` | `data-testid`, never CSS classes |
| API layer | MSW or a fetch mock | assert the request shape |
| E2E | Playwright | the real flow |

```ts
it("renders an invoice per row", async () => {
  const wrapper = mount(InvoiceList, { global: { plugins: [testRouter] } });

  await flushPromises();

  expect(wrapper.findAll('[data-testid="invoice-card"]')).toHaveLength(2);
});
```

---

## 🚫 Smells specific to Vue

| Smell | Fix |
| --- | --- |
| Options API in new code | `<script setup>` |
| `reactive` on a big object | `ref` + `shallowRef` |
| Watcher assigning to a ref | `computed` |
| Mutating a prop | emit an event |
| `v-for` without `:key` | `:key="item.id"` |
| `Vue.observable` | `ref` |
| Pinia mirroring server state | composable or a query cache |
| One file with three components | one component per file |
| `provide("theme", …)` | typed `InjectionKey<T>` |
| Deep prop watching | `watch(() => props.id, …)` |

---

## 📎 Commands

```bash
npm run build
npm run test
npm run type-check        # vue-tsc, not plain tsc
npm run lint
```
