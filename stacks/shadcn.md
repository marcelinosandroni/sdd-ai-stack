# 🧩 SHADCN/UI

> **Biblioteca de UI OFICIAL do template.** Componentes vão para `src/shared/ui/`.

## 🚨 Regras não-negociáveis

1. **shadcn/ui é a única lib de UI.** Proibido MUI, AntD, Bootstrap, Chakra, styled-components.
2. **Componente novo entra na pasta, não no registry.** `npx shadcn@latest add <comp>` e o arquivo nasce em `src/shared/ui/`.
3. **Depois de adicionar, EDITE o componente local.** Ele é seu agora. Alinhe com [../DESIGN.md](../DESIGN.md) (tokens, raio, borda).
4. **Todo componente novo precisa de:** `aria-*` nos que têm função, foco visível, e estado `disabled` real (não só visual).
5. **Variante com `cva` (class-variance-authority).** Nunca `if/else` de className.
6. **Ícone:** `lucide-react`. Tamanho default 16, stroke 2. Nada de SVG colado na mão.

## 🧪 Fluxo para adicionar componente

```bash
# 1. Instala e cria o arquivo
npx shadcn@latest add dialog

# 2. Verifique onde caiu: src/shared/ui/dialog.tsx

# 3. Edite o arquivo: troque as classes pelo DESIGN (tokens, rounded, border)
```

## 🎨 Sobreposição com o DESIGN

O shadcn traz um theme genérico. **O DESIGN.md manda.** Checklist ao tocar um componente:

- [ ] Cor de fundo/borda/text usando tokens do `globals.css` (`bg-surface-container`, `border-border-prominent`)
- [ ] Raio: `rounded-md` (0.375rem) em input/botão, `rounded-lg` (0.5rem) em card
- [ ] Borda hairline `1px`, **sem sombra pesada**
- [ ] Botão primário: `bg-primary text-on-primary hover:bg-primary/90` com glow lime sutil
- [ ] Foco: `focus-visible:ring-2 focus-visible:ring-primary`

## 📂 Onde cada coisa mora

| Tipo | Caminho |
| --- | --- |
| Primitive genérica (Button, Dialog, Input) | `src/shared/ui/` |
| Componente de domínio (UserCard, InvoiceRow) | `src/features/<x>/ui/` |
| Composição (form + action + validação) | `src/features/<x>/ui/` |
| Hook de UI (useToast, useMediaQuery) | `src/shared/hooks/` |

## 🚫 Anti-padrões

| ❌ Não faça | ✅ Faça |
| --- | --- |
| `<div onClick>` como botão | `<button type="button">` |
| Wrapper de `Dialog` com estado próprio espalhado | Estado no pai, ou `useActionState` |
| Criar componente que é 90% igual ao do shadcn | Editar o existente |
| Props customizadas com 8 booleanos | `variant` + `size` com cva |
| Acessibilidade ignorada em modal/drawer | `DialogTitle`, `DialogDescription`, foco preso |
