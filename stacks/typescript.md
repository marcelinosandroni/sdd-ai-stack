# 🔷 TYPESCRIPT

## 🚨 Regras não-negociáveis

1. **`strict: true` é obrigatório.** Sem exceção. `tsconfig.json` do template já vem assim.
2. **`any` é PROIBIDO** no código de produção. Se você não dá, use `unknown` + narrowing.
3. **Interface (`I*`) mora junto da implementação**, dentro do slice. Nada de pasta global de tipos.
4. **`type` para união/interseção, `interface` para contrato de classe.** Consistência acima de preferência.
5. **Funções que recebem `unknown` da fronteira validam com Zod dentro da mesma função.**
6. **Retorno sempre explícito** em função exportada quando não for óbvio.
7. **`as` só com justificativa em comentário.** Se precisa de `as`, o modelo está errado.

## 🧩 Padrões

```ts
// ✅ Contrato de domínio (dentro de features/x/domain/)
export interface IChatRepository {
  save(userId: string, text: string): Promise<ChatMessage>;
}

// ✅ Validação de fronteira
import { z } from "zod";
const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(120),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

## 🚫 Proibido

| Padrão | Por quê | Use em vez disso |
| --- | --- | --- |
| `any` | some o type-check | `unknown` + guard |
| `enum` | complica serialização e narrow | `as const` + uniões literais |
| `!` non-null assertion | estouro em runtime | optional chaining + early return |
| `as unknown as T` | compilador não entendeu | reescreva o tipo |
| `namespace` | colisões + bundle | `module` ou escopo de pasta |
| `function` em vez de arrow | ruído | arrow function (exceto método de classe) |
| `@ts-ignore` | debt invisível | `@ts-expect-error` + comentário |

## 📐 Configuração mínima do template

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // index access seguro
    "noImplicitOverride": true,        // todo override explícito
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,      // type-only import obrigatório
    "paths": { "@/*": ["./src/*"] }
  }
}
```

> `verbatimModuleSyntax` obriga `import type { X } from ...`. Isso é de propósito: mantém o bundle limpo.
