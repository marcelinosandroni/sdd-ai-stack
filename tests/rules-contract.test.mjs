import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_RULES = path.join(REPO_ROOT, "SKILLS", "check-rules", "check-rules.mjs");

/**
 * RULE 1 exists, is named in CI, and was cited as proof this repository obeys its
 * own language law. For months it was green over a design system documented
 * entirely in Portuguese.
 *
 * Two independent reasons, and both had to be fixed for it to bite:
 *
 *   1. Its pattern list was built from one remembered error string. Fifteen
 *      patterns later it still passed — because a pattern nobody thought of cannot
 *      catch anything.
 *   2. It only walked `src/` when its argument was a *generated app*, and CI passes
 *      no argument. So `template/next/src` — the only code a consumer receives —
 *      was the single place the law was never applied. The branch that skipped it
 *      was the branch that always ran.
 *
 * These tests plant the failure rather than trusting the exit code, because the
 * whole point is that the exit code was wrong.
 */

/**
 * A throwaway repository root with the real checker copied into it.
 *
 * `check-rules` derives its root from its own location (`…/SKILLS/check-rules/`
 * two levels up), so copying the script into a temp tree is what lets the test
 * point it at a fixture. The alternative — planting a file in the real
 * `template/next/src` — mutates the working tree while `tests/scaffold.test.mjs`
 * is copying that same directory in another process, which fails at random.
 */
function fakeRepoRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-rules-"));
  const dir = path.join(root, "SKILLS", "check-rules");
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(CHECK_RULES, path.join(dir, "check-rules.mjs"));

  // `lib/constants.mjs` travels with the checker. The skill reads DEFAULT_THEME from
  // there rather than hardcoding a theme path — so a theme rename cannot leave the
  // rule pointing at a file that no longer exists, which is the precise failure RULE
  // 7 exists to catch. A fixture that copied the script without its dependency would
  // have hidden that, so the fixture mirrors the real layout.
  fs.mkdirSync(path.join(root, "lib"), { recursive: true });
  fs.copyFileSync(
    path.join(REPO_ROOT, "lib", "constants.mjs"),
    path.join(root, "lib", "constants.mjs"),
  );

  fs.mkdirSync(path.join(root, "template", "next", "src", "app"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), '{"name":"fixture"}\n', "utf8");
  return root;
}

function runChecker(root, args = []) {
  try {
    const out = execFileSync(process.execPath, [path.join(root, "SKILLS", "check-rules", "check-rules.mjs"), ...args], {
      cwd: root,
      encoding: "utf8",
    });
    return { code: 0, out };
  } catch (error) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
}

test("check-rules passes on the repository as it stands", () => {
  const result = (() => {
    try {
      return {
        code: 0,
        out: execFileSync(process.execPath, [CHECK_RULES], { cwd: REPO_ROOT, encoding: "utf8" }),
      };
    } catch (error) {
      return { code: error.status ?? 1, out: `${error.stdout ?? ""}${error.stderr ?? ""}` };
    }
  })();
  assert.equal(result.code, 0, `check-rules failed on a clean tree:\n${result.out}`);
});

test("RULE 1 walks template/next/src — the code a consumer actually receives", () => {
  const root = fakeRepoRoot();
  try {
    fs.writeFileSync(
      path.join(root, "template", "next", "src", "app", "globals.css"),
      ":root {\n  /* Superfícies e tipografia — nunca edite um token aqui */\n}\n",
      "utf8",
    );

    const result = runChecker(root);
    assert.equal(
      result.code,
      1,
      "a Portuguese comment in template/next/src did not turn check-rules red. " +
        "The template source is the code every consumer receives; if it is not " +
        "walked, the language law does not apply to the product.",
    );
    assert.match(result.out, /globals\.css/, result.out);
    assert.match(result.out, /language\.md §1/, result.out);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("RULE 1 catches the capitalised section headers that are really there", () => {
  const root = fakeRepoRoot();
  try {
    // The originals were `/* ── Superfícies ── */` and `/* ── Tipografia ── */`.
    // A case-sensitive list missed every one of them, which is how a rule with
    // fifteen patterns still passed over a Portuguese token file.
    fs.writeFileSync(
      path.join(root, "template", "next", "src", "app", "globals.css"),
      "/* ── Tipografia ── */\n/* ── Espaçamento ── */\n",
      "utf8",
    );

    const result = runChecker(root);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /Tipografia/, result.out);
    assert.match(result.out, /Espaçamento/, result.out);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("RULE 1 walks lib/, where this repository's own tools live", () => {
  const root = fakeRepoRoot();
  try {
    fs.mkdirSync(path.join(root, "lib"), { recursive: true });
    fs.writeFileSync(path.join(root, "lib", "x.mjs"), 'export const r = "não commitado";\n', "utf8");

    const result = runChecker(root);
    assert.equal(result.code, 1, result.out);
    assert.match(result.out, /lib\/x\.mjs/, result.out);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("RULE 1 does not fire on English that merely looks similar", () => {
  const root = fakeRepoRoot();
  try {
    fs.mkdirSync(path.join(root, "lib"), { recursive: true });
    // Every one of these shares a prefix or a shape with a Portuguese pattern.
    // If the list is too greedy the rule cries wolf, and a rule that cries wolf
    // gets deleted — which loses the guarantee entirely.
    fs.writeFileSync(
      path.join(root, "lib", "x.mjs"),
      [
        'export const commands = ["run"];',
        "export const version = 3;",
        "export const title = \"Home\";",
        "export const resource = \"users\";",
        "export const conclude = () => {};",
        "export const edit = () => {};",
        'export const configuration = "prod";',
        'export const ignored = ["node_modules"];',
        'export const validation = "zod";',
        'export const documentation = "./README.md";',
        'export const implementation = "clean-code.md";',
        'export const repository = "owner/name";',
        "",
      ].join("\n"),
      "utf8",
    );

    const result = runChecker(root);
    assert.equal(result.code, 0, `the rule fired on English words:\n${result.out}`);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("the Portuguese exemption names a file that exists, and only that one", () => {
  // An exemption pointing at nothing is not an exemption; it is a comment. And an
  // exemption that quietly grows is how a rule stops meaning anything.
  const checker = fs.readFileSync(CHECK_RULES, "utf8");
  const match = /const DELIBERATELY_NOT_ENGLISH = \[([^\]]*)\]/.exec(checker);
  assert.ok(match, "DELIBERATELY_NOT_ENGLISH is no longer a literal list; keep it greppable");

  const entries = match[1]
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  assert.ok(entries.length > 0, "the exemption list is empty; the marketing page needs one");

  for (const entry of entries) {
    const full = path.join(REPO_ROOT, "template", "next", entry);
    assert.ok(
      fs.existsSync(full),
      `DELIBERATELY_NOT_ENGLISH names "${entry}", which does not exist. ` +
        `A stale exemption is a hole with a comment on it.`,
    );
  }
});

test("the only non-English file in the template is the one that is exempt", () => {
  // Belt and braces on the exemption: if a second file drifts, this names it.
  const srcRoot = path.join(REPO_ROOT, "template", "next", "src");
  const pt = /\b(?:n[ãa]o|voc[êe]|c[óo]digo|superf[íi]cie|par[áa]metro|reposit[óo]rio)\b/i;

  const offenders = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|css)$/.test(entry.name)) {
        if (path.relative(REPO_ROOT, full).endsWith("src/app/(marketing)/page.tsx")) continue;
        const hit = pt.exec(fs.readFileSync(full, "utf8"));
        if (hit) offenders.push(`${path.relative(REPO_ROOT, full)}: "${hit[0]}"`);
      }
    }
  })(srcRoot);

  assert.deepEqual(offenders, [], `non-English text in the template:\n${offenders.join("\n")}`);
});