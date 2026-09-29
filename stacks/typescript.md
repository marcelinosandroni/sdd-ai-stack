# 🔷 TYPESCRIPT

> Spine: [clean-code.md](./clean-code.md).

## 🚨 Non-negotiable rules

1. **`strict: true` is mandatory.** No exceptions. The template's `tsconfig.json`
   already does it.
2. **`any` is FORBIDDEN** in production code. If you can't type it, use `unknown` +
   narrowing.
3. **The interface (`I*`) lives next to the implementation**, inside the slice. No
   global types folder.
4. **`type` for unions/intersections, `interface` for class contracts.**
   Consistency beats preference.
5. **Any function taking `unknown` from a boundary validates it with Zod inside that
   same function.**
6. **Explicit return types** on exported functions when it isn't obvious.
7. **`as` only with a justifying comment.** If you need `as`, the model is wrong.

## 🧩 Patterns

```ts
// ✅ Domain contract (inside features/x/domain/)
export interface IChatRepository {
  save(userId: string, text: string): Promise<ChatMessage>;
}

// ✅ Validation at the boundary
import { z } from "zod";
const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(120),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
```

## 🚫 Forbidden

| Pattern | Why | Use instead |
| --- | --- | --- |
| `any` | kills type-checking | `unknown` + a guard |
| `enum` | friction with serialisation and narrowing | `as const` + a literal union |
| `!` non-null assertion | runtime crash waiting to happen | optional chaining + early return |
| `as unknown as T` | the compiler didn't understand | rewrite the type |
| `namespace` | name collisions + bundle bloat | `module`, or folder scope |
| `function` instead of an arrow | noise | arrow function (except class methods) |
| `@ts-ignore` | invisible debt | `@ts-expect-error` + a comment |

## 📐 Minimum template config

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,  // safe index access
    "noImplicitOverride": true,        // every override is explicit
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,      // type-only imports are mandatory
    "paths": { "@/*": ["./src/*"] }
  }
}
```

> `verbatimModuleSyntax` forces `import type { X } from ...`. That is on purpose: it
> keeps the bundle clean.
