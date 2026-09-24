# ⚛️ REACT DOCS (FRONTEND)

Arquitetura focada em **Feature Slices** e **Injeção de Dependência (DI)**. Sem código espaguete, sem lixo global.

## 📂 ESTRUTURA
`client/`
├── `assets/`     - Imagens/fontes.
├── `components/` - UI burra (Botões, Modais).
├── `core/`       - DI Container (TSyringe/Inversify). Zero React aqui.
├── `features/`   - 🌟 O coração. Tudo de um domínio mora junto.
├── `hooks/`      - Hooks globais.
├── `providers/`  - React Contexts SÓ pra injetar o DI.
├── `store/`      - Zustand. (Redux é lixo).
└── `utils/`      - Helpers puros.

## 🧠 REGRAS
1. **Sem pasta global de types.** A interface (`IAlgo.ts`) fica JUNTO da implementação na `feature`.
2. **Componentes não instanciam serviços.** Use o hook de DI.

## 💻 EXEMPLO: INJEÇÃO DE DEPENDÊNCIA
```tsx
// client/core/di.ts
export const container = {
  chatService: new ChatService(),
};

// client/providers/DependencyProvider.tsx
export const DiContext = createContext(container);
export const DependencyProvider = ({ children }) => (
  <DiContext.Provider value="{container}">{children}</DiContext.Provider>
);

// client/hooks/useDi.ts
export const useDi = <T,>(key: keyof typeof container): T => {
  return useContext(DiContext)[key] as T;
};

// Uso na UI:
const chatService = useDi<IChatService>('chatService');