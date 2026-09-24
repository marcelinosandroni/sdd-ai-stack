# 🏗️ ARQUITETURA GLOBAL (MONOREPO)

Padrão Monorepo separando completamente Frontend e Backend, unidos apenas no nível de infraestrutura.

## 📂 ESTRUTURA ROOT
```text
meu-projeto/
├── client/      - App React + Vite.
└── server/          - API Node.js (Desacoplada).