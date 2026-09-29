import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { checkLinks, collectMarkdown } from "../lib/check-links.mjs";

const DOC_ROOTS = [
  "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md", "DESIGN.md",
  "NEXT.md", "NODE.md", "REACT.md", "README.md", "specs", "stacks", "docs", "SKILLS",
];

test("documentação: existe todo o documento de regra obrigatório", () => {
  const found = new Set(collectMarkdown(DOC_ROOTS));
  for (const required of [
    "AGENTS.md", "APP.md", "APP-STACK.md", "ARCHITECTURE.md", "DESIGN.md",
    "NEXT.md", "NODE.md", "REACT.md", "specs/PLAN.md", "stacks/README.md",
  ]) {
    assert.ok(found.has(required), `faltou ${required}`);
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

test("publish: o passo Publica passa --provenance explicitamente", () => {
  const yml = fs.readFileSync(".github/workflows/release.yml", "utf8");
  const publishStep = yml.slice(yml.indexOf("- name: Publica"));
  assert.match(publishStep, /npm publish .*--provenance/);
});

test("publish: o passo Publica NÃO define NODE_AUTH_TOKEN (senão OIDC não engata)", () => {
  const yml = fs.readFileSync(".github/workflows/release.yml", "utf8");
  const publishStep = yml.slice(yml.indexOf("- name: Publica"));
  assert.doesNotMatch(
    publishStep,
    /NODE_AUTH_TOKEN/,
    "NODE_AUTH_TOKEN no passo Publica faz o npm ignorar o OIDC e tentar token",
  );
});
