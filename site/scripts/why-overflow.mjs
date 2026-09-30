/**
 * Why is the document wider than the viewport?
 *
 * Walks every element and reports the ones whose right edge is past the
 * viewport, INCLUDING the ones inside a scroll container — because when the
 * document itself scrolls, the culprit is not inside a working scroller.
 */
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.AUDIT_PORT ?? 4391);
const base = `http://127.0.0.1:${PORT}/`;

let server = null;
if (!process.argv[2]) {
  const build = spawn("npm", ["run", "build"], { stdio: "ignore", shell: true });
  await new Promise((r) => build.on("exit", r));
  server = spawn("npx", ["--yes", "serve@latest", "out", "-l", String(PORT)], {
    stdio: "ignore",
    shell: true,
  });
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      await fetch(base, { signal: AbortSignal.timeout(2000) });
      break;
    } catch {
      if (Date.now() > deadline) throw new Error("no server");
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.goto(base, { waitUntil: "networkidle" });

const result = await page.evaluate(() => {
  const doc = document.documentElement;
  const limit = doc.clientWidth;

  const describe = (el) => {
    if (!el) return "?";
    if (el === doc) return "<html>";
    if (el === document.body) return "<body>";
    const cls = String(el.className || "")
      .trim()
      .split(/\s+/)
      .slice(0, 3)
      .join(".");
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? `.${cls}` : ""}`;
  };

  // The ancestor chain is the answer. An element being wide is a symptom; the
  // chain says who let it happen.
  const chainOf = (el) => {
    const chain = [];
    let node = el;
    while (node && node !== doc.parentElement) {
      chain.unshift(describe(node));
      node = node.parentElement;
    }
    return chain;
  };

  const all = [doc, document.body, ...document.querySelectorAll("body *")];

  // The SHALLOWEST offending element is the real cause; everything under it is
  // just inheriting its width.
  const offenders = all
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, right: Math.round(r.right + doc.scrollLeft), width: Math.round(r.width) };
    })
    .filter((x) => x.right > limit + 1)
    .sort((a, b) => a.right - b.right);

  const roots = offenders.filter((x) => {
    // No offending ancestor.
    let node = x.el.parentElement;
    while (node && node !== doc.parentElement) {
      const r = node.getBoundingClientRect();
      if (Math.round(r.right + doc.scrollLeft) > limit + 1) return false;
      node = node.parentElement;
    }
    return true;
  });

  return {
    limit,
    docScrollWidth: doc.scrollWidth,
    roots: roots.map((x) => ({
      el: describe(x.el),
      right: x.right,
      width: x.width,
      chain: chainOf(x.el),
    })),
  };
});

console.log(`viewport ${result.limit}  html.scrollWidth ${result.docScrollWidth}\n`);
console.log("shallowest offenders (the real cause):");
for (const w of result.roots) {
  console.log(`\n  ${w.el}  right=${w.right} width=${w.width}`);
  for (const node of w.chain) console.log(`      ${node}`);
}

await browser.close();
server?.kill();
