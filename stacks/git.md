# 🌿 GIT

## 🚨 Regras não-negociáveis

1. **Identidade fixa:** `Marcelino Sandroni <marcelino.sandroni@gmail.com>`. Configure uma vez:
   ```bash
   git config user.name  "Marcelino Sandroni"
   git config user.email "marcelino.sandroni@gmail.com"
   ```
2. **Conventional Commits obrigatório:**
   ```
   <tipo>(<escopo>): descrição curta imperativa. (Agent: <Ferramenta> - <Modelo>)
   ```
   Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `build`, `ci`.
3. **Escopo = a área** (`feat(chat)`, `fix(auth)`, `docs(sdd)`). Sem escopo, `feat:`.
4. **Uma task = um commit.** Não commite task de outra junto.
5. **Gitflow simplificado:** `main` = produção, `feat/`, `fix/`, `chore/` para trabalho. PR vai para `main`.
6. **Nunca commite:** `node_modules`, `.env`, `.env.local`, `.next`, build output, `*.log`, credencial.
7. **Antes de commitar:** `git status`, `git diff`, `git log --oneline -10`. Stage só o que é da task.
8. **Sem `--force`, sem `git config` hack, sem amend de commit já pushado.**

## 🏷️ Versionamento (SemVer + Tags)

- `MAJOR.MINOR.PATCH` — `feat`→MINOR, `fix`→PATCH, breaking→MAJOR.
- Tag no merge da fase: `git tag v1.2.0` (anotada).
- Fechou fase? Arquive em `specs/history/phases/`, gere tag, um commit de arquivamento.

## 🧭 Fluxo diário

```bash
git checkout -b feat/billing          # 1. branch
# ... codar e testar ...
git add -A                             # 2. stage (só da task)
git commit -m "feat(billing): cria slice de assinatura. (Agent: Cursor - Claude)"
git push -u origin feat/billing        # 3. push
# 4. abrir PR contra main
```

## 🔁 Atualizando este core (submodule)

```bash
git submodule update --remote --merge SDD   # puxa regras mais novas
git add SDD && git commit -m "chore(sdd): atualiza core para vX.Y.Z"
```

## 🚫 Nunca

- Commitar com mensagem vaga ("update", "fix", ".").
- `git add -A` com lixo não relacionado na working tree.
- Commitar direto na `main` em trabalho em andamento.
- Reescrever histórico público.
