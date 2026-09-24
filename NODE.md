# 🟢 NODE.JS DOCS (BACKEND)

Arquitetura baseada em **Vertical Slices**. Esqueça as camadas MVC tradicionais. Foco total no domínio.

## 📂 ESTRUTURA
`server/`
├── `api/`        - A única pasta que sabe que existe Express/Fastify/Vercel.
├── `core/`       - DB, Loggers, DI, Errors.
└── `features/`   - 🌟 Agrupamento por regra de negócio.

## 🧠 REGRAS
1. **Desacoplamento:** O `use-case` NUNCA recebe `req` ou `res`. Ele recebe dados puros e retorna dados puros.
2. **Isolamento:** Uma `feature` não importa a outra. Usem o `core` para coisas compartilhadas.

## 💻 EXEMPLO: USE CASE PURO
```typescript
// server/features/chat/use-cases/SendMessageUseCase.ts
import { IChatRepository } from '../domain/IChatRepository';

export class SendMessageUseCase {
  constructor(private repo: IChatRepository) {}

  async execute(userId: string, text: string) {
    if (!text) throw new Error("Text is required");
    // Lógica pesada de IA aqui
    return this.repo.save(userId, text);
  }
}