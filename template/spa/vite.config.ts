import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * The second template, and the point of it.
 *
 * Nothing here is Next-shaped. No App Router, no server components, no `proxy.ts`,
 * no `shadcn`, no prerender pass. What is left is the part that was supposed to be
 * framework-independent all along: the SDD rules, the design tokens, and the gates.
 *
 * If this template needed a Next-specific workaround to build, then "the rules are
 * stack-agnostic" would be a claim about documentation rather than about code.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  preview: {
    // `127.0.0.1`, not the default `localhost`. On a machine where `localhost`
    // resolves to `::1` first, Vite binds IPv6 only, and Playwright's
    // `baseURL: http://127.0.0.1:3000` then waits for a server that is not there —
    // for the full `webServer` timeout, with the real cause printed nowhere useful.
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
