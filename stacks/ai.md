# 🤖 AI / LLM

> Regras para integrar modelos de linguagem. Custo, latência e segurança importam tanto quanto a resposta.

## 🚨 Regras não-negociáveis

1. **Chamada de LLM NUNCA acontece dentro de um Server Component.** Vai para uma Server Action ou um use case em `application/`.
2. **NUNCA exponha a `OPENAI/ANTHROPIC_API_KEY` no client.** Sempre `import "server-only"` no módulo.
3. **Toda chamada a LLM tem `timeout` e tratamento de erro.** O usuário nunca fica em loading eterno.
4. **Streaming para UX longa.** Resposta de LLM > 1s é streaming (ver AI SDK / `ReadableStream`).
5. **Limite de tokens SEMPRE explícito** (`max_tokens`/`maxOutputTokens`). Nunca deixe o modelo "falar à vontade".
6. **Custo é requisito, não detalhe.** Modelos caros (Opus/GPT-4o) só com justificativa em `docs/CHANGELOG.md`.
7. **Nada de dado sensível no prompt** sem necessidade (LGPD).Anonimize antes.

## 🧩 Padrão de chamada

```ts
// features/chat/application/generate-reply.ts
import "server-only";
import { generateText } from "ai";

export async function generateReply(prompt: string) {
  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    maxTokens: 1024,          // SEMPRE limite
    abortSignal: AbortSignal.timeout(15_000),  // SEMPRE timeout
  });
  return text;
}
```

## 🎯 Escolha de modelo (custo vs qualidade)

| Caso | Modelo típico |
| --- | --- |
| Classificar/extrair/formatar | mini / small |
| Copy de marketing, resumo | mini / small |
| Raciocínio complexo, código | big / Opus |
| Embedding | `*-embed` dedicado |

## 🛡️ Segurança

- **Valide a saída do LLM antes de usar.** Saída é input não-confiável. Zod no retorno, sempre.
- **Never inlined secrets em prompt de cliente.**
- **Rate limit por usuário/rota** em qualquer endpoint que chame LLM (evite key draining).
- **Log de chamada** com modelo + tokens (custo visível em produção).

## 📊 O que observar

- **Streaming vs não:** UX (streaming) vs complexidade.
- **Caching:** mesmo prompt → cache sem custo. Use `'use cache'` quando a entrada for estável.
