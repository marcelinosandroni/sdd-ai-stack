import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(REPO_ROOT, "site", "src", "content.ts");

/**
 * The site said `v0.2.0` while npm was already at `0.6.0`.
 *
 * That is not a typo; it is the failure this repository exists to prevent, on the page
 * whose entire argument is "this tool verifies what it states". A visitor reading the
 * hero and then checking npm finds two different products.
 *
 * The version cannot simply be imported: Vercel builds the site with `site/` as its
 * root, so the repository's `package.json` is not in that build context. So it is
 * committed, synced by a script, and asserted here — which is the only arrangement
 * that cannot drift silently.
 */

function declaredVersion() {
  const source = fs.readFileSync(CONTENT, "utf8");
  const match = /^export const VERSION = "([^"]+)";$/m.exec(source);
  assert.ok(
    match,
    'site/src/content.ts has no `export const VERSION = "…";` line. The sync script and ' +
      "this guard both parse that exact shape, so it has to stay greppable.",
  );
  return match[1];
}

test("the site's version is the published version", () => {
  const published = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")).version;

  assert.equal(
    declaredVersion(),
    published,
    `site/src/content.ts says v${declaredVersion()} and package.json says ${published}. ` +
      `Run \`npm run version:sync\`. A page that lies about its own version is worse than ` +
      `a page with no version, because it looks checked.`,
  );
});

test("the sync script reports the tree as clean", () => {
  // `--check` must exit 0 on a synced tree. Asserted by running it, because a script
  // that is never executed is a script that does not work.
  //
  // `sync-site-facts.mjs` is what `version:sync` and `version:check` both point at, and
  // it also carries the stack count — so this asserts the script the package actually
  // ships, by running it. Renaming a script and leaving a test pointing at the old path
  // would pass on a machine where the old file still lingered, and fail everywhere else.
  const output = execFileSync(
    process.execPath,
    [path.join(REPO_ROOT, "scripts", "sync-site-facts.mjs"), "--check"],
    { encoding: "utf8" },
  );

  assert.match(output, /VERSION\s+0\./, output);
});

test("the sync script is the one package.json advertises", () => {
  // The script was renamed from `sync-version.mjs` to `sync-site-facts.mjs` because it
  // now carries two facts. The two published commands were kept as aliases so nothing
  // that read the 0.7.x changelog breaks — which means the alias and the file have to
  // be asserted to agree, or `npm run site:sync` fails on a name nobody tested.
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"));
  const referenced = new Set(
    [...Object.values(pkg.scripts), ...pkg.scripts["prepublishOnly"].split("&&")].flatMap(
      (command) => [...String(command).matchAll(/scripts\/[\w.-]+\.mjs/g)].map((m) => m[0]),
    ),
  );

  for (const script of referenced) {
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, script)),
      `package.json references ${script}, which does not exist`,
    );
  }
});

test("no version is hardcoded in a component", () => {
  // The reason the guard above is not enough on its own: `content.ts` can stay in
  // sync while a component grows a second, private copy that drifts on its own. That
  // is exactly how the hero ended up with its own literal.
  const components = path.join(REPO_ROOT, "site", "src", "components");
  const offenders = [];

  for (const file of fs.readdirSync(components)) {
    if (!file.endsWith(".tsx")) continue;
    const source = fs.readFileSync(path.join(components, file), "utf8");
    // A version-shaped literal that is not a `v{VERSION}` template expression.
    const hit = /\bv?\d+\.\d+\.\d+\b/.exec(source);
    if (hit && !/v\{VERSION\}/.test(source)) {
      offenders.push(`${file}: "${hit[0]}"`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `a component hardcodes a version, so content.ts can be right while the page is wrong:\n${offenders.join("\n")}`,
  );
});