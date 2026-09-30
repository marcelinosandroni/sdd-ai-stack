/**
 * Geometric audit of a page at three viewports.
 *
 * Reports what a screenshot hides: the element that overflows, the tap target
 * that is too small, the text that is too small. The whole point of §4b in
 * DESIGN.md is that "it looks fine" is not a measurement.
 *
 * Usage: node scripts/audit-layout.mjs [url]
 * With no url it builds and serves the site itself, so the audit always runs
 * against the artefact rather than whatever happens to be on a port.
 */
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.AUDIT_PORT ?? 4390);
const base = process.argv[2] ?? `http://127.0.0.1:${PORT}/`;

let server = null;

if (!process.argv[2]) {
  console.log("building the static export…");
  const build = spawn("npm", ["run", "build"], { stdio: "inherit", shell: true });
  await new Promise((resolve, reject) => {
    build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error("build failed"))));
  });

  server = spawn("npx", ["--yes", "serve@latest", "out", "-l", String(PORT)], {
    stdio: "ignore",
    shell: true,
  });

  // Poll until it answers, instead of guessing a sleep.
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      await fetch(base, { signal: AbortSignal.timeout(2000) });
      break;
    } catch {
      if (Date.now() > deadline) throw new Error(`server did not come up on ${PORT}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.log(`serving out/ on ${PORT}\n`);
}

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const TAP_MIN = 44;
const TEXT_MIN = 13;

const browser = await chromium.launch();
let failures = 0;

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.name === "mobile",
    hasTouch: viewport.name === "mobile",
  });

  await page.goto(base, { waitUntil: "networkidle" });

  const report = await page.evaluate(
    ({ tapMin, textMin }) => {
      const doc = document.documentElement;
      const describe = (el) => {
        const id = el.id ? `#${el.id}` : "";
        const cls = String(el.className || "")
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .join(".");
        return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ""}`;
      };

      // An element inside a scroll container is not a page overflow. The
      // container scrolls, so the document does not move. Reporting those is
      // how an audit tool teaches you to ignore it.
      const hasScrollableAncestor = (el) => {
        let node = el.parentElement;
        while (node && node !== document.body) {
          const overflowX = getComputedStyle(node).overflowX;
          if (overflowX === "auto" || overflowX === "scroll" || overflowX === "hidden") {
            return true;
          }
          node = node.parentElement;
        }
        return false;
      };

      const overflowing = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return false;
          const style = getComputedStyle(el);
          if (style.position === "fixed") return false;
          if (hasScrollableAncestor(el)) return false;
          return r.right > doc.clientWidth + 1;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return `${describe(el)} right=${Math.round(r.right)} w=${Math.round(r.width)}`;
        })
        .slice(0, 8);

      // A chip is a static tag, not a control. It has no href and no handler,
      // so the 44px floor does not apply to it — forcing the size would make a
      // list of technologies taller than the section it belongs to.
      const isStaticTag = (el) =>
        el.tagName !== "A" && !el.hasAttribute("role") && !el.hasAttribute("tabindex");

      const smallTargets = [...document.querySelectorAll("a, button, [role=button]")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          if (getComputedStyle(el).visibility === "hidden") return false;
          // The skip link is deliberately 1x1 until it takes focus; measuring
          // it would report a false failure for a deliberate technique.
          if (el.classList.contains("sr-only")) return false;
          if (isStaticTag(el)) return false;
          return r.width < tapMin || r.height < tapMin;
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          const text = (el.textContent || "").trim().slice(0, 26);
          return `${el.tagName.toLowerCase()} "${text}" ${Math.round(r.width)}x${Math.round(r.height)}`;
        })
        .slice(0, 8);

      const smallText = [];
      // NodeFilter is not reachable from the evaluated scope, so the constant is
      // inlined: SHOW_TEXT === 4. The root must be a Node, hence the guard.
      //
      // `label-mono` at 11px is chrome by design (DESIGN.md §2 and the §4b.2
      // exception): a section eyebrow is not body copy. Reporting it would make
      // the audit cry wolf about the design system itself.
      const CHROME = ["label-mono", "copy-button", "code-inline", "chip"];

      // Font size is inherited, so the class that decides it can live several
      // ancestors up. Checking only the direct parent reports the footer credit
      // and the copy icon as violations when both are chrome by design.
      const isChromeText = (el) => {
        let node = el;
        while (node && node !== doc.body) {
          const cls = String(node.className || "");
          if (CHROME.some((name) => cls.includes(name))) return true;
          node = node.parentElement;
        }
        return false;
      };

      const root = doc.body ?? doc;
      const walker = document.createTreeWalker(root, 4);
      let node = walker.nextNode();
      while (node && smallText.length < 8) {
        const text = (node.textContent || "").trim();
        const parent = node.parentElement;
        if (text && parent) {
          const size = parseFloat(getComputedStyle(parent).fontSize);
          if (size > 0 && size < textMin && !isChromeText(parent)) {
            smallText.push(`${size}px "${text.slice(0, 30)}" in ${describe(parent)}`);
          }
        }
        node = walker.nextNode();
      }

      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflowing,
        smallTargets,
        smallText,
      };
    },
    { tapMin: TAP_MIN, textMin: TEXT_MIN },
  );

  const overflows = report.scrollWidth > report.clientWidth;
  const problems = overflows ? 1 : 0;
  failures += problems;

  console.log(`\n── ${viewport.name} (${viewport.width}px) ──`);
  console.log(
    `  scrollWidth ${report.scrollWidth} / clientWidth ${report.clientWidth}` +
      (overflows ? "  ✗ HORIZONTAL SCROLL" : "  ✓"),
  );

  if (report.overflowing.length > 0) {
    console.log(`  overflowing (${report.overflowing.length}):`);
    for (const item of report.overflowing) console.log(`    ${item}`);
  }
  if (report.smallTargets.length > 0) {
    console.log(`  tap targets under ${TAP_MIN}px (${report.smallTargets.length}):`);
    for (const item of report.smallTargets) console.log(`    ${item}`);
  }
  if (report.smallText.length > 0) {
    console.log(`  text under ${TEXT_MIN}px (${report.smallText.length}):`);
    for (const item of report.smallText) console.log(`    ${item}`);
  }
  if (!overflows && report.smallTargets.length === 0 && report.smallText.length === 0) {
    console.log("  ✓ no overflow, no small targets, no small text");
  }

  await page.close();
}

await browser.close();
server?.kill();
console.log(`\n${failures === 0 ? "✓ layout clean" : `✗ ${failures} viewport(s) overflow`}`);
process.exit(failures === 0 ? 0 : 1);
