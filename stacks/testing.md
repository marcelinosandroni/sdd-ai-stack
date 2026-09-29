# 🧪 TESTES

> Meta: **100% de cobertura nos fluxos críticos** (use cases, actions, mutations). UI visual tem E2E obrigatório.

## 📐 Pirâmide do projeto

| Tipo | Ferramenta | Onde | Quantos |
| --- | --- | --- | --- |
| **Unit** | Vitest | `tests/unit` | use cases, helpers puros, validações |
| **Integração** | Vitest + DB mock | `tests/integration` | repositórios, actions, server components |
| **E2E** | Playwright | `tests/e2e` | fluxo real do usuário ponta a ponta |

## 🚨 Regras não-negociáveis

1. **Toda task precisa de teste.** Sem teste = task não está pronta. ([../specs/PLAN.md](../specs/PLAN.md) e Definition of Done)
2. **Mokar dados, nunca chamar API de terceiro real** em teste unitário/integração. E2E pode usar sandbox.
3. **Nome do teste descreve comportamento**, não implementação: `deve_negar_acesso_quando_usuario_bloqueado` > `teste2`.
4. **Teste de UI = E2E com Playwright.** Não teste componente por snapshot (snapshot é mentira).
5. **Prova de vida obrigatória:** pra marcar task `[x]`, cole o output verde do terminal na resposta.
6. **E2E precisa de evidência visual:** screenshot ou trace anexado.

## 🧩 Exemplo — unit de use case

```ts
// tests/unit/features/billing/create-subscription.test.ts
import { describe, it, expect, vi } from "vitest";
import { CreateSubscriptionUseCase } from "@/features/billing/application/create-subscription";

describe("CreateSubscriptionUseCase", () => {
  it("deve_negar_acesso_quando_usuario_bloqueado", async () => {
    const repo = { create: vi.fn() };
    const useCase = new CreateSubscriptionUseCase(repo as never);
    await expect(
      useCase.execute({ userId: "u1", planId: "p1", blocked: true }),
    ).rejects.toThrow("Acesso negado");
    expect(repo.create).not.toHaveBeenCalled();
  });
});
```

## 🧩 Exemplo — E2E Playwright

```ts
// tests/e2e/billing.spec.ts
import { test, expect } from "@playwright/test";

test("usuário assina um plano e vê o status", async ({ page }) => {
  await page.goto("/billing");
  await page.getByRole("button", { name: "Assinar Pro" }).click();
  await expect(page.getByTestId("subscription-status")).toHaveText("Ativo");
  await page.screenshot({ path: "tests/e2e/screenshots/billing-ativo.png" });
});
```

## ▶️ Comandos

```bash
cd client   # ou a raiz, dependendo do template
npm run test:unit        # Vitest watch
npm run test:unit -- --run   # uma passada
npm run test:coverage    # cobertura
npm run test:e2e         # Playwright
npm run test:e2e:ui      # Playwright com UI
```

## 🚫 Anti-padrões

| ❌ | ✅ |
| --- | --- |
| Testar implementação (mock demais) | Testar comportamento observável |
| Snapshot de componente inteiro | E2E com `getByRole` |
| sleep fixo (`waitForTimeout`) | `await expect(...).toBeVisible()` (auto-wait) |
| `test.skip` silencioso | Issue registrada |
| Sem mock de terceiro (gastando $$) | MSW / fake local |
