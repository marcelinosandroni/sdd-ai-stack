export default function NotFound() {
  return (
    <main className="container-grid flex min-h-screen flex-col items-start justify-center py-24">
      <p className="label-mono">404</p>
      <h1 className="mt-4 text-headline-lg">Resource not found.</h1>
      <a href="/" className="btn-secondary mt-8">
        Back to home
      </a>
    </main>
  );
}
