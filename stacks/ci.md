# ⚙️ CI / CD

## 🚨 Regras não-negociáveis

1. **Pipeline mínimo obrigatório em todo repo:** `lint` → `typecheck` → `test` → `build`. Nessa ordem.
2. **CI é o portão.** Se passou local mas falha no CI, o CI está certo.
3. **Node e pnpm/npm fixados por versão** (Node 20.9+ para Next 16). Sem `latest` em CI.
4. **Deploy só da `main`.** Feature branch nunca faz deploy de produção.
5. **Segredo só via secrets do repositório.** Nunca no código do workflow.
6. **Ambiente de preview por PR** é obrigatório (qualidade de review).

## 🔧 Pipeline padrão (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request: { branches: [main] }
  push: { branches: [main] }

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:unit -- --run
      - run: npm run build
```

## 📦 Deploy (Vercel / Node)

- **Vercel:** conecte o repo. Preview por PR é automático. `SDD/` é ignorado no build.
- **Node (workers/CLI):** build no CI, artefato, deploy no `main` com approval manual.

## 🔒 Segurança no pipeline

- `npm audit --production` como gate de aviso (não bloqueia minor).
- Dependabot ativo.
- Nunca logar `.env`/tokens no output do job.

## 🏷️ Release

1. Fechou fase → tag SemVer (`vX.Y.Z`).
2. CI roda em tag → build de release.
3. Changelog atualizado ([../docs/CHANGELOG.md](../docs/CHANGELOG.md)).

## 🚫 Anti-padrões

| ❌ | ✅ |
| --- | --- |
| `continue-on-error: true` em tudo | Deixar o gate barrar de verdade |
| `npm install` (sem lock) em CI | `npm ci` |
| Deploy manual sem aprovação | Preview + approval em main |
| Rodar build sem typecheck | build sempre depois de typecheck |
