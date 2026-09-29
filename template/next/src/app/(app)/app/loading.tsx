import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <main className="container-grid py-16" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}
