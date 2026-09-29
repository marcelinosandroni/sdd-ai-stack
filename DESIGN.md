# 🎨 DESIGN SYSTEM — EXECUTIVE ENGINEERING

> **Esta é a lei visual do projeto.** Se a UI não segue este documento, a UI está errada.
> Tema: **DARK ONLY**. Sem modo claro. Sem branding genérico.

---

## 🧭 0. ROTEADOR

| Você está fazendo...              | Leia              |
| --------------------------------- | ----------------- |
| Escolhendo cor/espaço/fonte      | §1 Tokens         |
| Escrevendo/copiando CSS          | §2 Tokens         |
| Montando layout/grid             | §5 Layout         |
| Botão, card, chip, input         | §6 Componentes    |
| Pensando em feedback/UX          | §7 UX             |

---

## 🎯 1. BRAND & STYLE

Interseção entre **engenharia de sistemas distribuídos de alto nível** e **stewardship financeiro executivo**.

- **Estética:** precisão de ferramenta de dev (Linear, Vercel) + disciplina tipográfica de publicação suíça e whitepapers financeiros (Stripe Press).
- **Tom emocional:** execução de alta frequência somada a gravidade institucional. Calculado, calmo, inabalável.
- **Tratamento visual:** austero, denso, mas impecavelmente legível.
- **Surfaces:** ardósia profunda com tom obsidiana (nunca preto absoluto), micro-bordas de 1px, acentos surgical em neon lime e mint.
- **Métricas de impacto financeiro** (R$ milhões salvos, latências, bilhões sob custódia) têm peso tipográfico de museu.
- **Zero firula.** Estímulo visual além do necessário = falha.

---

## 🎨 2. TOKENS (FONTE DE VERDADE)

> Tokens vivem em `src/app/globals.css` dentro do bloco `@theme` (Tailwind v4).
> **Nunca** escreva hex literal em componente.

### Cores

| Token | Hex | Uso |
| --- | --- | --- |
| `surface` | `#111319` | Base de panels/cards |
| `surface-base` | `#0A0D12` | Canvas raiz (Tier 0) |
| `surface-raised` | `#11151C` | Cards e containers (Tier 1) |
| `surface-overlay` | `#181E27` | Modais, dropdowns, code headers (Tier 2) |
| `surface-container` | `#1D2025` | Containers neutros |
| `surface-container-high` | `#272A30` | Containers elevados |
| `surface-container-highest` | `#32353B` | Máximo contraste de container |
| `surface-bright` | `#36393F` | Superfícies muito elevadas |
| `on-surface` | `#E1E2EA` | Texto/icons sobre surface |
| `text-primary` | `#F4F1EA` | Texto principal (off-white editorial quente) |
| `text-secondary` | `#94A3B8` | Texto subsequente |
| `text-muted` | `#56657A` | Texto terciário / decorativo |
| `border-subtle` | `#1E2633` | Borda de card (Tier 1) |
| `border-prominent` | `#2D384B` | Borda de overlay (Tier 2) |
| `primary` | `#BAF336` | 🟢 **Lime neon** — ação executiva crítica, ROI, estado ativo |
| `on-primary` | `#0A0D12` | Texto sobre lime |
| `primary-container` | `#B4F230` | Lime em container |
| `on-primary-container` | `#253600` | Texto sobre lime container |
| `secondary` | `#45DFA4` | 🟢 **Mint** — estabilidade, SLA up, delta positivo |
| `on-secondary` | `#003825` | Texto sobre mint |
| `tertiary` | `#9CC5FD` | 🔵 **Slate blue** — badges de infra, estágios de pipeline, tags técnicas |
| `on-tertiary` | `#003257` | Texto sobre tertiary |
| `error` | `#FFB4AB` | Erro |
| `on-error` | `#690005` | Texto sobre erro |
| `error-container` | `#93000A` | Erro em container |
| `outline` | `#8D937B` | Contorno/foco |
| `outline-variant` | `#434935` | Variante de contorno |
| `kpi-accent-glow` | `rgba(186,243,54,0.12)` | Glow de KPI lime |
| `mint-accent-glow` | `rgba(52,211,153,0.12)` | Glow de KPI mint |

> **Regra de acento:** APENAS 1 cor primária de sotaque por tela. Lime (`primary`) é a ação executiva. Mint (`secondary`) é status/positivo. Slate blue (`tertiary`) é taxonomy/infra. Nunca as três brigando.

### Tipografia — matriz de 3 fontes

| Família | Papel | Regra |
| --- | --- | --- |
| **Manrope** | Núcleo geométrico estrutural: headlines, body, números gigantes | Peso 400–800 |
| **JetBrains Mono** | Instrumentação técnica: tags, paths, índices, commit, metadata | `letter-spacing: 0.06em` em CAPS |
| **Playfair Display** | Nuance editorial financeira: quotes, framing estratégico | Só itálico/médio. sparingly. |

Todas via `next/font/google` (zero layout shift, zero request externo). Ver [stacks/tailwind.md](./stacks/tailwind.md).

#### Escala tipográfica

| Token | Fonte | Tamanho / Peso / Line | Letter | Uso |
| --- | --- | --- | --- | --- |
| `display-hero` | Manrope | 64 / 800 / 72 | -0.035em | Hero desktop |
| `display-hero-mobile` | Manrope | 38 / 800 / 44 | -0.025em | Hero mobile |
| `metric-stat` | Manrope | 48 / 700 / 52 | -0.03em | KPI desktop |
| `metric-stat-mobile` | Manrope | 32 / 700 / 36 | -0.02em | KPI mobile |
| `headline-lg` | Manrope | 32 / 700 / 40 | -0.02em | Título de seção |
| `headline-md` | Manrope | 24 / 600 / 32 | -0.015em | Título de card |
| `headline-sm` | Manrope | 18 / 600 / 26 | -0.01em | Subtítulo |
| `body-lg` | Manrope | 17 / 400 / 28 | — | Body principal |
| `body-md` | Manrope | 15 / 400 / 24 | — | Body padrão |
| `body-sm` | Manrope | 13 / 400 / 20 | — | Body denso |
| `editorial-quote` | Playfair | 26 / 500 / 36 | -0.01em | Quote |
| `code-inline` | JetBrains Mono | 13 / 500 / 18 | -0.01em | Código inline |
| `label-mono` | JetBrains Mono | 11 / 600 / 16 | +0.06em | Label técnica (CAPS) |

> Escala transiciona de monumental (desktop) a denso (mobile) sem clipping nem wrap ruim.

### Raios (curvatura "Soft", disciplined)

| Token | Valor | Uso |
| --- | --- | --- |
| `sm` | `0.125rem` | Micro-chip |
| `DEFAULT` | `0.25rem` | Botão, input (estética CAD/IDE) |
| `md` | `0.375rem` | Input médio, select |
| `lg` | `0.5rem` | Card, data module |
| `xl` | `0.75rem` | Panel grande |
| `full` | `9999px` | **Só** badge de status/online |

### Espaçamento (grid de 8pt, ritmo vertical)

| Token | Valor | Uso |
| --- | --- | --- |
| `gutter` | `1.5rem` | Gutter mobile |
| `gutter-desktop` | `2rem` | Gutter desktop |
| `margin` | `1rem` | Margem mobile |
| `margin-tablet` | `2rem` | Margem tablet |
| `margin-desktop` | `3rem` | Margem desktop |
| `space-xs` | `0.25rem` | Micro gap |
| `space-sm` | `0.5rem` | Gap apertado (data grid) |
| `space-md` | `1rem` | Gap padrão |
| `space-lg` | `1.5rem` | Gap de seção |
| `space-xl` | `2.5rem` | Gap amplo |
| `space-2xl` | `4rem` | Respiro de seção (mobile) |
| `space-3xl` | `6rem` | Respiro de seção (desktop) |

---

## 🏔 3. ELEVATION & DEPTH

**Sem drop shadow pesado.** Profundidade = tiering + glass + micro-border.

- **Tier 0 (Canvas):** `#0A0D12` + padrão de micro-dot grid `1px` (`rgba(255,255,255,0.03)`).
- **Tier 1 (Cards):** `#11151C` com borda contínua `1px #1E2633`.
- **Tier 2 (Overlay/Hover/Focus):** `#181E27` com borda nítida `#2D384B` + micro-glow localizado.
- **Gradientes radiais:** `rgba(186,243,54,0.04)` e `rgba(52,211,153,0.03)` atrás de diagramas de arquitetura. Difusos, sem poluir leitura.
- **Glassmorphism:** nav rails e status bars persistentes = `backdrop-filter: blur(12px)` + slate semi-transparente `rgba(10,13,18,0.82)` + hairline inferior `rgba(30,38,51,0.9)`.

---

## 📐 4. LAYOUT & SPACING

- **Grid:** 12 colunas matemáticas, baseline vertical estrita de 8pt.
- **Largura máxima:** `1320px`, centralizado, dentro de gutters de alto contraste.
- **Ritmo de seção:** módulos maiores respiram com `space-3xl` (desktop) → `space-2xl` (mobile). Presença de portfólio de museu.
- **Densidade:** micro-componentes (data grid, métrica, stack) usam padding apertado `space-sm`–`space-md`. Equilíbrio entre respiro e densidade.
- **Breakpoints adaptativos:**
  - **Mobile (<768px):** reflow 4 colunas, métrica empilhada, tier de arquitetura em largura total com borda separadora.
  - **Tablet (768–1024px):** layout 8 colunas, cards de métrica em dupla, sidebar condensado.
  - **Desktop (>1024px):** 12 colunas, canvas de arquitetura multi-tier, deep-dives lado a lado.

---

## 🧱 5. COMPONENTES

### Botões

| Variante | Visual | Regra |
| --- | --- | --- |
| **Primary (ação executiva/CTA)** | bg `#BAF336`, texto `#0A0D12`, Manrope 600 | Hover: bg `#C8F75A` + `box-shadow 0 0 16px rgba(186,243,54,0.3)`. Active: `scale(0.98)`. |
| **Secondary (deep dive)** | bg `transparent`, borda `1px #1E2633`, texto `#F4F1EA` | Hover: borda `#94A3B8` + bg `rgba(255,255,255,0.04)`. |
| **Ghost / Copy code** | JetBrains Mono 11px CAPS, transparente, ícone em container suave | Tooltip de confirmação instantâneo ao copiar. |

### Executive KPI Metric Card

- Mostra impacto financeiro ("R$ 24M/ano salvos", "100M msgs/dia", "R$ 100 bi em custódia").
- Construção em duas partes: **header mono** (`label-mono`) com ponto de status pulsante → **estatística monumental** (`metric-stat`) → **subtexto anotado** com escopo técnico e ROI de negócio.
- Borda interna `1px #1E2633` + glow de canto superior no hover em `#BAF336`.

### Chips & Badges de Taxonomia (Tecnologia)

- JetBrains Mono, 11px CAPS, padding `4px 8px`.
- **Inativo:** bg `#11151C`, borda `#1E2633`, texto `#94A3B8`.
- **Ativo/Destaque:** bg `rgba(186,243,54,0.08)`, borda `rgba(186,243,54,0.4)`, texto `#BAF336`.

### Diagramas de Arquitetura / Fluxo

- Containers de nó em ardósia escura, conectados por vetores de 1px.
- Nó **ativo:** anel de status pulsante lime/mint. Nó inativo/legacy: `#56657A`.
- Drawer de tooltip desliza da borda direita com snippets, benchmarks de latência e decisões arquiteturais.

### Inputs & Campos de Terminal

- Container minimalista, bg `#0A0D12`, borda `1px #1E2633`, placeholder `#56657A`.
- Foco: hairline migra para `#BAF336` (sem outline grosso).

### Project Showcase & Drawer de Recrutador

- Cards com split: métricas de sistema à esquerda, arquitetura/stack interativa à direita.
- Barra de scan rápido de metadata: Role, Team Size, Scale, Core Tech, Direct Fiscal Impact.
- Drawer expansível com bullets: **Problem**, **Scale & Complexity**, **Architectural Decision**, **Measured Outcome**.

---

## 🧠 6. UX (Regras de interação)

1. **Feedback imediato (dopamina):** clicou? loading IMEDIATO. Deu certo? toast de sucesso. Deu erro? toast de erro. **Zero ações sem resposta.**
2. **Foco único:** uma tela = um objetivo. Nada de 50 formulários. Complexo → modal/wizard.
3. **Micro-interações:** `hover:` em tudo que é clicável. O usuário precisa sentir a tela viva.
4. **Acessibilidade real:** contraste que passa. Texto secundário não some. O que importa **grita**.
5. **Animações** respeitam `prefers-reduced-motion`. Transições ≤ 200ms para feedback, ≤ 400ms para drawer/modal.

---

## 🚫 PROIBIÇÕES (resumo de uma linha)

- ❌ Cor/rgba literal em componente (use tokens).
- ❌ Modo claro (é dark only).
- ❌ Lib de UI além de shadcn ([stacks/shadcn.md](./stacks/shadcn.md)).
- ❌ Drop shadow pesado.
- ❌ Pill shape fora de status/online.
- ❌ >1 acento de cor competindo na mesma tela.
- ❌ Sem `focus-visible` em nada interativo.
- ❌ Grid que não é 12 colunas / max-width 1320px.
