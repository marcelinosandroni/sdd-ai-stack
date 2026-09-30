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

/**
 * A GitHub runner has no `user.email` configured, and a fresh CI container has
 * none either. The scaffold must not invent an author in that case, so every
 * test that expects a real commit runs inside a repository with an explicit
 * identity. Testing the no-identity path is a separate test, below.
 */
function withIdentity(fn) {
  const previous = {
    name: process.env.GIT_AUTHOR_NAME,
    email: process.env.GIT_AUTHOR_EMAIL,
    committer: process.env.GIT_COMMITTER_NAME,
    committerEmail: process.env.GIT_COMMITTER_EMAIL,
  };
  process.env.GIT_AUTHOR_NAME = "Test Author";
  process.env.GIT_AUTHOR_EMAIL = "test@example.invalid";
  process.env.GIT_COMMITTER_NAME = "Test Author";
  process.env.GIT_COMMITTER_EMAIL = "test@example.invalid";
  try {
    return fn();
  } finally {
    const restore = (key, value) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    };
    restore("GIT_AUTHOR_NAME", previous.name);
    restore("GIT_AUTHOR_EMAIL", previous.email);
    restore("GIT_COMMITTER_NAME", previous.committer);
    restore("GIT_COMMITTER_EMAIL", previous.committerEmail);
  }
}

test("scaffold --git: creates a repository with a clean tree and one commit", { skip: !hasGit() }, () =>
  withIdentity(() => {
    const parent = tmp();
    const target = path.join(parent, "app");
    const s = scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

    assert.equal(s.git, true);
    const log = git(target, "log", "--oneline");
    assert.equal(log.split("\n").length, 1, "expected exactly one commit");
    assert.match(log, /initial scaffold/);
    assert.equal(git(target, "status", "--porcelain"), "", "working tree must be clean");
  }),
);

test("scaffold --git: the initial commit is authored by the developer, not the template", { skip: !hasGit() }, () =>
  withIdentity(() => {
    const parent = tmp();
    const target = path.join(parent, "app");
    scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

    const author = git(target, "log", "-1", "--format=%an <%ae>");
    assert.equal(author, "Test Author <test@example.invalid>");
    // The regression: the scaffold used to hardcode its own name here, putting
    // a stranger's identity on the user's first commit.
    assert.doesNotMatch(author, /marcelino/i);
  }),
);

test("scaffold --git: with no identity it warns and leaves the staging intact", { skip: !hasGit() }, () => {
  const parent = tmp();
  const target = path.join(parent, "app");

  // A config with no user.name/user.email at all, and no system/global one.
  const emptyConfig = path.join(parent, "empty-gitconfig");
  fs.writeFileSync(emptyConfig, "", "utf8");
  const previous = { global: process.env.GIT_CONFIG_GLOBAL, system: process.env.GIT_CONFIG_SYSTEM };
  process.env.GIT_CONFIG_GLOBAL = emptyConfig;
  process.env.GIT_CONFIG_SYSTEM = emptyConfig;
  for (const key of ["GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL", "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL"]) {
    delete process.env[key];
  }

  const messages = [];
  try {
    const s = scaffold({
      target,
      template: "next",
      git: true,
      log: (line) => messages.push(line),
      shortcutMode: "stub",
    });

    assert.equal(s.git, false, "the summary must not claim a commit that never happened");
    assert.ok(
      messages.some((line) => /identity/i.test(line)),
      `expected a message about the missing identity, got: ${messages.join(" | ")}`,
    );
    // The work is not lost: everything is staged and waiting for one command.
    assert.ok(fs.existsSync(path.join(target, "package.json")));
  } finally {
    const restore = (key, value) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    };
    restore("GIT_CONFIG_GLOBAL", previous.global);
    restore("GIT_CONFIG_SYSTEM", previous.system);
  }
});

test("scaffold --git: a spaced argument survives the Windows shell", { skip: !hasGit() }, () =>
  withIdentity(() => {
    const parent = tmp();
    const target = path.join(parent, "app");
    scaffold({ target, template: "next", git: true, log: silent, shortcutMode: "stub" });

    // Windows runs the commit through cmd.exe, which splits `user.name=First Last`
    // unless the arguments are quoted. The commit used to fail with
    // "Sandroni is not a git command".
    const files = git(target, "ls-files");
    assert.ok(files.includes("src/app/layout.tsx"), "the template must be committed");
    assert.ok(!files.includes("node_modules"), "node_modules must never be committed");
  }),
);

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
