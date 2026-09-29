# 🧩 SKILL: install-submodule

> Instala o core de regras (`SDD/`) em um projeto **existente**, cria os atalhos da raiz
> e deixa o agente pronto para trabalhar.

## 🎯 Quando usar

- Projeto já existe e você **não** quer o template Next.js.
- Só quer as regras + atalhos, mantendo o código atual intocado.

## ▶️ Uso

```bash
# Dentro do projeto alvo (ou passe o caminho como 1º argumento)
node SDD/SKILLS/install-submodule/install-submodule.mjs

# Instala em outro diretório
node SDD/SKILLS/install-submodule/install-submodule.mjs ../meu-projeto

# Sem git: cópia local
node SDD/SKILLS/install-submodule/install-submodule.mjs . --copy
```

## 📦 O que faz

1. `git submodule add <repo> SDD` (ou cópia com `--copy`)
2. Cria atalhos na raiz: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.cursorrules`,
   `.windsurfrules`, `.github/copilot-instructions.md`, `.clinerules`
   - tenta **symlink**; se o SO bloquear, grava um **stub** com o mesmo conteúdo da regra
3. Preserva arquivos que já existam (não sobrescreve)

## 🔄 Atualizar depois

```bash
git submodule update --remote --merge SDD
git add SDD && git commit -m "chore(sdd): atualiza core"
```

## ⚠️ Pré-requisitos

- Projeto precisa ser um repositório git (para o modo submodule).
- `git` no PATH.
