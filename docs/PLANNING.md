# PLANNING

> Espaço para **planejamento e refinamento** antes de virar task em [`../specs/PLAN.md`](../specs/PLAN.md).
> Aqui a gente pensa. No PLAN a gente faz.

## 🎯 Como este fluxo funciona

```text
IDEIA
  ↓
BACKLOG.md          captura cru, sem compromisso
  ↓
REFINAMENTO         aqui em PLANNING.md: problema, escopo, decisões, riscos
  ↓
PLAN.md             vira task, com micro-passos
  ↓
tasks/TASK-N.M.md   vira checklist executável
```

## 📄 Template de refinamento

Crie `docs/planning/AAAA-MM-DD-<slug>.md` com:

```markdown
# Refinamento: [Nome]

## 🧠 Problema
Quem sofre com o quê, hoje. Sem solução — só o problema.

## 🎯 Objetivo
Uma frase. Como saberemos que deu certo (métrica).

## 🗺️ Escopo
- [ ] Inclui:
- [ ] Não inclui: (o mais importante de preencher)

## 🧩 Entidades e invariantes
[domínio: o que existe e o que nunca pode quebrar]

## 🏗️ Decisões de arquitetura
| Decisão | Alternativa | Por quê |
| --- | --- | --- |
| [ex] Server Action | Route Handler | sem URL pública, sem boilerplate |

## ⚠️ Riscos
| Risco | Mitigação |
| --- | --- |

## 🪓 Task breakdown
1. TASK-1.1 — …
2. TASK-1.2 — …

## ✅ Definition of Done
- [ ] critérios mensuráveis
```

## 🎨 Artefatos visuais

Qualquer coisa que vira imagem (wireframe, fluxo, diagrama de arquitetura) vai em
`docs/planning/assets/` e é referenciada pelo markdown. Sem commit de binário no
`specs/` — os specs são texto, para o git diff fazer sentido.

## 📌 Regras

1. **Refinamento não vira código.** Se tem `diff` no arquivo, virou task.
2. **Escopo negativo é obrigatório.** "O que NÃO vai entrar" evita 50% das retrabalhadas.
3. **Toda decisão de arquitetura vira linha no `ARCHITECTURE.md`** quando estabilizar.
4. **Se a task virar > 1h, quebramos antes de começar** (regra do `AGENTS.md`).
