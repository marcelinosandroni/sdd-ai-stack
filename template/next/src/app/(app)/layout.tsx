import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Área logada da aplicação.",
};

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      {/* Nav rail: glassmorphism. See SDD/DESIGN.md §3 */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-raised/80 backdrop-blur-xl">
        <div className="container-grid flex h-14 items-center justify-between">
          <span className="text-headline-sm font-semibold">[APP]</span>
          <nav className="flex items-center gap-1">
            <a href="/app" className="btn-ghost">
              App
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
