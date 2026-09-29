#!/usr/bin/env node
/**
 * SKILL: create-feature (versão multiplataforma, espelha create-feature.sh)
 * Uso: node SDD/SKILLS/create-feature/create-feature.mjs <nome-do-slice>
 */
import fs from "node:fs";
import path from "node:path";

const raw = process.argv[2];
if (!raw) {
  console.error("Uso: node create-feature.mjs <nome-do-slice>");
  process.exit(1);
}

const name = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
if (!name) {
  console.error("✖ Nome inválido.");
  process.exit(1);
}

const Pascal = name
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join("");

const dir = path.resolve(process.cwd(), "src", "features", name);
if (fs.existsSync(dir)) {
  console.error(`✖ Já existe: ${dir}`);
  process.exit(1);
}

for (const sub of ["domain", "application", "infrastructure", "ui"]) {
  fs.mkdirSync(path.join(dir, sub), { recursive: true });
}

const write = (rel, body) => {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body, "utf8");
};

write(`domain/I${Pascal}Repository.ts`, `export interface I${Pascal}Repository {
  // TODO: contratos do domínio. Sem dependência externa.
}
`);

write(`domain/${name}.schema.ts`, `import { z } from "zod";

export const ${Pascal}Schema = z.object({
  // TODO: campos + validações
});

export type ${Pascal}Input = z.infer<typeof ${Pascal}Schema>;
`);

write(`application/create-${name}.usecase.ts`, `import type { ${Pascal}Input } from "../domain/${name}.schema";
import type { I${Pascal}Repository } from "../domain/I${Pascal}Repository";

export class Create${Pascal}UseCase {
  constructor(private readonly repo: I${Pascal}Repository) {}

  async execute(input: ${Pascal}Input) {
    // TODO: regra de negócio pura. Sem Next, sem Prisma.
    throw new Error("not implemented");
  }
}
`);

write("container.ts", `import "server-only";
import { Create${Pascal}UseCase } from "./application/create-${name}.usecase";
import type { I${Pascal}Repository } from "./domain/I${Pascal}Repository";

export function create${Pascal}UseCases(repo: I${Pascal}Repository) {
  return {
    create${Pascal}: new Create${Pascal}UseCase(repo),
  };
}
`);

write("queries.ts", `import "server-only";
// TODO: leituras do domínio. Marque com 'use cache' quando fizer sentido.
// Ver SDD/NEXT.md §4 e §6.

export async function list${Pascal}() {
  // TODO
  throw new Error("not implemented");
}
`);

write("actions.ts", `"use server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { create${Pascal}UseCases } from "./container";
import { ${Pascal}Schema } from "./domain/${name}.schema";

export type ${Pascal}ActionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function create${Pascal}Action(
  _prev: ${Pascal}ActionState,
  formData: FormData,
): Promise<${Pascal}ActionState> {
  // 1. auth  2. zod  3. autorização  4. use case  5. cache
  const parsed = ${Pascal}Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const { create${Pascal} } = create${Pascal}UseCases(/* repo */ undefined as never);
    await create${Pascal}.execute(parsed.data);
    updateTag("${name}");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível concluir. Tente novamente." };
  }
}
`);

console.log(`✓ Slice criado em ${path.relative(process.cwd(), dir)}`);
console.log("  1. Implemente o repositório em infrastructure/");
console.log("  2. Escreva o teste em tests/unit/");
console.log("  3. Registre a task em SDD/specs/PLAN.md");
