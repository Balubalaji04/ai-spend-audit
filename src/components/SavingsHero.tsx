"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatCurrencyAnnual } from "@/lib/utils";
import type { AuditResult } from "@/types/audit";

type SavingsHeroProps = {
  result: AuditResult;
};

const ANIMATION_DURATION_MS = 1800;
const TICK_INTERVAL_MS = 30;
const ANIMATION_STEPS = ANIMATION_DURATION_MS / TICK_INTERVAL_MS;

function countOptimizations(result: AuditResult): number {
  return result.recommendations.filter((r) => r.estimatedMonthlySavings > 0)
    .length;
}

export function SavingsHero({ result }: SavingsHeroProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const hasSavings = result.totalMonthlySavings > 0;
  const optimizationCount = countOptimizations(result);

  useEffect(() => {
    if (!hasSavings) {
      setDisplayAmount(0);
      return;
    }

    const total = result.totalMonthlySavings;
    const increment = total / ANIMATION_STEPS;
    let tick = 0;

    setDisplayAmount(0);

    const interval = setInterval(() => {
      tick += 1;
      if (tick >= ANIMATION_STEPS) {
        setDisplayAmount(total);
        clearInterval(interval);
        return;
      }
      setDisplayAmount((prev) => Math.min(total, prev + increment));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasSavings, result.totalMonthlySavings]);

  const scrollToBreakdown = () => {
    document.getElementById("recommendations")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (!hasSavings) {
    return (
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12)_0%,_transparent_65%)]"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500/10"
            aria-hidden
          >
            <svg
              className="h-10 w-10 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Your AI spend looks optimized
          </h1>
          <p className="mt-4 max-w-md px-2 text-base leading-relaxed text-zinc-400 sm:px-0 sm:text-lg">
            We checked your stack against 30+ pricing rules and found no
            obvious overspend.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex min-h-[85vh] flex-col px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.18)_0%,_transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex w-full max-w-3xl flex-col items-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          AI Spend Audit Complete
        </p>

        <h1 className="mt-6 text-xl font-medium text-zinc-300 sm:text-3xl">
          You could save
        </h1>

        <p
          className="mt-2 bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-5xl font-bold tabular-nums tracking-tight text-transparent sm:text-7xl"
          aria-live="polite"
        >
          {formatCurrency(displayAmount)}
        </p>

        <p className="mt-1 text-base font-medium text-zinc-400 sm:text-lg">
          /month
        </p>

        <p className="mt-6 text-lg text-zinc-300 sm:text-2xl">
          That&apos;s{" "}
          <span className="font-semibold text-white">
            {formatCurrencyAnnual(result.totalAnnualSavings)}
          </span>
        </p>

        <span className="mt-6 inline-flex items-center rounded-full border border-zinc-700/80 bg-zinc-900/60 px-4 py-1.5 text-sm text-zinc-400">
          {optimizationCount}{" "}
          {optimizationCount === 1 ? "optimization" : "optimizations"} found
        </span>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToBreakdown}
        className="relative z-10 mx-auto w-full max-w-xs rounded-lg border border-zinc-600 bg-transparent px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900/50 hover:text-white sm:w-auto"
      >
        See Your Breakdown
      </button>
    </section>
  );
}
