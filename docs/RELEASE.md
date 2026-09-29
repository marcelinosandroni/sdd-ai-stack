# 🚀 RELEASE — publicar no npm

> **Fluxo único:** você versiona e cria a tag localmente; o **GitHub Actions publica**.
> Não existe `npm publish` manual neste projeto — é proposital, para não ter dois caminhos.

```text
npm run version:minor   →  0.1.17 → 0.2.0 (commita + cria tag v0.2.0)
git push origin main --tags  →  dispara o workflow Release  →  publica no npm
```

---

## 0. Como versionar (estamos em `0.x`)

O projeto está em **`0.1.x`** de propósito: as regras e o template ainda vão mudar com base
no uso real. Leitura das versões:

| Mudança | Bump | Exemplo | Version bump |
| --- | --- | --- | --- |
| Correção de bug, ajuste de doc, nova regra pontual | **patch** | `0.1.17 → 0.1.18` | `npm run version:patch` |
| Regra nova, feature nova no template, Breaking em config | **minor** | `0.1.17 → 0.2.0` | `npm run version:minor` |
| Reescritura de regra estrutural (ex.: Next 16 → 17) | **major** | `0.1.17 → 1.0.0` | `npm run version:major` |

> Enquanto em `0.x`, **o minor é o breaking change**. Mudar a estrutura das regras ou
> do template sobe o minor, não o patch. O `major` fica reservado para quando a interface
> estabilizar e a gente for para `1.0.0`.

---

## 1. Criar o token (uma vez)

No npm: <https://www.npmjs.com/settings/access-tokens>

Escolha **granular** (o mais seguro):

| Campo | Valor |
| --- | --- |
| Token name | `sdd-ai-stack-release` |
| Expiration | máximo que o npm permitir (90 dias) — **renove antes** |
| Package type | **Granular access** |
| Package name | `create-sdd-ai-stack` |
| Permissions | **Read and write** |
| Organizations | deixe vazio (o pacote é pessoal) |

Copie o token gerado (`npm_...`). Ele só aparece uma vez.

> ⚠️ **Nunca** cole o token num arquivo, no `.npmrc` commitado, ou num commit.
> Se vazar: revogue em <https://www.npmjs.com/settings/access-tokens> imediatamente.

### Alternativa sem token: Trusted Publishing (OIDC)

O npm suporta publicar direto do GitHub Actions **sem nenhum secret**.
Em <https://www.npmjs.com/package/create-sdd-ai-stack/settings/trusted-publishers>, adicione:

| Campo | Valor |
| --- | --- |
| Provider | GitHub Actions |
| Organization | `marcelinosandroni` |
| Repository | `sdd-ai-stack` |
| Workflow filename | `release.yml` |

Se fizer isso, apague o secret `NPM_TOKEN` — o workflow funciona igual (o `NODE_AUTH_TOKEN`
vai vazio e o npm usa a identidade OIDC do runner).

---

## 2. Gravar o secret no repositório

O nome do secret é **`NPM_TOKEN`** (é o que o workflow lê).

```bash
# passo 1: abra o navegador já logado no GitHub e gere/copie o token
# passo 2: cole e execute — o token NÃO fica no histórico do shell
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

> O comando acima pede o token de forma oculta. Se preferir colar direto:
> <https://github.com/marcelinosandroni/sdd-ai-stack/settings/secrets/actions/new>
> (Secret name: `NPM_TOKEN`)

### Verificar que está lá

```bash
gh secret list --repo marcelinosandroni/sdd-ai-stack
# deve listar: NPM_TOKEN   Updated: <data>
```

---

## 3. Testar sem publicar (recomendado na primeira vez)

Depois que o workflow estiver na `main`, valide sem queimar versão:

```bash
gh workflow run release.yml -f version=9.9.9 -f dry_run=true
gh run watch
```

Isso roda testes, checa links, confere o conteúdo do tarball, e faz
`npm publish --dry-run`. **Nada é publicado.**

---

## 4. Publicar de verdade

```bash
# 1. main atualizada e CI verde
git checkout main && git pull

# 2. bump de versão (commita o package.json e cria a tag)
npm run version:patch    # ou version:minor / version:major

# 3. manda código e tag
git push origin main
git push origin --tags
```

O workflow dispara com o push da tag. Acompanhe:

```bash
gh run list
gh run watch
```

Se tudo der certo: <https://www.npmjs.com/package/create-sdd-ai-stack>

---

## 5. O que o workflow checa antes de publicar

| Guarda | Motivo |
| --- | --- |
| `npm test` (22 testes) | nunca publica com teste vermelho |
| `node SKILLS/check-docs/check-docs.mjs` | nenhuma regra apontando pra arquivo morto |
| tag `vX.Y.Z` == `version` do `package.json` | evita publicar 0.1.18 quando a tag é 0.1.17 |
| 10 arquivos essenciais presentes no tarball | pega `files` mal configurado no `package.json` |
| `concurrency: release-npm` | dois publishes simultâneos não correm em paralelo |
| `--provenance` | o pacote é assinado pelo GitHub — prova de que saiu deste repo |

---

## 6. Problemas comuns

| Sintoma | Causa | Solução |
| --- | --- | --- |
| `secret NPM_TOKEN não encontrado` | secret ausente no repositório | `gh secret set NPM_TOKEN` |
| `ENEEDAUTH / need auth` | token expirado ou revogado | regere no npm e grave de novo |
| `401 Unauthorized` | secret inválido | confira a data de expiração no npm |
| `E403 Forbidden` | token sem permissão de escrita no pacote | regere com Read and write em `create-sdd-ai-stack` |
| `cannot publish over previously published version` | já existe essa versão | bump a versão (`npm run version:patch`) |
| `tag 'v0.1.17' não bate com package.json '0.1.18'` | esqueceu de commitar o bump | `git add package.json && git commit -m "chore: v0.1.18"` |
| `EPUBLISHCONFLICT` com provenance | token não tem permissão de provenance | use Trusted Publishing (seção 1, alternativa) |
| `faltando no pacote: X` | `files` do `package.json` incompleto | adicione o caminho em `files` |

---

## 7. Publicar localmente (escape, não é o caminho padrão)

Se precisar publicar da sua máquina:

```powershell
# PowerShell
$env:NODE_AUTH_TOKEN = "<seu token>"
npm publish --access public
```

> O `.npmrc` da raiz usa `${NODE_AUTH_TOKEN}` justamente para que o token
> **nunca** fique gravado em arquivo.

E confira antes:

```bash
npm run check:pack   # mostra exatamente o que vai subir
```

---

## 8. Checklist antes de apertar o botão

- [ ] `npm test` verde
- [ ] `main` sincronizada com `origin`
- [ ] `NPM_TOKEN` existe e não expirou
- [ ] `npm run check:pack` mostra os arquivos esperados
- [ ] `version:patch|minor|major` escolhido conscientemente
- [ ] `git push origin main` e `git push origin --tags` feitos

> **Publicar é irreversível.** Versão publicada não pode ser removida (só despublicada,
> e o npm nunca reutiliza o número). A tag também não deve ser deletada.
