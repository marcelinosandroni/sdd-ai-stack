# 🚀 sdd.marcelinosandroni.com

The public site for [SDD AI Stack](../README.md) — Spec-Driven Development for
AI agents. Deployed to Vercel at **sdd.marcelinosandroni.com**.

## What this is

A single static page that explains what SDD is, why it works, how to install the
CLI, and who built it. The source is the content: eight sections, each a
component in `src/components/`.

The design tokens are **the same as the portfolio** (marcelinosandroni.com) and
the same as the project's own `DESIGN.md` — one palette across the resume, the
site and every app the template generates. If you change a token here, change it
in `DESIGN.md` too, or the three drift apart.

## Commands

```bash
npm install
npm run dev            # http://localhost:4321
npm run typecheck      # tsc --noEmit
npm run lint           # biome check
npm run test           # unit
npm run build          # static export into out/
npm run test:e2e       # against the production build
```

## Deploy

Push to `main`. Vercel picks it up automatically.

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Build command | `npm run build` |
| Output directory | `out` |
| Install command | `npm install` |
| Node | 22 or newer |

`next.config.ts` uses `output: "export"`, so the whole site is static HTML with
no server runtime. Point the `sdd.marcelinosandroni.com` CNAME at the Vercel
project and the certificate is issued automatically.

## Rules

This site follows the same rules it documents: English everywhere, no literal hex
in a component, vertical slices, and a test for every change. The one thing it
does not have is a `SDD/` folder — the rules it documents are its source.
