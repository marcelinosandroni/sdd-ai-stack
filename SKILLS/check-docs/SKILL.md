# 🧩 SKILL: check-docs

> Valida que **todo link relativo entre documentos** resolve. Roda no hook de commit
> e no CI para uma regra nunca apontar para arquivo morto.

## ▶️ Uso

```bash
node SDD/SKILLS/check-docs/check-docs.mjs
node SDD/SKILLS/check-docs/check-docs.mjs ../outro-projeto
```

## 📦 O que verifica

- Coleta todo `.md` a partir da raiz do `SDD/`
- Ignora blocos de código (` ``` ` / `~~~ `) — link ilustrativo dentro de exemplo não conta
- Ignora `node_modules`, `.next`, `test-results`, `playwright-report`
- Saída: exit 1 com a lista dos quebrados, ou exit 0 com o total de documentos

## ✅ Quando rodar

- Antes de commitar mudança em documentação
- No CI, junto com os testes
- Depois de renomear/mover qualquer documento de regra
