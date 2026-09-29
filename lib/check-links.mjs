import fs from "node:fs";
import path from "node:path";

/** Remove blocos de código cercados por ``` para não checar links ilustrativos. */
function stripCodeFences(md) {
  return md.replace(/```[\s\S]*?```/g, "").replace(/~~~[\s\S]*?~~~/g, "");
}

/** Coleta todos os .md a partir das raízes informadas (caminhos em formato posix). */
export function collectMarkdown(roots) {
  const files = [];
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (/node_modules|\.next|test-results|playwright-report/.test(p)) return;
      for (const entry of fs.readdirSync(p)) walk(path.join(p, entry));
    } else if (/\.md$/.test(p)) {
      files.push(p.split(path.sep).join("/"));
    }
  };
  roots.forEach(walk);
  return files;
}

/**
 * Valida todos os links relativos entre documentos markdown.
 * @returns {Array<{file, link}>} lista de links quebrados
 */
export function checkLinks(roots, { cwd = process.cwd() } = {}) {
  const broken = [];
  const re = /\]\((\.{0,2}\/[^)#\s]+)(?:#[^)]*)?\)/g;

  for (const file of collectMarkdown(roots)) {
    const abs = path.resolve(cwd, file);
    const txt = stripCodeFences(fs.readFileSync(abs, "utf8"));
    for (const m of txt.matchAll(re)) {
      const target = path.resolve(path.dirname(abs), m[1]);
      if (!fs.existsSync(target)) broken.push({ file, link: m[1] });
    }
  }  return broken;
}
