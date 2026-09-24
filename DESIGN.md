# 🎨 DESIGN (UI / UX Rules)

> 🛑 **REGRA FIXA (Agente IA, LEIA ISSO):** 
> 1. O dev (Marcelino) tem TDAH. A interface TEM que ser limpa, direta e livre de poluição visual.
> 2. Zero firula. Se a tela tiver mais estímulo que o necessário, você falhou.

---

## 💅 1. Estilo Visual (A Estética)
- **Vibe:** Minimalista, Brutalista Moderno, Simples (padrão Vercel/Linear).
- **Tema:** 🌙 **DARK MODE ONLY**. Nada de estourar a retina do usuário com telas brancas.
- **Library Oficial:** `shadcn/ui` + TailwindCSS. 
- **⚠️ PROIBIDO:** Inventar CSS customizado gigante ou instalar outras libs de UI (MUI, AntD, Bootstrap é lixo aqui). Use o shadcn e adapte.

## 📐 2. Regras de UI (Interface do Usuário)
- **Espaçamento (Whitespace):** Deixe a tela respirar. Use `gap`, `p` e `m` generosos no Tailwind. Elementos grudados dão ansiedade.
- **Paleta de Cores:** Fundo escuro (zinc ou slate), textos cinza-claro/branco, e APENAS 1 cor primária de sotaque (accent) para botões principais.
- **Tipografia:** Fonte do sistema (Inter, Roboto, San Francisco). Hierarquia estrita: Títulos enormes, corpo de texto limpo.
- **Formatos:** Bordas levemente arredondadas (`rounded-md` ou `lg`). Sem excesso de sombras, use bordas sutis (`border-border`) para separar elementos.

## 🧠 3. Regras de UX (Experiência e Fluxo)
- **Feedback Imediato (Dopamina):** O usuário clicou? Mostre um loading/spinner IMEDIATAMENTE. Deu certo? Lance um `Toast` de sucesso. Deu erro? `Toast` vermelho na cara. Zero ações sem resposta.
- **Foco Único:** Uma tela = Um objetivo principal. Não coloque 50 formulários na mesma visão. Quebre ações complexas em Modais ou Wizards passo a passo.
- **Micro-interações:** Use `hover:` states em todos os botões e links interagíveis. O usuário precisa saber que a tela está viva.
- **Acessibilidade:** Contraste real. Textos secundários não podem sumir no fundo preto. O que importa tem que gritar na tela.