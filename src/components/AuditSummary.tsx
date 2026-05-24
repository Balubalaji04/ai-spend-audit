import type { AuditResult } from "@/types/audit";

type AuditSummaryProps = {
  result: AuditResult;
};

export function AuditSummary({ result }: AuditSummaryProps) {
  return (
    <section
      className="mx-auto w-full max-w-4xl px-4 sm:px-6"
      aria-label={result.id ? `Audit summary ${result.id}` : "Audit summary"}
    >
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          AI-Generated Summary
        </p>

        <div className="mt-4 space-y-3" aria-hidden>
          <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-[92%] animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-[75%] animate-pulse rounded bg-zinc-800" />
        </div>

        <p className="mt-5 text-sm text-zinc-500">
          Summary will load here on Day 5 when Anthropic API is connected
        </p>
      </div>
    </section>
  );
}
