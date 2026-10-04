#!/usr/bin/env node
/**
 * SKILL: create-feature (cross-platform; create-feature.sh mirrors it)
 * Usage: node SDD/SKILLS/create-feature/create-feature.mjs <slice-name>
 *
 * Generates a vertical slice that COMPILES on the first run. A skeleton that
 * fails `npm run typecheck` teaches the agent nothing except that the SKILL is
 * broken — so every generated file here type-checks, and the places that
 * genuinely need a human decision are `throw new NotImplementedError()` at
 * runtime, not a type error at build time.
 */
import fs from "node:fs";
import path from "node:path";

const raw = process.argv[2];
if (!raw) {
  console.error("Usage: node create-feature.mjs <slice-name>");
  process.exit(1);
}

const name = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
if (!name) {
  console.error("✖ Invalid name.");
  process.exit(1);
}

const Pascal = name
  .split(/[-_\s]+/)
  .filter(Boolean)
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join("");

const dir = path.resolve(process.cwd(), "src", "features", name);
// The unit tests live beside the slice, not beside this script: the skill runs
// from the app's root, so `src/features/<name>` and `tests/unit` share it.
const testDir = path.resolve(process.cwd(), "tests", "unit");

/**
 * Which stack is this app, read from the app rather than assumed by the skill.
 *
 * A Server Action is a Next.js invention, and `server-only` plus `next/cache` are
 * Next packages. Emitting them unconditionally means the skill produces a slice that
 * cannot typecheck in every template that is not Next — which is the same class of
 * bug as the stale `create-feature.sh` this skill used to mirror: the file that
 * nobody exercised was the file that was wrong.
 *
 * Detection is a file on disk rather than a flag, because the app already declares
 * its stack and there is no reason to ask it a second time. `next.config.ts` is the
 * marker; the dependency is the fallback for an app that has not added it yet.
 */
function detectStack(root) {
  if (fs.existsSync(path.join(root, "next.config.ts"))) return "next";

  const pkgPath = path.join(root, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.dependencies?.next || pkg.devDependencies?.next) return "next";
  }
  return "client";
}

const STACK = detectStack(process.cwd());
const IS_NEXT = STACK === "next";
const STACK_DOC = IS_NEXT ? "next.md" : "react.md";

/**
 * The five steps of a write are the same everywhere. What changes is the machinery
 * around them: Next has a server boundary, a cache to invalidate and a session to
 * read; a browser-only template has none of those, and importing them anyway is how
 * a slice ends up referencing a package the project does not depend on.
 *
 * So the differences are precomputed here rather than interleaved through the
 * template. The alternative — two near-identical 70-line templates — guarantees they
 * drift apart the first time someone fixes a typo in one of them.
 */
const SERVER_DIRECTIVE = IS_NEXT ? `"use server";\n` : "";
const CACHE_IMPORTS = IS_NEXT ? 'import { revalidatePath, updateTag } from "next/cache";' : "";
const AUTH_IMPORT = IS_NEXT
  ? 'import { ForbiddenError, requireUser, UnauthorizedError } from "@/shared/server/auth";'
  : "";
const AUTH_STEPS = IS_NEXT
  ? `    // 1. AUTHENTICATION
    const user = await requireUser();

    // 2. AUTHORIZATION
    if (user.role === "banned") {
      throw new ForbiddenError("FORBIDDEN");
    }

`
  : `    // 1. AUTHENTICATION and 2. AUTHORIZATION happen wherever this app does
    // them. There is no session to read in a browser-only template, and inventing
    // one here would be the skill deciding the app's security model for it.
`;
const OWNER_ID = IS_NEXT ? "user.id" : '""';
const CACHE_STEP = IS_NEXT
  ? `
    // 5. CACHE — read-your-writes for interactive UI
    updateTag("${name}");
    revalidatePath("/app");
`
  : "";
const AUTH_CATCH = IS_NEXT
  ? `    if (cause instanceof UnauthorizedError) {
      return { ok: false, error: "Sign in to continue." };
    }
    if (cause instanceof ForbiddenError || cause instanceof ${Pascal}Error) {
      return { ok: false, error: "Access denied." };
    }
`
  : `    if (cause instanceof ${Pascal}Error) {
      return { ok: false, error: "Access denied." };
    }
`;
if (fs.existsSync(dir)) {
  console.error(`✖ Already exists: ${dir}`);
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

/* ── domain ───────────────────────────────────────────────── */

write(
  `domain/I${Pascal}Repository.ts`,
  `/**
 * The port for the ${Pascal} slice. Lives INSIDE the slice, next to the
 * implementation — a global src/types/ for domain types is forbidden.
 * See SDD/ARCHITECTURE.md §2 and SDD/stacks/${STACK_DOC} §2.
 *
 * Domain code imports NOTHING external. No Prisma, no fetch, no Next.
 */
export interface ${Pascal}Entity {
  id: string;
  ownerId: string;
  title: string;
  createdAt: Date;
}

export interface Create${Pascal}Data {
  ownerId: string;
  title: string;
}

export interface I${Pascal}Repository {
  create(data: Create${Pascal}Data): Promise<${Pascal}Entity>;
  findById(id: string): Promise<${Pascal}Entity | null>;
  listByOwner(ownerId: string): Promise<${Pascal}Entity[]>;
}
`,
);

write(
  `domain/${name}.schema.ts`,
  `import { z } from "zod";

/**
 * Zod is the ONLY source of truth for input. The client check is a courtesy.
 * See SDD/stacks/${STACK_DOC} §5.
 *
 * TODO: replace this with the real fields.
 */
export const Create${Pascal}Schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title needs at least 3 characters")
    .max(120, "Title is too long"),
});

export type Create${Pascal}Input = z.infer<typeof Create${Pascal}Schema>;
`,
);

/* ── application ──────────────────────────────────────────── */

write(
  `application/create-${name}.usecase.ts`,
  `import type { ${Pascal}Entity, Create${Pascal}Data, I${Pascal}Repository } from "../domain/I${Pascal}Repository";
import { Create${Pascal}Schema, type Create${Pascal}Input } from "../domain/${name}.schema";

/** Thrown for expected business failures. The action maps it to a message. */
export class ${Pascal}Error extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "${Pascal}Error";
  }
}

export class Create${Pascal}UseCase {
  constructor(private readonly repo: I${Pascal}Repository) {}

  async execute(input: Create${Pascal}Input & Create${Pascal}Data): Promise<${Pascal}Entity> {
    // The schema is the source of truth, so the use case validates again: a
    // Server Action is a public HTTP endpoint and the use case is reachable
    // from anywhere.
    const { title } = Create${Pascal}Schema.parse({ title: input.title });

    if (!input.ownerId) {
      throw new ${Pascal}Error("Owner is required", "${Pascal.toUpperCase()}_MISSING_OWNER");
    }

    return this.repo.create({ ownerId: input.ownerId, title });
  }
}
`,
);

/* ── infrastructure ───────────────────────────────────────── */

write(
  `infrastructure/${name}.repository.ts`,
  `${IS_NEXT ? 'import "server-only";\n' : ""}import { randomUUID } from "node:crypto";
import type {
  ${Pascal}Entity,
  Create${Pascal}Data,
  I${Pascal}Repository,
} from "../domain/I${Pascal}Repository";

/**
 * REPLACE with Prisma. The domain interface does NOT change.
 * See SDD/stacks/database.md.
 *
 * The store hangs off globalThis on purpose: in a production build Next compiles
 * each route into its own module registry, so a plain module-level Map gives the
 * Server Action and the page render DIFFERENT stores. A real database has no
 * such problem.
 */
const globalStore = globalThis as typeof globalThis & {
  __sdd${Pascal}Store?: Map<string, ${Pascal}Entity>;
};

export class ${Pascal}Repository implements I${Pascal}Repository {
  private readonly store: Map<string, ${Pascal}Entity>;

  constructor(store?: Map<string, ${Pascal}Entity>) {
    if (store) {
      this.store = store;
      return;
    }
    globalStore.__sdd${Pascal}Store ??= new Map();
    this.store = globalStore.__sdd${Pascal}Store;
  }

  async create(data: Create${Pascal}Data): Promise<${Pascal}Entity> {
    const entity: ${Pascal}Entity = {
      id: randomUUID(),
      ownerId: data.ownerId,
      title: data.title,
      createdAt: new Date(),
    };
    this.store.set(entity.id, entity);
    return entity;
  }

  async findById(id: string): Promise<${Pascal}Entity | null> {
    return this.store.get(id) ?? null;
  }

  async listByOwner(ownerId: string): Promise<${Pascal}Entity[]> {
    return [...this.store.values()]
      .filter((entity) => entity.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
`,
);

/* ── wiring ───────────────────────────────────────────────── */

write(
  "container.ts",
  `${IS_NEXT ? 'import "server-only";\n' : ""}import { Create${Pascal}UseCase } from "./application/create-${name}.usecase";
import type { I${Pascal}Repository } from "./domain/I${Pascal}Repository";
import { ${Pascal}Repository } from "./infrastructure/${name}.repository";

export interface I${Pascal}UseCases {
  create${Pascal}: Create${Pascal}UseCase;
}

export function create${Pascal}UseCases(repo: I${Pascal}Repository): I${Pascal}UseCases {
  return {
    create${Pascal}: new Create${Pascal}UseCase(repo),
  };
}

/**
 * The single wiring point. Swap the repository for Prisma here and nothing
 * above it changes — that is the whole point of the port.
 */
const repository = new ${Pascal}Repository();

export const ${Pascal}UseCases: I${Pascal}UseCases = create${Pascal}UseCases(repository);
export const ${Pascal}RepositoryInstance = repository;
`,
);

/* ── read entrypoint ──────────────────────────────────────── */

write(
  "queries.ts",
  STACK === "next"
    ? `import "server-only";
import { ${Pascal}RepositoryInstance } from "./container";

/**
 * Reads. Mark a function 'use cache' + cacheLife when the result can be shared
 * between users; leave it dynamic when it depends on the request.
 * See SDD/stacks/${STACK_DOC} §4.
 */
export async function list${Pascal}(ownerId: string) {
  return ${Pascal}RepositoryInstance.listByOwner(ownerId);
}
`
    : `import { ${Pascal}RepositoryInstance } from "./container";

/**
 * Reads. No 'use server' and no 'server-only' here: this template has no server
 * boundary, so claiming one would be a lie the bundler cannot keep.
 *
 * When this app grows a server, move this file behind it and add the boundary
 * back deliberately — not by copying the Next template.
 */
export async function list${Pascal}(ownerId: string) {
  return ${Pascal}RepositoryInstance.listByOwner(ownerId);
}
`,
);

/* ── write entrypoint ─────────────────────────────────────── */

write(
  "actions.ts",
  `${SERVER_DIRECTIVE}${CACHE_IMPORTS}
import { z } from "zod";
import { ${Pascal}UseCases } from "./container";
import { ${Pascal}Error } from "./application/create-${name}.usecase";
import { Create${Pascal}Schema } from "./domain/${name}.schema";
${AUTH_IMPORT}

export type ${Pascal}ActionState = {
  ok: boolean;
  errors?: Record<string, string[] | undefined>;
  error?: string;
};

/**
 * ${IS_NEXT ? "A Server Action is a PUBLIC HTTP endpoint. The client is untrusted, so the" : "This runs in the browser, where the input is still untrusted, so the"}
 * order is fixed:
 *
 *   1. authentication    who is calling
 *   2. authorization     may they do this
 *   3. validation        is the input well-formed
 *   4. mutation          through a use case, never raw infra
 *   5. cache             invalidate what just changed${IS_NEXT ? "" : " (no cache to invalidate yet)"}
 *
 * Errors return state, they do not throw:${IS_NEXT ? " throwing sends the user to" : " a thrown error loses what the user was told and gives"}
 * error.tsx instead of showing them what went wrong.
 */
export async function create${Pascal}Action(
  _prev: ${Pascal}ActionState,
  formData: FormData,
): Promise<${Pascal}ActionState> {
  try {
${AUTH_STEPS}
    // 3. VALIDATION
    const parsed = Create${Pascal}Schema.safeParse({
      title: formData.get("title"),
    });

    if (!parsed.success) {
      // Zod 4 types fieldErrors as string[] | undefined, so the state type
      // mirrors that. Do not "fix" this with a cast.
      return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
    }

    // 4. MUTATION
    const { create${Pascal} } = ${Pascal}UseCases;
    await create${Pascal}.execute({ ...parsed.data, ownerId: ${OWNER_ID} });
${CACHE_STEP}
    return { ok: true };
  } catch (cause) {
${AUTH_CATCH}    ${AUTH_CATCH}    return { ok: false, error: "Could not complete the request. Try again." };
  }
}
`,
);

/* ── the test ─────────────────────────────────────────────── */

// A slice that compiles and cannot be tested is a slice nobody will test.
//
// The skill already told the agent to write this file by hand, and every project
// that used the skill therefore started with a red suite or, worse, no suite at
// all. The dogfood run found this: create-feature produced 7 files and zero
// tests. Writing the failing-but-honest test here costs one template and makes
// the first `npm run test` show the agent exactly what to fill in.
const testDirPath = testDir;
fs.mkdirSync(testDirPath, { recursive: true });
fs.writeFileSync(
  path.join(testDirPath, `${name}.test.ts`),
  `import { describe, expect, it } from "vitest";
import {
  Create${Pascal}UseCase,
  ${Pascal}Error,
} from "@/features/${name}/application/create-${name}.usecase";
import type {
  Create${Pascal}Data,
  I${Pascal}Repository,
  ${Pascal}Entity,
} from "@/features/${name}/domain/I${Pascal}Repository";

/**
 * An in-memory repository. The generated infrastructure is a stand-in anyway —
 * see infrastructure/${name}.repository.ts.
 */
function makeRepo() {
  const created: Create${Pascal}Data[] = [];
  const repo: I${Pascal}Repository = {
    create: async (input) => {
      created.push(input);
      return { id: "id-1", createdAt: new Date(), ...input } as ${Pascal}Entity;
    },
    findById: async () => null,
    listByOwner: async (ownerId) =>
      created
        .filter((row) => row.ownerId === ownerId)
        .map((row, index) => ({ id: \`id-\${index}\`, createdAt: new Date(), ...row })),
  };
  return { repo, created };
}

describe("Create${Pascal}UseCase", () => {
  it("creates a record for a valid input", async () => {
    const { repo, created } = makeRepo();
    const result = await new Create${Pascal}UseCase(repo).execute({
      title: "A title",
      ownerId: "owner-1",
    });

    expect(result.title).toBe("A title");
    expect(created).toHaveLength(1);
  });

  it("refuses a missing owner, because a record with no owner cannot be listed", async () => {
    const { repo } = makeRepo();
    const useCase = new Create${Pascal}UseCase(repo);

    await expect(useCase.execute({ title: "A title" } as never)).rejects.toThrow(${Pascal}Error);
  });

  it("rejects a title that violates the schema", async () => {
    const { repo } = makeRepo();
    const useCase = new Create${Pascal}UseCase(repo);

    // TODO: the generated schema accepts any title. Replace this with the real
    // invariant of your domain — this is the test that will fail when you add it.
    await expect(useCase.execute({ title: "" } as never)).rejects.toThrow();
  });
});
`,
  "utf8",
);
console.log(`✓ Test created at tests/unit/${name}.test.ts`);

/* ── guidance ─────────────────────────────────────────────── */

console.log(`✓ Slice created at ${path.relative(process.cwd(), dir)}`);
console.log("");
console.log("The slice COMPILES and HAS A TEST. Both are placeholders. Next:");
console.log(`  1. domain/${name}.schema.ts      add the real fields`);
console.log(`  2. application/create-${name}.usecase.ts   the business rules`);
console.log(`  3. infrastructure/${name}.repository.ts     swap in Prisma`);
console.log(`  4. tests/unit/${name}.test.ts     replace the TODO with your invariant`);
console.log(
  IS_NEXT
    ? "  5. wire the route in src/app/ (routing only)"
    : `  5. render it from a component in src/features/${name}/ui/`,
);
console.log("");
console.log("Then run: npm run typecheck && npm run lint && npm run test");
console.log("");
console.log("Do NOT mark the task [x] until the E2E proves the flow. See SDD/PREFLIGHT.md");
