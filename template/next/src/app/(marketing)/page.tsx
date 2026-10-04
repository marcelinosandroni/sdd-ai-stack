export default function HomePage() {
  return (
    <main className="container-grid py-16 lg:py-24">
      <p className="label-mono">[NOME DO PRODUTO]</p>

      <h1 className="mt-4 text-display-hero-mobile font-extrabold tracking-tight text-balance lg:text-display-hero">
        [HERO HEADLINE AQUI]
      </h1>

      <p className="mt-6 max-w-2xl text-body-lg text-text-secondary">
        [Subtítulo de uma linha explicando o que o produto faz.]
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href="#principal" className="btn-primary">
          Ação principal
        </a>
        <a href="#detalhe" className="btn-secondary">
          Ver detalhes
        </a>
      </div>

      <section
        id="principal"
        className="mt-24 grid grid-cols-4 gap-4 md:grid-cols-8 lg:mt-36 lg:grid-cols-12"
      >
        <KpiCard label="Usuários ativos" value="12,4 mil" sub="últimos 30 dias" />
        <KpiCard label="Throughput" value="100M/dia" sub="requisições processadas" />
        <KpiCard label="Latência p99" value="42ms" sub="região São Paulo" />
        <KpiCard label="Disponibilidade" value="99,98%" sub="últimos 90 dias" />
      </section>

      <section id="detalhe" className="mt-20">
        <p className="label-mono">Stack</p>
        <h2 className="mt-3 text-headline-md">Tecnologia em produção</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span key={tech} className="chip">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind v4",
  "PostgreSQL",
  "Prisma",
  "Zod",
  "Vitest",
  "Playwright",
];

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card-metric col-span-4 md:col-span-4 lg:col-span-3">
      <p className="label-mono flex items-center gap-2">
        <span className="status-dot" />
        {label}
      </p>
      <p className="mt-3 text-metric-stat-mobile font-bold tracking-tight text-primary lg:text-metric-stat">
        {value}
      </p>
      <p className="mt-2 text-body-sm text-text-secondary">{sub}</p>
    </div>
  );
}
