"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuditPageSkeleton } from "@/components/AuditPageSkeleton";
import { AuditSummary } from "@/components/AuditSummary";
import { CredexCTA } from "@/components/CredexCTA";
import { RecommendationList } from "@/components/RecommendationList";
import { SavingsHero } from "@/components/SavingsHero";
import { runAudit } from "@/lib/auditEngine";
import {
  cacheAuditResult,
  isAuditPersisted,
  loadCurrentAuditResult,
  markAuditPersisted,
  PENDING_AUDIT_KEY,
} from "@/lib/auditStorage";
import type { AuditFormData, AuditResult } from "@/types/audit";

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PENDING_AUDIT_KEY);

    if (!raw) {
      startTransition(() => {
        setError("No audit data found");
        setIsLoading(false);
      });
      const timer = setTimeout(() => router.replace("/"), 2000);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    async function loadAudit() {
      try {
        const formData = JSON.parse(raw) as AuditFormData;
        let auditResult = loadCurrentAuditResult();

        if (!auditResult) {
          auditResult = runAudit(formData);
          cacheAuditResult(auditResult);
        }

        if (!isAuditPersisted(auditResult.id)) {
          try {
            const response = await fetch("/api/audits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(auditResult),
            });
            if (response.ok) {
              markAuditPersisted(auditResult.id);
            }
          } catch (saveError) {
            console.error("Failed to save audit to database:", saveError);
          }
        }

        if (cancelled) return;

        startTransition(() => {
          setResult(auditResult);
          setIsLoading(false);
        });
      } catch (err) {
        if (cancelled) return;
        startTransition(() => {
          setError(
            err instanceof Error ? err.message : "Failed to run audit",
          );
          setIsLoading(false);
        });
      }
    }

    loadAudit();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return <AuditPageSkeleton />;
  }

  if (error !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
          <p className="text-4xl" aria-hidden>
            ⚠️
          </p>
          <h1 className="mt-4 text-xl font-semibold text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Start Over
          </Link>
        </div>
      </div>
    );
  }

  if (result === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="shrink-0 text-base font-semibold text-white transition-colors hover:text-emerald-400 sm:text-lg"
          >
            SpendScope
          </Link>
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-900 hover:text-white sm:px-3 sm:text-sm"
          >
            Start a new audit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <SavingsHero result={result} />
        <AuditSummary result={result} />
        <RecommendationList result={result} />
        <CredexCTA
          result={result}
          auditId={result.id}
          totalMonthlySavings={result.totalMonthlySavings}
        />
      </main>
    </div>
  );
}
