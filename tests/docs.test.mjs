import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { checkLinks, collectMarkdown } from "../lib/check-links.mjs";

const DOC_ROOTS = [
  "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md", "DESIGN.md",
  "README.md", "specs", "stacks", "docs", "SKILLS",
];

/** Every stack document the index promises must exist. */
const REQUIRED_STACK_DOCS = [
  "stacks/README.md",
  "stacks/clean-code.md",
  "stacks/architecture.md",
  "stacks/language.md",
  "stacks/agent-tooling.md",
  "stacks/next.md",
  "stacks/java.md",
  "stacks/dotnet.md",
  "stacks/go.md",
  "stacks/python.md",
  "stacks/node.md",
  "stacks/node-frameworks.md",
  "stacks/javascript.md",
  "stacks/react.md",
  "stacks/angular.md",
  "stacks/vue.md",
  "stacks/svelte.md",
  "stacks/typescript.md",
  "stacks/tailwind.md",
  "stacks/shadcn.md",
  "stacks/testing.md",
  "stacks/database.md",
  "stacks/ai.md",
  "stacks/git.md",
  "stacks/ci.md",
];

test("documentação: existe todo o documento de regra obrigatório", () => {
  const found = new Set(collectMarkdown(DOC_ROOTS));
  for (const required of [
    "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md", "DESIGN.md",
    "specs/PLAN.md", "stacks/README.md", "stacks/next.md", "stacks/node.md", "stacks/react.md",
  ]) {
    assert.ok(found.has(required), `faltou ${required}`);
  }
});

test("documentação: todo documento de stack listado no índice existe", () => {
  const found = new Set(collectMarkdown(["stacks"]));
  const missing = REQUIRED_STACK_DOCS.filter((d) => !found.has(d));
  assert.deepEqual(missing, [], `stacks/ is missing: ${missing.join(", ")}`);
});

test("documentação: o índice de stacks linka cada documento", () => {
  // the index lives INSIDE stacks/, so its links are sibling-relative: (./name.md)
  const index = fs.readFileSync("stacks/README.md", "utf8");
  for (const doc of REQUIRED_STACK_DOCS) {
    if (doc === "stacks/README.md") continue;
    const name = doc.replace("stacks/", "");
    assert.ok(
      index.includes(`(./${name})`),
      `stacks/README.md does not link ./${name}`,
    );
  }
});

test("documentação: cada doc de stack declara o spine clean-code", () => {
  // every stack rule maps the shared spine; a doc that forgets to say so drifts
  const perStack = REQUIRED_STACK_DOCS.filter(
    (d) =>
      d !== "stacks/README.md" &&
      d !== "stacks/clean-code.md" &&
      d !== "stacks/agent-tooling.md" &&
      d !== "stacks/language.md",
  );
  for (const doc of perStack) {
    const text = fs.readFileSync(doc, "utf8");
    assert.match(
      text,
      /clean-code\.md/,
      `${doc} does not reference clean-code.md`,
    );
  }
});

test("documentação: nenhum link relativo quebrado", () => {
  const broken = checkLinks(DOC_ROOTS);
  const report = broken.map((b) => `  ${b.file} -> ${b.link}`).join("\n");
  assert.equal(broken.length, 0, `links quebrados:\n${report}`);
});

test("documentação: todo documento de stack é linkado a partir de stacks/README.md", () => {
  const readme = collectMarkdown(["stacks/README.md"]);
  assert.equal(readme.length, 1);
  const index = checkLinks(["stacks/README.md"]);
  assert.equal(index.length, 0, "stacks/README.md tem link quebrado");
});

/* ── Publish: travas de regressão ───────────────────────────
   Ambos já quebraram de verdade:
   - provenance no publishConfig => "provider: null" no publish local
   - NODE_AUTH_TOKEN no passo Publica => OIDC nunca engata            */

test("publish: provenance NÃO pode estar no publishConfig", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.notEqual(
    pkg.publishConfig?.provenance,
    true,
    "publishConfig.provenance quebra o bootstrap local — o npm lê publishConfig " +
      "com prioridade sobre flag de CLI. Use --provenance só no workflow de release.",
  );
  assert.equal(pkg.publishConfig?.access, "public");
});

test("publish: the Publica step passes --provenance explicitly", () => {
  const yml = fs.readFileSync(".github/workflows/release.yml", "utf8");
  const publishStep = yml.slice(yml.indexOf("- name: Publica"));
  assert.match(publishStep, /npm publish .*--provenance/);
});

test("publish: the Publica step does NOT define NODE_AUTH_TOKEN (or OIDC never engages)", () => {
  const yml = fs.readFileSync(".github/workflows/release.yml", "utf8");
  const publishStep = yml.slice(yml.indexOf("- name: Publica"));
  assert.doesNotMatch(
    publishStep,
    /NODE_AUTH_TOKEN/,
    "NODE_AUTH_TOKEN no passo Publica faz o npm ignorar o OIDC e tentar token",
  );
});

test("publish: the project .npmrc must not declare _authToken", () => {
  // the project .npmrc takes precedence over the user's ~/.npmrc. An _authToken
  // line here shadows the user's token and, with the variable empty, silently
  // zeroes auth everywhere: 401 on whoami, 404 on the first publish's PUT (an
  // error that looks like a missing package, but is missing auth).
  const npmrc = fs
    .readFileSync(".npmrc", "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  assert.doesNotMatch(
    npmrc,
    /_authToken/,
    "the project .npmrc must not declare _authToken — it shadows the user's ~/.npmrc",
  );
  // e o registry precisa continuar lá, senão o npm publish usa o registro errado
  assert.match(npmrc, /registry\s*=\s*https:\/\/registry\.npmjs\.org\//);
});

test("publish: the Authenticate step injects the token via GITHUB_ENV, not into a file", () => {
  const yml = fs.readFileSync(".github/workflows/release.yml", "utf8");
  const authStep = yml.slice(yml.indexOf("- name: Autentica"), yml.indexOf("- name: Publica"));
  assert.match(authStep, /NODE_AUTH_TOKEN=\$\{NPM_TOKEN\}.*GITHUB_ENV/);
  assert.doesNotMatch(
    authStep,
    /\.npmrc/,
    "writing a token into the runner .npmrc is not enough: the project .npmrc wins",
  );
});
