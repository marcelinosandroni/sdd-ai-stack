import assert from "node:assert/strict";
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
