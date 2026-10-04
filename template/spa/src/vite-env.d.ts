/// <reference types="vite/client" />

/**
 * This file exists for one reason, and it is load-bearing.
 *
 * `main.tsx` does `import "@/app/globals.css"` — a side-effect import with no
 * bindings. TypeScript reports that as an error unless something declares the module
 * exists, so without this line `npm run typecheck` fails on a file that works
 * perfectly in the browser.
 *
 * The tempting fix is `declare module "*.css"` here. That would silence it and also
 * silence every genuinely missing stylesheet for the rest of the project's life. The
 * triple-slash reference asks Vite what it actually resolves, which keeps the check
 * honest.
 */
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
