import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { scaffold } from "../lib/scaffold.mjs";

const silent = () => {};
const BIN = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "bin",
  "create-sdd-ai-stack.mjs",
);
const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sdd-bin-test-"));
}

/** Same shell caveat as the library: quote every argument on Windows. */
function git(cwd, ...args) {
  const useShell = process.platform === "win32";
  const quoted = useShell
    ? args.map((arg) => `"${String(arg).replaceAll('"', '\\"')}"`)
    : args;
  return execFileSync("git", quoted, { cwd, encoding: "utf8", shell: useShell }).trim();
}

function hasGit() {
  try {
    git(REPO_ROOT, "--version");
    return true;
  } catch {
    return false;
  }
}

/**
 * `git submodule add` refuses a local path unless the file transport is
 * allowed. A real https remote is unaffected — this only exists so the test can
 * use a temp dir as the remote and stay off the network.
 */
function withFileProtocol(fn) {
  const previous = process.env.GIT_ALLOW_PROTOCOL;
  process.env.GIT_ALLOW_PROTOCOL = "file";
  try {
    return fn();
  } finally {
    if (previous === undefined) delete process.env.GIT_ALLOW_PROTOCOL;
    else process.env.GIT_ALLOW_PROTOCOL = previous;
  }
}

/** A real git repository the submodule can clone, created from scratch. */
function makeRemote(parent) {
  const remote = path.join(parent, "remote");
  fs.mkdirSync(path.join(remote, "stacks"), { recursive: true });
  fs.writeFileSync(path.join(remote, "AGENTS.md"), "# rules\n", "utf8");
  fs.writeFileSync(path.join(remote, "stacks", "next.md"), "# next\n", "utf8");
  git(remote, "init");
  git(remote, "add", "-A");
  git(
    remote,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.invalid",
    "commit",
    "-m",
    "rules",
  );
  return remote;
}

function runBin(args, cwd) {
  return execFileSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

/* ── the real binary ──────────────────────────────────────── */

test("bin: --help exits 0 and documents every flag", () => {
  const out = runBin(["--help"], REPO_ROOT);
  for (const flag of [
    "--rules-only",
    "--submodule",
    "--shortcuts",
    "--no-install",
    "--git",
    "--template",
  ]) {
    assert.ok(out.includes(flag), `help does not mention ${flag}`);
  }
});

test("bin: --version prints the package version and nothing else", () => {
  const out = runBin(["--version"], REPO_ROOT);
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  assert.equal(out.trim(), pkg.version);
});

test("bin: scaffolds a real project and exits 0", () => {
  const root = tmp();
  runBin([path.join(root, "app"), "--no-install", "--shortcuts", "stub", "--yes"], root);

  const app = path.join(root, "app");
  assert.ok(fs.existsSync(path.join(app, "package.json")));
  assert.ok(fs.existsSync(path.join(app, "src", "app", "layout.tsx")));
  assert.ok(fs.existsSync(path.join(app, "SDD", "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(app, ".gitignore")));
});

test("bin: an invalid template fails with a non-zero exit", () => {
  const root = tmp();
  assert.throws(
    () => runBin([path.join(root, "app"), "--template", "angular"], root),
    (error) => {
      assert.ok(error.status > 0, "expected a non-zero exit code");
      assert.match(String(error.stderr), /Invalid template/);
      return true;
    },
  );
});

test("bin: --rules-only leaves no src/", () => {
  const root = tmp();
  runBin([path.join(root, "rules"), "--rules-only", "--shortcuts", "stub", "--yes"], root);
  assert.ok(!fs.existsSync(path.join(root, "rules", "src")));
  assert.ok(fs.existsSync(path.join(root, "rules", "SDD", "AGENTS.md")));
});

/* ── the git paths, with a real git ────────────────────────── */

test("scaffold --git: creates a repository with a clean tree and one commit", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  const s = scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

  assert.equal(s.git, true);
  const log = git(target, "log", "--oneline");
  assert.equal(log.split("\n").length, 1, "expected exactly one commit");
  assert.match(log, /initial scaffold/);
  assert.equal(git(target, "status", "--porcelain"), "", "working tree must be clean");
});

test("scaffold --git: the initial commit keeps the author identity", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

  // Windows runs the commit through cmd.exe, which splits `user.name=First Last`
  // unless the arguments are quoted. An unquoted argument fails the commit.
  const author = git(target, "log", "-1", "--format=%an <%ae>");
  assert.equal(author, "Marcelino Sandroni <marcelino.sandroni@gmail.com>");
});

test("scaffold --git: a spaced argument survives the Windows shell", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

  const files = git(target, "ls-files");
  assert.ok(files.includes("src/app/layout.tsx"), "the template must be committed");
  assert.ok(!files.includes("node_modules"), "node_modules must never be committed");
});

test("scaffold --submodule: initialises a repo so `git submodule add` can run", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  const remote = makeRemote(parent);

  withFileProtocol(() => {
    scaffold({ target, template: "next", submodule: remote, log: silent, shortcutMode: "stub" });
  });

  const modules = path.join(target, ".gitmodules");
  assert.ok(fs.existsSync(modules), ".gitmodules was not created");
  assert.match(fs.readFileSync(modules, "utf8"), /submodule "SDD"/);
  assert.ok(
    fs.existsSync(path.join(target, "SDD", "AGENTS.md")),
    "the submodule content was not checked out",
  );
});

test("scaffold --submodule: SDD/ is a real submodule, not a plain copy", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");
  const remote = makeRemote(parent);

  withFileProtocol(() => {
    scaffold({ target, template: "next", submodule: remote, log: silent, shortcutMode: "stub" });
  });

  const listed = git(target, "submodule", "status");
  assert.match(listed, /SDD/, "git does not see SDD/ as a submodule");
});
