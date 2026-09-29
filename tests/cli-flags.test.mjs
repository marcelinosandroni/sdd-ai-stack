import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { parseArgs } from "../src/cli.mjs";

test("parseArgs: --yes is recorded, not discarded", () => {
  assert.equal(parseArgs(["app", "--yes"]).yes, true);
  assert.equal(parseArgs(["app", "-y"]).yes, true);
});

test("parseArgs: --no-yes defaults to false", () => {
  assert.equal(parseArgs(["app"]).yes, false);
});
