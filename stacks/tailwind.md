# 🎨 TAILWIND CSS (v4)

> Stack de estilo do template. **Dark mode only.** Tokens completos em [../DESIGN.md](../DESIGN.md).

## 🚨 Regras não-negociáveis

1. **Nunca escreva cor/rgba literal em classe.** Use os tokens: `bg-surface`, `text-text-secondary`, `border-border-subtle`.
2. **Nunca use `style={{}}` inline** (exceto variável de valor dinâmico do design).
3. **Tokens vivem em `src/app/globals.css` no bloco `@theme`.** Para mudar o design, muda **lá** — nunca em componente.
4. **Mobile-first.** Estilo base é mobile; breakpoint é o upgrade (`sm: md: lg:`).
5. **Grid de 12 colunas, max-width 1320px, gutter 1.5rem/2rem.** Não inventa outro grid.
6. **`<Image>` sempre com `sizes` explícito** em grid/lista (evita baixar imagem de 4k no celular).
7. **Ordem das classes = mobile → estado → breakpoint.** Ajuda a leitura e o diff.

## 🧱 Classes de componente (via `@layer components`)

O template define os primitivos. **Não repita a classe longa em 40 lugares** — use a variante.

```tsx
<a className="btn-primary">Salvar</a>
<a className="btn-secondary">Cancelar</a>
<span className="chip">React 19</span>          // chip inativo
<span className="chip chip-active">Ativo</span> // chip ativo (lime)
<div className="card">…</div>                   // card padrão
<div className="card-metric">…</div>            // KPI card
<label className="field-label">E-mail</label>
<input className="field" />
```

## 🎯 Padrões de uso

```tsx
// ✅ grid responsivo com 12 colunas no desktop
<div className="mx-auto w-full max-w-[1320px] px-6 lg:px-8">
  <div className="grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12">
    <div className="col-span-4 lg:col-span-6">…</div>
  </div>
</div>

// ✅ glassmorphism (nav/status bar)
<header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-raised/80 backdrop-blur-xl">

// ✅ glow lime no KPI
<div className="card-metric hover:shadow-[0_0_24px_var(--kpi-accent-glow)]">

// ❌ proibido
<div style={{ background: "#BAF336" }} />
<div className="bg-[#BAF336] text-[#0A0D12]" />
```

## 🚫 Proibido

| Padrão | Por quê |
| --- | --- |
| Cor literal (`#hex`, `rgb()`) em classe | Quebra o tema e o dark mode |
| `!important` | Esconde erro de especificidade |
| Classes arbitrárias sem necessidade | Cria CSS não rastreável |
| `tailwind.config.js` quando Tailwind v4 usa `@theme` no CSS | Duas fontes de verdade |
| Animações custom sem `prefers-reduced-motion` | Acessibilidade |

## ✅ Acessibilidade (obrigatório)

- Foco **sempre visível**: use o token `focus-visible:ring-primary` no padrão de input/botão.
- Alvo de toque mínimo **44px** em mobile.
- Contraste: texto secundário (`#94A3B8`) sobre surface (`#11151C`) passa; texto muted (`#56657A`) só em detalhe decorativo.
