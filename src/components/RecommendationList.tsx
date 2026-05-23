import Link from "next/link";
import { TOOL_LABELS } from "@/data/pricing";
import { formatCurrency } from "@/lib/utils";
import type { AuditRecommendation, AuditResult } from "@/types/audit";

type RecommendationListProps = {
  result: AuditResult;
};

function getAccentColor(rec: AuditRecommendation): string {
  const action = rec.recommendedAction.toLowerCase();
  if (
    action.includes("bloat") ||
    action.includes("redundant") ||
    action.includes("verify") ||
    action.includes("credex")
  ) {
    return "#d97706";
  }
  if (rec.estimatedMonthlySavings > 0) {
    return "#16a34a";
  }
  return "#9ca3af";
}

function getToolEntry(result: AuditResult, rec: AuditRecommendation) {
  return result.formData.tools.find((t) => t.id === rec.toolEntryId);
}

function formatCurrentSituation(
  rec: AuditRecommendation,
  seats: number,
): string {
  const tool = TOOL_LABELS[rec.toolName];
  const seatPart =
    seats > 0 ? ` (${seats} seat${seats === 1 ? "" : "s"})` : "";
  return `${tool} ${rec.currentPlan}${seatPart}`;
}

function RecommendationCard({
  rec,
  result,
}: {
  rec: AuditRecommendation;
  result: AuditResult;
}) {
  const entry = getToolEntry(result, rec);
  const seats = entry?.seats ?? 0;
  const accentColor = getAccentColor(rec);
  const currentSituation = formatCurrentSituation(rec, seats);

  return (
    <article className="group flex w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 shadow-sm transition-colors hover:border-zinc-700/80 hover:bg-zinc-800/50">
      <div
        className="w-1 shrink-0 self-stretch"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />

      <div className="min-w-0 flex-1 p-5 sm:p-6">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-white sm:text-lg">
              {TOOL_LABELS[rec.toolName]}
            </h3>
            <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
              {rec.currentPlan}
            </span>
          </div>

          {rec.estimatedMonthlySavings > 0 ? (
            <span className="w-full shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-center text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30 sm:w-auto sm:text-left">
              Save {formatCurrency(rec.estimatedMonthlySavings)}/mo
            </span>
          ) : (
            <span className="w-full shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-center text-sm font-medium text-zinc-400 ring-1 ring-zinc-700 sm:w-auto sm:text-left">
              Already optimal ✓
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="font-medium leading-snug text-zinc-200">
            <span className="block text-zinc-400 sm:inline">
              {currentSituation}
            </span>
            <span className="mx-0 my-1 block text-zinc-600 sm:mx-2 sm:my-0 sm:inline">
              →
            </span>
            <span className="block sm:inline">{rec.recommendedAction}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {rec.reason}
          </p>
        </div>
      </div>
    </article>
  );
}

export function RecommendationList({ result }: RecommendationListProps) {
  const sorted = [...result.recommendations].sort(
    (a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings,
  );

  const currentTotal = result.recommendations.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0,
  );
  const savings = result.totalMonthlySavings;
  const optimizedTotal = currentTotal - savings;

  return (
    <section
      id="recommendations"
      className="mx-auto w-full max-w-4xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
    >
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Your Optimization Breakdown
        </h2>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">
          Here&apos;s exactly what we found and what to do about it
        </p>
      </header>

      {sorted.length === 0 ? (
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-base text-zinc-300">
            We couldn&apos;t generate recommendations — please try starting a
            new audit.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Start a new audit
          </Link>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4">
          {sorted.map((rec) => (
            <RecommendationCard
              key={rec.toolEntryId}
              rec={rec}
              result={result}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 && (
      <div className="mt-10 grid w-full grid-cols-1 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:grid-cols-3 sm:gap-6 sm:p-8">
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Current monthly spend
          </p>
          <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            {formatCurrency(currentTotal)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Optimized monthly spend
          </p>
          <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            {formatCurrency(optimizedTotal)}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Monthly savings
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-400 sm:text-2xl">
            {formatCurrency(savings)}
          </p>
        </div>
      </div>
      )}
    </section>
  );
}
