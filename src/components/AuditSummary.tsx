"use client";

import { startTransition, useEffect, useState } from "react";
import type { AuditResult } from "@/types/audit";

type AuditSummaryProps = {
  result: AuditResult;
};

function formatAmount(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function buildFallbackSummary(result: AuditResult): string {
  const totalMonthlySavings = formatAmount(result.totalMonthlySavings);
  const totalAnnualSavings = formatAmount(result.totalAnnualSavings);
  const top3 = [...result.recommendations]
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
    .slice(0, 3);
  const top1 = top3[0];
  const optimizationCount = result.recommendations.filter(
    (r) => r.estimatedMonthlySavings > 0,
  ).length;

  return `Your AI spending audit identified ${optimizationCount} optimization opportunities worth $${totalMonthlySavings}/month. ${top1 ? `The biggest win is to ${top1.recommendedAction.toLowerCase()} — ${top1.reason}` : "Review the recommendations above for specific actions."} By implementing these changes, your team could save $${totalAnnualSavings} annually — capital better invested in growing your product.`;
}

const cardClass =
  "w-full min-h-[11rem] rounded-xl border border-zinc-700/80 bg-zinc-900/80 p-5 shadow-sm sm:p-8";

export function AuditSummary({ result }: AuditSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        });

        const data = (await response.json()) as { summary?: string };

        if (cancelled) return;

        if (response.ok && data.summary) {
          startTransition(() => {
            setSummary(data.summary!);
            setUsedFallback(false);
            setIsLoading(false);
          });
          return;
        }

        startTransition(() => {
          setSummary(buildFallbackSummary(result));
          setUsedFallback(true);
          setIsLoading(false);
        });
      } catch {
        if (cancelled) return;
        startTransition(() => {
          setSummary(buildFallbackSummary(result));
          setUsedFallback(true);
          setIsLoading(false);
        });
      }
    }

    startTransition(() => {
      setIsLoading(true);
      setUsedFallback(false);
      setSummary(null);
    });

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [result]);

  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      {isLoading ? (
        <div className={cardClass}>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              AI-Generated Summary
            </p>
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500"
              role="status"
              aria-label="Loading summary"
            />
          </div>

          <div className="mt-5 space-y-3" aria-hidden>
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-[88%] animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-[72%] animate-pulse rounded bg-zinc-800" />
          </div>
        </div>
      ) : (
        <div className={cardClass}>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              AI-Generated Summary
            </p>
            {usedFallback && (
              <span className="text-xs text-zinc-600">(template)</span>
            )}
          </div>

          <blockquote className="relative mt-5 border-l-2 border-emerald-500/30 pl-5">
            <span
              className="pointer-events-none absolute -left-0.5 -top-2 font-serif text-3xl leading-none text-emerald-500/25"
              aria-hidden
            >
              &ldquo;
            </span>
            <p className="text-base leading-relaxed text-zinc-300 sm:text-lg">
              {summary}
            </p>
            <span
              className="pointer-events-none mt-1 block text-right font-serif text-3xl leading-none text-emerald-500/25"
              aria-hidden
            >
              &rdquo;
            </span>
          </blockquote>
        </div>
      )}
    </section>
  );
}
