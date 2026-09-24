# 🤖 sdd-ai-stack

> **O ecossistema definitivo para Agentes de IA baseado em Spec-Driven Development (SDD).**
> Este monorepo integra um Frontend ultra-rápido (React/Vite) e um Backend escalável (Node.js) utilizando **Arquitetura de Vertical Slices** e **Injeção de Dependência** estrita.

## 🛑 Projeto SDD (Spec-Driven Development)

⚠️ **ATENÇÃO AGENTE DE IA (CRÍTICO):**
Você está operando em um ambiente de Desenvolvimento Guiado por Especificações.
**NÃO** inicie nenhuma análise de código, **NÃO** crie arquivos e **NÃO** sugira implementações antes de ler OBRIGATORIAMENTE o arquivo `AGENTS.md` na raiz deste projeto.

O `AGENTS.md` contém suas leis de funcionamento e o fluxo de trabalho exato que você deve seguir. Leia-o agora.

---

## 🗺️ Mapa do Cérebro (Documentação)

A arquitetura é estrita e desenhada para hiperfoco e isolamento de contexto. Leia antes de codar:

- 🧠 **O que é este app e stack:** [APP.md](./APP.md)
- 🎯 **O que estamos fazendo AGORA (Foco):** [PLAN.md](./PLAN.md)
- 🏗️ **Arquitetura Global:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- 💅 **Regras do Frontend (React):** [REACT.md](./REACT.md)
- 🟢 **Regras do Backend (Node.js):** [NODE.md](./NODE.md)
- 📥 **Ideias Soltas e Débito Técnico:** [BACKLOG.md](./BACKLOG.md)
- 🗺️ **Visão Macro:** [ROADMAP.md](./ROADMAP.md)

---

## 🛠️ Setup Inicial (Para Projetos Vazios)

Se você acabou de clonar este repositório zerado, use os comandos abaixo na raiz para iniciar o ecossistema.

### 1. Inicializar Frontend (Vite) e Backend (Node)
```bash
# Cria o app React com Vite na pasta 'client'
npm create vite@latest client -- --template react-ts

# Cria e inicia a pasta do backend
mkdir server && cd server && npm init -y && cd ..
```

### 2. Script Mágico: Criar Estrutura de Pastas (Vertical Slices)
Rode o comando abaixo na raiz do projeto para criar instantaneamente todas as pastas da arquitetura e evitar perda de foco:

```bash
# Pastas do Frontend
mkdir -p client/assets client/components client/core client/features client/hooks client/providers client/store client/utils

# Pastas do Backend
mkdir -p server/api/adapters server/core/di server/core/config server/core/database server/core/logger server/core/errors server/core/middlewares server/core/http server/features
```

---

## 🚀 Como Rodar Local

```bash
# 1. Instale as dependências de todos os workspaces
npm install

# 2. Suba o Frontend e Backend simultaneamente
npm run dev
```

---

## 🔄 Como Sincronizar/Espelhar este Repositório

Se você precisa usar esse core dentro de outro projeto e manter atualizado, escolha sua rota:

### Opção 1: Git Submodules (Recomendado e Seguro)
Ideal se você quer controle absoluto de *quando* atualizar o código no repo destino.

**1. Adicionar o submódulo (rode no repo destino):**
```bash
git submodule add [https://github.com/marcelinosandroni/sdd-ai-stack.git](https://github.com/marcelinosandroni/sdd-ai-stack.git) sdd-core
```

**2. Puxar as atualizações mais recentes depois:**
```bash
git submodule update --remote --merge
```

### Opção 2: GitHub Actions (Automático)
Para espelhar automaticamente via push, crie um workflow `.github/workflows/sync.yml` utilizando a action `ad-m/github-push-action`.

---

## 👨‍💻 Autor
[Marcelino Sandroni](https://github.com/marcelinosandroni)