# 🧪 TESTING

> Goal: **100% coverage on the critical paths** (use cases, actions, mutations).
> Visual UI requires a mandatory E2E test.
> Spine: [clean-code.md](./clean-code.md) \u00a79 \u2014 fakes over mocks.

## 📐 The project pyramid

| Type | Tool | Where | How many |
| --- | --- | --- | --- |
| **Unit** | Vitest | `tests/unit` | use cases, pure helpers, validation |
| **Integration** | Vitest + DB mock | `tests/integration` | repositories, actions, server components |
| **E2E** | Playwright | `tests/e2e` | the real user flow, end to end |

## 🚨 Non-negotiable rules

1. **Every task needs a test.** No test = the task is not done. (See
   [../specs/PLAN.md](../specs/PLAN.md) and the Definition of Done.)
2. **Mock the data, never call a real third-party API** in a unit/integration test.
   E2E may use a sandbox.
3. **The test name describes behaviour, not implementation:**
   `deve_negar_acesso_quando_usuario_bloqueado` > `teste2`.
4. **UI test = E2E with Playwright.** Don't snapshot a component (a snapshot is a lie).
5. **Proof of life is mandatory:** to mark a task `[x]`, paste the green terminal output
   in the reply.
6. **E2E needs visual evidence:** a screenshot or a trace attached.

## 🧩 Example — use case unit test

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
    ).rejects.toThrow("Access denied");
    expect(repo.create).not.toHaveBeenCalled();
  });
});
```

## 🧩 Example — Playwright E2E

```ts
// tests/e2e/billing.spec.ts
import { test, expect } from "@playwright/test";

test("user subscribes to a plan and sees the status", async ({ page }) => {
  await page.goto("/billing");
  await page.getByRole("button", { name: "Subscribe to Pro" }).click();
  await expect(page.getByTestId("subscription-status")).toHaveText("Active");
  await page.screenshot({ path: "tests/e2e/screenshots/billing-active.png" });
});
```

## ▶️ Commands

```bash
cd client   # or the root, depending on the template
npm run test:unit        # Vitest watch
npm run test:unit -- --run   # single pass
npm run test:coverage    # coverage
npm run test:e2e         # Playwright
npm run test:e2e:ui      # Playwright with the UI
```

## 🚫 Anti-patterns

| ❌ | ✅ |
| --- | --- |
| Testing implementation (mocking too much) | Testing observable behaviour |
| A full component snapshot | E2E with `getByRole` |
| A fixed sleep (`waitForTimeout`) | `await expect(...).toBeVisible()` (auto-wait) |
| A silent `test.skip` | a filed issue |
| No third-party mock (burning money) | MSW / a local fake |
