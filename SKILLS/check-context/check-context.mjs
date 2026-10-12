#!/usr/bin/env node
/**
 * Keeps the context budget `AGENTS.md` publishes honest.
 *
 *   node SDD/SKILLS/check-context/check-context.mjs [--report]
 *
 * `AGENTS.md` is the one file every agent reads on every task, and it opens by telling
 * them the price: "Tier 1 — every task (≈4.4k tokens)", "The full set below costs ~16.5k".
 * That number is the argument for the whole router-and-tier design. If it is wrong, the
 * project is asking agents to budget against a fiction.
 *
 * So this measures it. On the day it was written the claims were accurate — a Tier 1 of
 * 22,004 bytes really is about 4.4k tokens — but nothing checked, so the first rule file
 * to grow would have moved the number silently and every agent would have kept budgeting
 * against the old one. A published number with no verifier is a number that rots, and
 * this is the verifier.
 *
 * THE CONSTANT IS SOLVED FOR, NOT ASSUMED.
 *
 * There is no honest way to know how many characters make a token in a given markdown
 * file — it depends on the prose, the tables and the code fences. Guessing 4 and
 * declaring the file 30% too expensive is how this analysis once got it wrong: the
 * claims here imply 5.0 chars/token, which is a perfectly reasonable density for
 * tables-heavy prose, and every one of them turned out to be correct.
 *
 * So instead of asserting against an assumed constant, it solves for the constant the
 * document itself implies, using the Tier 1 claim as the anchor, and then checks that
 * every other claim agrees with that same constant. A drifting number shows up as a
 * constant that no longer fits, which is a diagnosable failure rather than a mystery.
 *
 * Prints one line. The cost of a script skill is its output, not its size.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The reading order, as `AGENTS.md` §1 defines it.
 *
 * This duplicates the table on purpose. The alternative — parsing the table — would mean
 * the verifier is downstream of the thing it verifies, so an edit that moved a file out
 * of Tier 1 and forgot the number would make both the doc and the check agree on a lie.
 * The claim is parsed; the membership is stated here. Two independent sources can
 * disagree, and that disagreement is the finding.
 */
const TIERS = {
  1: {
    label: "Tier 1 — every task",
    anchor: true,
    files: ["AGENTS.md", "specs/PLAN.md", "PREFLIGHT.md"],
  },
  2: {
    label: "Tier 2 — once per session",
    files: ["APP.md", "APP-STACK.md"],
  },
  3: {
    label: "Tier 3 — on demand",
    files: ["ARCHITECTURE.md", "stacks/README.md", "stacks/clean-code.md", "stacks/language.md", "DESIGN.md"],
  },
};

/**
 * How many characters make a token, in these files.
 *
 * Empirical, not universal. Markdown is denser than prose because tables and code fences
 * pack whole sentences into few characters, and these documents are table-heavy. The
 * number was derived by dividing the published Tier 1 claim by the measured size of the
 * three files it names, and it lands on almost exactly 5.0.
 *
 * It is FIXED rather than solved for at run time, and that is the correction. The first
 * version of this file solved for the constant from the Tier 1 claim it was checking,
 * which sounds more rigorous and is strictly worse: growing a Tier 1 file raised the
 * implied constant, the full-set check then agreed with the new constant, and the drift
 * this skill exists to catch passed. A verifier that can always explain the data is not a
 * verifier. Planting the failure is what caught it — a constant solved from the data is
 * unfalsifiable by construction.
 *
 * Overridable, because a repository that changes prose style has a legitimate reason to
 * move this and a legitimate way to say so.
 */
const CHARS_PER_TOKEN = Number(process.env.CONTEXT_CHARS_PER_TOKEN ?? 5.0);

/**
 * How far a measured cost may sit from the published one before it is a failure.
 *
 * 12%. Wide enough that adding a bullet to a document does not fail a build, tight enough
 * that a rule file growing by a quarter does.
 */
const TOLERANCE = 0.12;

// Two levels up is the repository root: the skill sits at `SKILLS/check-context/`, so
// `..` is `SKILLS/` and another `..` is the root. A third lands in the parent directory,
// which is how the first version of this file looked for AGENTS.md one level too high —
// and it failed loudly on its first run, which is the correct way for that to happen.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function bytesOf(relative) {
  try {
    return readFileSync(path.join(ROOT, relative)).length;
  } catch {
    return null;
  }
}

const agents = readFileSync(path.join(ROOT, "AGENTS.md"), "utf8");

/**
 * The published numbers, parsed out of the document.
 *
 * Matches the two forms §1 actually uses: `(≈4.4k tokens)` for a tier and
 * `costs ~16.5k tokens` for the whole set. Parsed rather than imported, because the claim
 * is what this verifies — reading it from a constant in this file would make the check
 * agree with itself by construction.
 */
const CLAIMS = {
  1: /Tier 1[^(\n]*\(≈\s*([\d.]+)k tokens\)/.exec(agents)?.[1],
  full: /costs\s*~([\d.]+)k tokens/.exec(agents)?.[1],
};

if (!CLAIMS[1] || !CLAIMS.full) {
  console.error("✖ AGENTS.md no longer states a context budget.");
  console.error(
    "  Expected `Tier 1 … (≈<n>k tokens)` and `costs ~<n>k tokens`. This check exists to " +
      "hold those numbers up, so removing them removes the reason to run it.",
  );
  process.exit(1);
}

const measured = {};
const missing = [];

for (const [tier, { files }] of Object.entries(TIERS)) {
  let total = 0;
  for (const file of files) {
    const bytes = bytesOf(file);
    if (bytes === null) {
      missing.push(file);
      continue;
    }
    total += bytes;
  }
  measured[tier] = total;
}

if (missing.length > 0) {
  console.error(`✖ ${missing.length} file(s) in the reading order do not exist: ${missing.join(", ")}`);
  console.error("  A missing file is not a smaller file. Fix the path in this skill or in AGENTS.md.");
  process.exit(1);
}

/**
 * Does a measured size match its published cost?
 *
 * `CLAIMS` holds the numbers as written in the document. Tier 1 is the anchor the
 * constant was derived from, so it is reported rather than asserted — asserting it would
 * be circular.
 */
function verdict(bytes, claimedK) {
  const measuredTokens = bytes / CHARS_PER_TOKEN;
  const claimedTokens = Number(claimedK) * 1000;
  const drift = Math.abs(measuredTokens - claimedTokens) / claimedTokens;
  return { ok: drift <= TOLERANCE, drift, measuredTokens, claimedTokens };
}

const tier1 = verdict(measured[1], CLAIMS[1]);

// The full set is Tier 1 + Tier 2 + Tier 3. AGENTS.md counts the guide's reading order,
// which is exactly those tiers; it does not count all of stacks/, because a tier is worth
// reading once and stacks/ is read one file at a time. That distinction is the design,
// so it is reproduced rather than approximated.
const fullBytes = measured[1] + measured[2] + measured[3];
const full = verdict(fullBytes, CLAIMS.full);

/**
 * The constant the document implies, reported so a failure is diagnosable.
 *
 * If this comes back far from `CHARS_PER_TOKEN`, the prose got denser or looser rather
 * than the budget being wrong, and the right response is to revisit the constant — not to
 * rewrite the numbers in §1 until they satisfy the current one.
 */
const implied = measured[1] / (Number(CLAIMS[1]) * 1000);

const showDetail = process.argv.includes("--report");
if (showDetail) {
  for (const [tier, { label, files }] of Object.entries(TIERS)) {
    const tokens = Math.round(measured[tier] / CHARS_PER_TOKEN);
    console.log(`  ${label.padEnd(26)} ${String(tokens).padStart(6)} tok  ${files.length} files`);
  }
  console.log(`  ${"constant in use".padEnd(26)} ${CHARS_PER_TOKEN.toFixed(2)} chars/token`);
  console.log(`  ${"implied by the doc".padEnd(26)} ${implied.toFixed(2)} chars/token`);
}

if (!full.ok || Math.abs(implied - CHARS_PER_TOKEN) / CHARS_PER_TOKEN > TOLERANCE) {
  const broken = !full.ok ? full : null;
  const detail = broken
    ? `published ${(broken.claimedTokens / 1000).toFixed(1)}k, measured ${(broken.measuredTokens / 1000).toFixed(1)}k ` +
      `(${Math.round(broken.drift * 100)}% off, tolerance ${Math.round(TOLERANCE * 100)}%)`
    : `the document implies ${implied.toFixed(2)} chars/token, this check assumes ${CHARS_PER_TOKEN.toFixed(2)}`;

  console.error(`✖ AGENTS.md publishes a context budget that no longer holds: ${detail}.`);
  console.error(
    "  Re-measure with --report. If the files grew, update the numbers in §1 — and treat " +
      "that as a finding about the router, not a chore. If the prose density moved instead, " +
      "change CHARS_PER_TOKEN in this file with the reason next to it.",
  );
  process.exit(1);
}

console.log(
  `✓ context budget holds: tier 1 ${(tier1.measuredTokens / 1000).toFixed(1)}k, ` +
    `full ${(full.measuredTokens / 1000).toFixed(1)}k (${CHARS_PER_TOKEN} chars/token)`,
);