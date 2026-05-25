import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TOOL_LABELS } from "@/data/pricing";
import { formatCurrency } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type SharedAuditPageProps = {
  params: Promise<{ id: string }>;
};

type SharedRecommendation = {
  toolName: keyof typeof TOOL_LABELS;
  currentPlan: string;
  recommendedAction: string;
  estimatedMonthlySavings: number;
  reason: string;
};

function formatMetadataAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });
}

function getRecommendations(value: unknown): SharedRecommendation[] {
  if (!Array.isArray(value)) return [];
  return value as SharedRecommendation[];
}

export async function generateMetadata({
  params,
}: SharedAuditPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("audits")
    .select("total_monthly_savings, total_annual_savings")
    .eq("id", id)
    .single();

  if (!data) {
    return { title: "Audit Not Found — SpendScope" };
  }

  const monthly = Number(data.total_monthly_savings ?? 0);
  const annual = Number(data.total_annual_savings ?? 0);

  const title =
    monthly > 0
      ? `I could save $${formatMetadataAmount(monthly)}/month on AI tools`
      : "My AI spend is already optimized";

  const description =
    monthly > 0
      ? `My AI spend audit found $${formatMetadataAmount(annual)}/year in potential savings. Run your free audit at SpendScope — no login required.`
      : "I ran a free AI spend audit and my stack is already optimized. Check if you're overspending at SpendScope.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedAuditPage({ params }: SharedAuditPageProps) {
  const { id } = await params;
  const { data: audit, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !audit) {
    notFound();
  }

  const monthlySavings = Number(audit.total_monthly_savings ?? 0);
  const annualSavings = Number(audit.total_annual_savings ?? 0);
  const recommendations = getRecommendations(audit.recommendations);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="shrink-0 text-base font-semibold text-white transition-colors hover:text-emerald-400 sm:text-lg"
          >
            SpendScope
          </Link>
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-500/20 sm:px-4 sm:py-2 sm:text-sm"
          >
            Run your own free audit →
          </Link>
        </div>
      </header>

      <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-2 text-center text-xs text-zinc-400 sm:text-sm">
        This is a shared audit result. Personal details have been removed.
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 shadow-xl shadow-black/20 sm:p-10">
          {monthlySavings > 0 ? (
            <>
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
                Shared AI Spend Audit
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                This team could save {formatCurrency(monthlySavings)}/month
              </h1>
              <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
                That&apos;s {formatCurrency(annualSavings)}/year in potential
                savings.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                Shared AI Spend Audit
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
                This team&apos;s AI spend is already optimized ✓
              </h1>
              <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
                Their stack looks lean and well-matched to their usage.
              </p>
            </>
          )}
        </section>

        <section className="mt-10 sm:mt-14">
          <header className="mb-6 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Optimization Breakdown
            </h2>
            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Read-only recommendations from this shared audit.
            </p>
          </header>

          {recommendations.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
              <p className="text-base text-zinc-300">
                No recommendations were included with this shared audit.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recommendations.map((rec, index) => (
                <article
                  key={`${rec.toolName}-${rec.currentPlan}-${index}`}
                  className="group flex w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 shadow-sm"
                >
                  <div
                    className={`w-1 shrink-0 self-stretch ${
                      rec.estimatedMonthlySavings > 0
                        ? "bg-emerald-600"
                        : "bg-zinc-400"
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 p-5 sm:p-6">
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white sm:text-lg">
                          {TOOL_LABELS[rec.toolName] ?? rec.toolName}
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
                        {rec.recommendedAction}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/70 via-zinc-900 to-zinc-900 p-6 text-center shadow-lg shadow-emerald-950/20 sm:mt-16 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Is your team overspending on AI tools?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Run a free audit in 2 minutes. No login required.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400 sm:w-auto sm:text-lg"
          >
            Audit My AI Spend →
          </Link>
        </section>
      </main>
    </div>
  );
}
