export default function AppPage() {
  return (
    <main className="container-grid py-16">
      <h1 className="text-headline-lg">Área logada</h1>
      <p className="mt-3 text-body-md text-text-secondary">
        Crie aqui a primeira feature. Copie a estrutura de{" "}
        <code className="text-code-inline text-primary">src/features/example</code>.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <span className="chip chip-active">Next.js 16</span>
        <span className="chip">React 19</span>
        <span className="chip">TypeScript</span>
        <span className="chip">Tailwind v4</span>
      </div>
    </main>
  );
}
