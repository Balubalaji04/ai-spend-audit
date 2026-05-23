export function AuditPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="h-6 w-28 animate-pulse rounded bg-zinc-800" />
          <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-2 py-12">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="mt-8 h-5 w-36 animate-pulse rounded bg-zinc-800" />
          <div className="mt-4 h-14 w-48 max-w-full animate-pulse rounded-lg bg-zinc-800 sm:h-20 sm:w-64" />
          <div className="mt-3 h-5 w-16 animate-pulse rounded bg-zinc-800" />
          <div className="mt-8 h-6 w-56 animate-pulse rounded bg-zinc-800" />
        </div>

        <div className="h-24 w-full animate-pulse rounded-xl bg-zinc-800/80" />

        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-zinc-800" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex w-full overflow-hidden rounded-xl border border-zinc-800/80"
            >
              <div className="w-1 shrink-0 animate-pulse bg-zinc-700" />
              <div className="flex-1 space-y-4 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
                  <div className="h-7 w-28 animate-pulse rounded-full bg-zinc-800" />
                </div>
                <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                <div className="h-4 w-[85%] animate-pulse rounded bg-zinc-800" />
                <div className="h-3 w-[60%] animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
