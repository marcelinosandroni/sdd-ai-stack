# 📦 PRODUCT

> **O que este template entrega, para quem, e o que ele NÃO entrega.**
> Preencha a seção "Contexto do projeto consumidor" ao usar num projeto real.

---

## 🎯 O problema

Agentes de IA (Claude Code, Cursor, Copilot…) falham em projetos sem regra explícita por
três motivos previsíveis:

1. **Contexto demais** — leem 40 arquivos e não concluem nada.
2. **Sem critério de parada** — voltam a inventar arquitetura e não param.
3. **Sem memória de processo** — não sabem que estão no meio de uma task.

Isto é **Spec-Driven Development aplicado a agentes**: a especificação vira o sistema
nervoso, e o agente só precisa saber *onde olhar agora*.

## 💡 A solução

Um pacote com três partes:

| Parte | Problema que resolve |
| --- | --- |
| **Roteador de regras** | O agente lê `AGENTS.md` → `PLAN.md` → o doc da stack. Contexto mínimo. |
| **Template de projeto** | Não precisa inventar estrutura. Já vem com Next.js 16 + design system. |
| **CLI + submodule** | Instalação em 1 comando, atualizável por git. |

## 👤 Quem é

-_times pequenos/médios com IA como pair programmer
- Devs que perdem contexto no meio de refatorações longas
- Times que querem padronizar a entrega entre humanos e agentes

## 🧭 Princípios do design

| Princípio | Consequência prática |
| --- | --- |
| **Roteador em tudo** | Todo doc tem "se você está fazendo X, leia §Y" no topo |
| **Uma task por vez** | `PLAN.md` permite exatamente uma task `[-]` |
| **Prova de vida** | Não marca `[x]` sem output verde do terminal colado |
| **Vertical slices** | Um requisito = uma pasta |
| **Tokens em um lugar só** | Design muda no `@theme`, nunca no componente |
| **Doc perto do que edita** | `error.tsx` sem `"use client"` = build quebrado. proximity paga. |

## 🚫 O que NÃO entregamos

- Conta de IA, prompts de modelo, gateway de LLM
- Autenticação pronta (o ponto de extensão é `src/shared/server/auth.ts`)
- Banco de dados configurado (o slice de exemplo usa repositório em memória)
- Monorepo com vários pacotes
- CI/CD pronto (as regras estão em `stacks/ci.md`)

> O que não entregamos é **deliberado**: o template que resolve um problema por vez
> é mais útil que o que resolve tudo mal.

## 🧪 Como sabemos que funciona

O template em `template/next/` passa em `typecheck`, `lint`, `test`, `test:e2e` e `build`.
A própria CLI tem 17 testes. Bugs reais já foram encontrados por essa validação
(veja [`CHANGELOG.md`](./CHANGELOG.md) § 🐛).

---

## 📝 Contexto do projeto consumidor

> Preencha ao instalar este template num projeto real.

**Nome:** [SEU APP]
**O que faz:** [1 linha]
**Usuário final:** [quem usa]
**Stack ativa:** Next.js 16 · [outras]
**Integrações:** [Stripe, OpenAI, …]
**Regras críticas de negócio:**
- [ex: usuário free gera no máximo 5 vídeos/dia]
