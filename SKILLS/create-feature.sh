#!/usr/bin/env bash
# SKILL: create-feature
# Cria um novo vertical slice em src/features/<nome>/ com a estrutura padrão.
set -euo pipefail

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "Uso: create-feature.sh <nome-do-slice>"
  exit 1
fi

DIR="src/features/${NAME}"

if [ -e "$DIR" ]; then
  echo "✖ Já existe: $DIR"
  exit 1
fi

mkdir -p "$DIR"/{domain,application,infrastructure,ui}

cat > "$DIR/domain/I$(echo "$NAME" | sed 's/^\(.\)/\U\1/')Repository.ts" <<EOF
export interface I$(echo "$NAME" | sed 's/^\(.\)/\U\1/')Repository {
  // TODO: contratos do domínio. Sem dependência externa.
}
EOF

cat > "$DIR/domain/${NAME}.schema.ts" <<EOF
import { z } from "zod";

export const ${NAME^}Schema = z.object({
  // TODO: campos + validações
});

export type ${NAME^}Input = z.infer<typeof ${NAME^}Schema>;
EOF

cat > "$DIR/application/create-${NAME}.usecase.ts" <<EOF
import type { ${NAME^}Input } from "../domain/${NAME}.schema";
import type { I${NAME^}Repository } from "../domain/I${NAME^}Repository";

export class Create${NAME^}UseCase {
  constructor(private readonly repo: I${NAME^}Repository) {}

  async execute(input: ${NAME^}Input) {
    // TODO: regra de negócio pura. Sem Next, sem Prisma.
    throw new Error("not implemented");
  }
}
EOF

cat > "$DIR/container.ts" <<EOF
import "server-only";
import { Create${NAME^}UseCase } from "./application/create-${NAME}.usecase";
import type { I${NAME^}Repository } from "./domain/I${NAME^}Repository";

export function create${NAME^}UseCases(repo: I${NAME^}Repository) {
  return {
    create${NAME^}: new Create${NAME^}UseCase(repo),
  };
}
EOF

cat > "$DIR/queries.ts" <<EOF
import "server-only";
// TODO: leituras do domínio. Marque com 'use cache' quando fizer sentido.
// Ver SDD/NEXT.md §4 e §6.

export async function list${NAME^}() {
  // TODO
  throw new Error("not implemented");
}
EOF

cat > "$DIR/actions.ts" <<EOF
"use server";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { create${NAME^}UseCases } from "./container";
import { ${NAME^}Schema } from "./domain/${NAME}.schema";

export type ${NAME^}ActionState = {
  ok: boolean;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function create${NAME^}Action(
  _prev: ${NAME^}ActionState,
  formData: FormData,
): Promise<${NAME^}ActionState> {
  // 1. auth  2. zod  3. autorização  4. use case  5. cache
  const parsed = ${NAME^}Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const { create${NAME^} } = create${NAME^}UseCases(/* repo */ undefined as never);
    await create${NAME^}.execute(parsed.data);
    updateTag("${NAME}");
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível concluir. Tente novamente." };
  }
}
EOF

echo "✓ Slice criado em $DIR"
echo "  1. Implemente o repositório em infrastructure/"
echo "  2. Escreva o teste em tests/unit/"
echo "  3. Registre a task em SDD/specs/PLAN.md"
