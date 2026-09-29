# ✅ TASK [NOME DA TASK]

> 🛑 **REGRA FIXA (Agente IA, LEIA ISSO):**
> 1. O dev (Marcelino) tem TDAH, cegueira temporal e zero paciência pra lixo.
> 2. Se a task inteira levar mais de 1 hora, QUEBRE EM DUAS TASKS AGORA.
> 3. Entregue o código de um passo, espere ele testar, e SÓ DEPOIS vá para o próximo.
> 4. O nome do arquivo da TASK deve ser sempre `TASK-PHASE-TASK` (ex: `TASK-1.1.md`).
> 5. Manter sempre na pasta `tasks/` e subpasta da fase (`tasks/phase-1/`).
> 6. **PROIBIDO EDITAR ACIMA DO TRAÇO.** Você SÓ tem permissão para preencher os dados ABAIXO da linha `---`.

---

## 🎯 Objetivo da Task

[1 linha. O que você quer fazer. Ex: "Criar o botão de gerar vídeo IA na feature video".]

## 📂 Onde mexer

- [ ] `src/features/[x]/application/` — regra de negócio
- [ ] `src/features/[x]/infrastructure/` — repo/adaptador
- [ ] `src/features/[x]/actions.ts` — entrada de escrita
- [ ] `src/features/[x]/ui/` — componente
- [ ] `src/app/...` — rota (só roteia)
- [ ] `tests/` — testes

## 🛠️ Micro-Passos (Checklist Dopamina)

*(Passos RIDICULAMENTE pequenos. Máximo 5 por task.)*

- [ ] Passo 1: [Ex: Criar a interface `IVideo.ts` em `domain/`]
- [ ] Passo 2: [Ex: Criar o layout burro do botão]
- [ ] Passo 3: [Ex: Ligar o botão no hook de DI]
- [ ] Passo 4: [Ex: Teste unit do use case]
- [ ] Passo 5: [Ex: E2E do fluxo]

## 🏁 Definition of Done (Critério de Sucesso)

- [ ] `npm run typecheck` → exit 0
- [ ] `npm run lint` → 0 erros, 0 warnings
- [ ] `npm run test` → todo verde
- [ ] `npm run test:e2e` → todo verde
- [ ] `npm run build` → ✓ Compiled successfully
- [ ] Zero `any` no código novo
- [ ] Cores/estilos usando tokens do `DESIGN.md` (se tocou em UI)
- [ ] Evidência verde colada na resposta
- [ ] `specs/PLAN.md` atualizado para `[x]`
