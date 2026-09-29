# 🎯 PLAN (O Cérebro do Projeto)

> 🛑 **REGRA FIXA (Agente IA, LEIA ISSO ANTES DE CODAR):**
> O desenvolvedor (Marcelino) tem TDAH. As tarefas AQUI devem ser **microscópicas**.
> Se uma tarefa levar mais de 1 hora pra fazer, QUEBRE ELA EM DUAS.
> Nunca pule um passo. Nunca comece o Passo 2 sem testar e commitar o Passo 1.
> Atualize os status rigorosamente no final de cada prompt: `[ ]` (To Do), `[-]` (In Progress), `[x]` (Done).

> **Existe exatamente UMA task `[-]` em todo momento.** Se houver duas, o agente parou errado.

---

## Fase atual: 0 — Bootstrap

> Status: ✅ concluída (template + regras + CLI)
> Histórico: [`history/phases/phase-0-bootstrap.md`](./history/phases/phase-0-bootstrap.md)

### Como usar este arquivo

1. Substitua o bloco abaixo pela fase atual do seu projeto.
2. Nomeie a task `TASK-<FASE>-<NÚMERO>` e crie o arquivo em `specs/tasks/TASK-<FASE>-<NÚMERO>.md`
   (use o [template](./tasks/TASK_TEMPLATE.md)).
3. Marque `[-]` **antes** de começar a codar. Marque `[x]` **depois** de colar a evidência verde do terminal.
4. Ao fechar a fase, arquive em `history/phases/` e gere a tag SemVer.

---

```markdown
## Fase atual: [N] — [NOME DA FASE]

[ ] - [TASK-1.1](./tasks/TASK-1.1.md) - [fazer]
[-] - [TASK-1.2](./tasks/TASK-1.2.md) - [fazendo]   ← única task em progresso
[ ] - [TASK-1.3](./tasks/TASK-1.3.md) - [fazer]

### Critério de saída da fase
- [ ] Todas as tasks `[x]` com evidência de teste colada
- [ ] `npm run typecheck && npm run lint && npm run test && npm run build` verdes
- [ ] `docs/CHANGELOG.md` atualizado
- [ ] `specs/history/phases/phase-N-finished.md` escrito
- [ ] Tag SemVer gerada
```

---

## 📋 Checklist de entrega (cole no fim de cada task)

```markdown
**Evidência:**
- `npm run typecheck` → exit 0
- `npm run lint` → 0 erros
- `npm run test` → N passed
- `npm run test:e2e` → N passed
- `npm run build` → ✓ Compiled successfully

**Arquivos tocados:** (liste — máximo 5 por passo)
**Commit:** `tipo(escopo): descrição. (Agent: <Ferramenta> - <Modelo>)`
```
