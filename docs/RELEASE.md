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

## 1. Autenticação — leia isto antes de criar qualquer token

> 🚨 **Com 2FA ligado na conta npm, um token comum NÃO publica.**
> O CI não tem como digitar o código do autenticador, então o publish falha com:
>
> ```
> npm error code EOTP
> npm error This operation requires a one-time password from your authenticator.
> ```
>
> Isso **não é bug do workflow** — é o npm exigindo presença humana. Existem três
> saídas, e só uma é boa.

| Caminho | Esforço | Situação |
| --- | --- | --- |
| **A. Bootstrap local + OIDC** | ~5 min, uma vez | ✅ **Recomendado.** Sem token para sempre |
| **B. Token com "Bypass 2FA"** | ~2 min | ⚠️ Funciona hoje, **deprecado em jan/2027** |
| **C. Token stage-only** | ~10 min | 🛡️ Mais seguro, exige aprovar cada release |

### 🏆 Caminho A — bootstrap local + Trusted Publishing (OIDC)

O OIDC é a solução definitiva: credencial de vida curta, assinada pelo GitHub,
**sem token nenhum**. Mas tem uma limitação: **OIDC não publica a primeira versão** de um
pacote — o pacote precisa existir no npm antes de você configurar o publisher.

Por isso o fluxo é "publica uma vez local, depois nunca mais":

**Passo 1 — publique a primeira versão da sua máquina** (você tem o autenticador):

```bash
npm publish --access public --provenance=false --otp=123456
#                                                    ↑ código do seu app autenticador
```

> 🚨 **Não coloque `provenance` no `publishConfig` do `package.json`.**
> O npm lê `publishConfig` **com prioridade sobre flag de CLI e sobre variável de
> ambiente**. Com `provenance: true` lá, *qualquer* publish fora de um CI com OIDC
> falha com:
>
> ```
> npm error code EUSAGE
> npm error Automatic provenance generation not supported for provider: null
> ```
>
> Não adianta passar `--provenance=false` nem `NPM_CONFIG_PROVENANCE=false`: o
> `publishConfig` vence os dois. O provenance é controlado **por invocação** — o
> workflow de release passa `--provenance` explicitamente, o publish local não passa.
>
> O `--provenance=false` acima é por clarity e por segurança de quem roda o comando
> num repo onde alguém reinseriu a flag — mas o que resolve é o `package.json` estar limpo.

**Passo 2 — configure o publisher confiável** em
<https://www.npmjs.com/package/create-sdd-ai-stack/settings/trusted-publishers>:

| Campo | Valor |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `marcelinosandroni` |
| Repository | `sdd-ai-stack` |
| Workflow filename | `release.yml` (só o nome, com `.yml`) |
| Allowed actions | `npm publish` |

> ⚠️ O npm **não valida** essa configuração ao salvar. Errou o nome do workflow ou do
> repo, o erro só aparece na hora de publicar. Tudo é **case-sensitive**.

**Passo 3 — apague o secret** (deixe o OIDC Assumir):

```bash
gh secret delete NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

Pronto. Da próxima vez em diante:

```bash
npm run version:patch && git push origin main && git push origin --tags
```

Publica sozinho, com provenance, **sem token nenhum**. Pode até desligar
"Require two-factor authentication" do pacote depois — o OIDC não depende dele.

### ⚠️ Caminho B — token com "Bypass 2FA" (temporário)

Se quiser o CI funcionando **hoje** sem mexer na máquina:

Em <https://www.npmjs.com/settings/access-tokens>, crie um token granular com:

| Campo | Valor |
| --- | --- |
| Permissions | **Read and write** |
| Bypass 2FA | ✅ **marcado** |
| Package | `create-sdd-ai-stack` |

```bash
gh secret set NPM_TOKEN --repo marcelinosandroni/sdd-ai-stack
```

> **Só como ponte.** O npm avisa: *"a publicação direta com token granular será removida
> em janeiro de 2027"*. Além disso, há bug aberto ([npm/cli#9268](https://github.com/npm/cli/issues/9268))
> onde "Bypass 2FA" é ignorado pelo npm 11.x. Trate como prazo, não como solução.

### 🛡️ Caminho C — stage-only (mais seguro, mais atrito)

Token **Read and write (stage only)**: o CI sobe a versão, mas ela **não vai ao ar**.
Um maintainer precisa aprovar com 2FA:

```bash
npm stage publish          # no CI, com o token stage-only
npm stage list             # ver o que está pendente
npm stage approve --otp=123456
```

Combine com `Require two-factor authentication and disallow tokens` no
[package settings](https://www.npmjs.com/package/create-sdd-ai-stack/settings): token
vazado não consegue publicar nada sozinho. É a postura máxima de segurança — ao preço
de uma aprovação manual por release.

---

## 2. Como o workflow decide o modo

Ele não precisa saber: **o npm escolhe sozinho**.

| `NPM_TOKEN` no repo | O que o workflow faz | Como o npm publica |
| --- | --- | --- |
| **definido** | escreve a linha de token no `~/.npmrc` | modo token |
| **ausente** | não escreve **nada** no `.npmrc` | OIDC |

> ⚠️ **O passo `Publica` não define `NODE_AUTH_TOKEN` de propósito.** O npm só engata o
> OIDC quando o auth está **ausente**. Se `NODE_AUTH_TOKEN` estiver no ambiente, ele
> ignora o OIDC e tenta token — e volta a falhar.

> ⚠️ **Requisito de versão:** OIDC precisa de **npm ≥ 11.5.1** e **Node ≥ 22.14.0**.
> O Node 22 do runner do GitHub vem com npm 10.x, então o workflow roda
> `npm install -g npm@latest` antes de publicar. Sem isso o OIDC nunca engata.

> ⚠️ **Nunca** cole o token num arquivo, no `.npmrc` commitado, ou num commit.
> Se vazar: revogue em <https://www.npmjs.com/settings/access-tokens> imediatamente.

Verificar que está lá:

```bash
gh secret list --repo marcelinosandroni/sdd-ai-stack
# deve listar: NPM_TOKEN   Updated: <data>
```

No caminho A (OIDC), a lista deve estar **vazia** — e é isso que faz o npm usar OIDC.

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
| `npm >= 11.5.1` no job de publish | sem isso o OIDC não engata (Node 22 do runner traz npm 10.x) |
| `publishConfig.provenance` | o pacote é assinado pelo GitHub — prova de que saiu deste repo |

---

## 6. Problemas comuns

| Sintoma | Causa | Solução |
| --- | --- | --- |
| `EUSAGE` / "Automatic provenance generation not supported for provider: null" | `publishConfig.provenance: true` e o publish não saiu de um CI com OIDC | tire `provenance` do `publishConfig`; no local use `--provenance=false`, no CI `--provenance` |
| `EOTP` / "requires a one-time password" | **2FA ligado** e o token não tem "Bypass 2FA" | seção 1 — caminho A (OIDC) ou B (bypass) |
| `ENEEDAUTH` / "need auth" com OIDC configurado | `NODE_AUTH_TOKEN` presente no ambiente derruba o OIDC, **ou** o workflow não é o `release.yml`, **ou** o repo/owner está errado | confira os 3 campos no npmjs.com; eles são case-sensitive |
| `ENOENT` / OIDC não engata | npm < 11.5.1 ou Node < 22.14.0 | o workflow já sobe o npm; se persistir, atualize o `node-version` |
| `E403 Forbidden` | token sem permissão de escrita no pacote | regere com Read and write em `create-sdd-ai-stack` |
| `E_STAGE_REQUIRED` | token é stage-only e você chamou `npm publish` | use `npm stage publish` e aprove com `npm stage approve --otp` |
| `401 Unauthorized` | token expirado ou revogado | regere no npm e grave de novo |
| `cannot publish over previously published version` | já existe essa versão | bump a versão (`npm run version:patch`) |
| `tag 'v0.1.17' não bate com package.json '0.1.18'` | esqueceu de commitar o bump | `git add package.json && git commit -m "chore: v0.1.18"` |
| `faltando no pacote: X` | `files` do `package.json` incompleto | adicione o caminho em `files` |

> **Bug conhecido do npm:** token granular com "Bypass 2FA" sendo ignorado pelo npm 11.x
> ([npm/cli#9268](https://github.com/npm/cli/issues/9268)). Se o bypass "não funcionar",
> o caminho A (OIDC) é a saída — ele não depende de token nenhum.

---

## 7. Publicar localmente (escape, não é o caminho padrão)

Se precisar publicar da sua máquina:

```powershell
# PowerShell — o caminho de bootstrap (com 2FA ligado)
npm publish --access public --provenance=false --otp=123456
```

Sem 2FA, ou com token de bypass:

```powershell
$env:NODE_AUTH_TOKEN = "<seu token>"
npm publish --access public --provenance=false
```

> `--provenance=false` é obrigatório em publish local. O provenance só pode ser gerado
> dentro de um CI com OIDC (GitHub Actions, GitLab CI, CircleCI).

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
