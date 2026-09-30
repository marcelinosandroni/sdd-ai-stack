# Phase 6 — A template that does not age badly (DONE)

> The runtime pin lives in three files that must agree. Nothing made them agree,
> and one of them was inverted from its own comment.

## The problem

`template/next` pins `next: ^16.3.7`. During phase 5, CI broke **on its own** when
`16.3.8` was unpublished from the registry mid-run:

```
npm error code E404
'next@https://registry.npmjs.org/next/-/next-16.3.8.tgz' is not in this registry
```

A template whose build depends on the registry's good behaviour ages badly. But the
real finding was worse than the incident that exposed it.

## The inverted guard

`.github/dependabot.yml` said:

```yaml
ignore:
  # @types/node describes the runtime API. The CI pins node-version 22, so a
  # 26.x type package would describe functions the runtime does not have —
  # a worse failure than an old type.
  - dependency-name: "@types/node"
    update-types: ["minor", "patch"]
```

The comment explains why a **major** bump is dangerous. The rule ignores
**minor and patch** and lets every major through.

```
comment: a major bump is the dangerous one
rule:    ignores minor+patch, blocks nothing that matters
```

It is the exact shape of the release bugs from phase 5: a guard that promises one
thing and does another, described by a comment that says what it should have done.
Dependabot opened PR #17 bumping `@types/node` 22.20.4 → 26.6.3, and it had to be
closed by hand.

**Fourth time.** After `needs: verify`, the auth line, and `secrets.NPM_TOKEN` —
each a guard defeated by my own comment explaining it.

## The undocumented pin

The README never said what Node the repository is verified on. So:

- a consumer could not know what they were expected to run
- the `@types/node` pin was a private detail with nothing to keep it honest
- the `engines` field said `>=20.9.0` (Next.js's floor) while the CI built on 22 —
  and 20.9 has never been tested by anything in this repository

Now the README states it, and states that `engines` is Next.js's floor rather than
what is verified.

## What is asserted now

| Assertion | Protects against |
| --- | --- |
| `@types/node` major == CI `node-version` | types describing a runtime that is not there |
| Dependabot ignores majors, not minors | the inverted rule, returning |
| README states the verified Node | an undocumented pin drifting silently |
| Dependabot watches `template/next` and `/` | dependencies never being updated |
| every dependency group matches a real dependency | dead config that reads like a policy |

Each was verified by deleting its target. The third is the one that matters most:

```
CI: node-version: 22 -> 24, @types/node untouched

✖ the template's type package matches the runtime its CI uses
✖ the README states the Node version the repository is verified on
```

Two guards, one mistake. That is what a pin with three homes needs.

## Evidence

```
npm test            91 passed (was 86)
check:coverage      line 98.63 / branch 90.38 / func 95.65
check:rules         0 violations
check:docs          55 documents, 0 broken links
check:facts         1 claim verified (91 tests, 55 documents)

Each guard verified by deleting its target and requiring red.
```

## Not done, deliberately

No lockfile in the template. The consumer commits their own, and shipping ours
would fight them at `npm install` in a way that is harder to debug than the
unpublished-tarball failure this phase started from.

The `next@16.3.8` incident itself is **not** solved — a caret range will always be
able to resolve to a version that stops existing. What changed is that when it
happens, the pin that matters is documented and the type package cannot drift past
the runtime that runs it.
