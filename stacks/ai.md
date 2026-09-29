# 🤖 AI / LLM

> Rules for integrating language models. Cost, latency and safety matter as much as
> the answer.
> Spine: [clean-code.md](./clean-code.md).

## 🚨 Non-negotiable rules

1. **An LLM call NEVER happens inside a Server Component.** It goes into a Server
   Action or a use case in `application/`.
2. **NEVER expose `OPENAI`/`ANTHROPIC_API_KEY` to the client.** Always
   `import "server-only"` in the module.
3. **Every LLM call has a `timeout` and error handling.** The user must never sit in an
   eternal loading state.
4. **Stream for long UX.** An LLM response > 1s streams (AI SDK / `ReadableStream`).
5. **Token limits are ALWAYS explicit** (`max_tokens`/`maxOutputTokens`). Never let the
   model "ramble".
6. **Cost is a requirement, not a detail.** Expensive models (Opus/GPT-4o) only with a
   justification in `docs/CHANGELOG.md`.
7. **No sensitive data in the prompt without a reason** (LGPD). Anonymise first.

## 🧩 Call pattern

```ts
// features/chat/application/generate-reply.ts
import "server-only";
import { generateText } from "ai";

export async function generateReply(prompt: string) {
  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    prompt,
    maxTokens: 1024,                   // ALWAYS a limit
    abortSignal: AbortSignal.timeout(15_000),   // ALWAYS a timeout
  });
  return text;
}
```

## 🎯 Model choice (cost vs quality)

| Case | Typical model |
| --- | --- |
| Classify / extract / format | mini / small |
| Marketing copy, summarising | mini / small |
| Complex reasoning, code | big / Opus |
| Embeddings | a dedicated `*-embed` model |

## 🛡️ Security

- **Validate the LLM output before using it.** Output is untrusted input. Zod on the
  return, always.
- **Never inline secrets in a client prompt.**
- **Rate limit** any endpoint that calls an LLM, per user/route (prevents key draining).
- **Log the call** with model + token count, so cost is visible in production.

## 📊 What to watch

- **Streaming vs not:** UX (streaming) vs complexity.
- **Caching:** identical prompt → cached at no cost. Use `'use cache'` when the input is
  stable.
