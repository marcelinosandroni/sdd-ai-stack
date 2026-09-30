# Phase 5 — First real publish (DONE)

> `create-sdd-ai-stack@0.3.1` live on npmjs and GitHub Packages, published with
> Trusted Publishing (OIDC) and no token.

## What this phase was

Phase 4 shipped the site. This phase shipped **the package**. Until this phase,
every fix in phases 3 and 4 existed only on GitHub — `npm view` still returned
`0.1.17`, and nobody who ran `npx create-sdd-ai-stack` had ever received the
rules the repository claims.

The release workflow had never run end to end. It had three guards in place and
eight bugs behind them.

## The eight bugs

Every one was written, merged, and green on `main`. Every one was found by
**executing the release path**, not by reading it.

| # | Bug | Why it survived |
| --- | --- | --- |
| 1 | coverage floor read as zero on Node 22 | never run in CI |
| 2 | release guard asserted `template/next/proxy.ts` | asserted, not executed |
| 3 | the test suite packed a tarball from inside `prepublishOnly` | never run inside a publish |
| 4 | both publish jobs on Node 22 | never run with the gate active |
| 5 | the GitHub Packages registry leaked into `prepublishOnly` | dry run stopped at #4 |
| 6 | the job invalidated its own gate by rescoping the name | dry run stopped at #5 |
| 7 | removing `registry-url` also removed the auth | `npm publish --dry-run` never authenticates |
| 8 | a half-succeeded release could not be resumed | first partial release |

Bugs 2 and 6 are the two that matter most, and they are the same mistake wearing
different clothes: **a guard that was never executed**.

- #2 asserted a path that could not exist, so it could never have passed.
- #6 asserted the npm name stays unscoped, in a job that had just scoped it.
  Both halves were correct. Together they were a deadlock no unit test could
  see, because it only exists once a real publish runs the rewrite and then the
  real suite, in that order.

## The lesson the dry run could not teach

Bug #7 is the one worth remembering. Removing `setup-node`'s `registry-url`
fixed bug #5 and created bug #7 in the same edit, because `registry-url` is also
what writes the auth line. The dry run stayed green throughout:

```
npm publish --dry-run   never touches the registry, never authenticates
```

A dry run is evidence about exactly as much as the dry run exercised. For a
publish, authentication is not exercised. I let a green dry run stand in for a
claim it could not support.

## Three guards that passed while their protection was gone

Writing the guards was not the hard part. Three of them passed while the thing
they protected had been deleted, and each was caught the same way: delete the
target, check that the test goes red.

| Guard | What defeated it |
| --- | --- |
| `needs: verify` | a workflow comment quoting the key |
| auth line present | a workflow comment quoting the `echo` |
| no `secrets.NPM_TOKEN` | a workflow comment naming the secret |

The recurrence is the finding. My comments explain the guard, and then match
it. All three are anchored now.

Two older tests had the opposite defect — they asserted a **mechanism** that had
become a no-op, and would have kept it alive:

- `tests/docs.test.mjs` asserted the `Authenticate` step existed, after the
  secret it branched on was deleted. It now asserts the outcome: the npm job
  injects no token.
- The same file asserted `scope:` was present on `setup-node`, locking in the
  registry leak.

Asserting a mechanism instead of an outcome is how a guard learns to protect the
thing it was written to catch.

## What changed

- Both publish jobs on Node 24, with a test asserting it.
- The GitHub Packages publish names its registry on the command and writes its
  own auth line, instead of rewriting the job's registry globally.
- Each publish skips its registry when the version is already there, so a
  partial release is resumable.
- The npm job injects no token; `id-token: write` is the whole mechanism.
- `npm test` went 64 → 79.

## Evidence

```
npm view create-sdd-ai-stack version     0.3.1
npm dist-tag latest                      0.3.1
fileCount                                103
unpackedSize                             400849 bytes

GitHub Packages
  + @marcelinosandroni/create-sdd-ai-stack@0.3.1
  total files: 103 · package size: 147.2 kB

npm test            79 passed
check:coverage      line 98.63 / branch 90.38 / func 95.65
check:rules         0 violations
check:docs          53 documents, 0 broken links
check:pack          103 files

Release run 36751530566
  Guard             success
  Verify            success
  Publish npm       success   (skipped: already on npmjs)
  Publish GitHub    success   (published)
```

## What this phase cost

Five PRs, five failed release runs, and eight bugs that were all green on
`main` for hours or days at a time.

Every one of them was found the same way — by running the thing rather than
reading it. Not one was found by a review, and not one was found by a test that
existed before the bug. The guards written afterwards are the only reason the
ninth will not need a release run to find it.