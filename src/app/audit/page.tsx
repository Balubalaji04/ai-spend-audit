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
  loadCurrentAuditResult,
  PENDING_AUDIT_KEY,
} from "@/lib/auditStorage";
import type { AuditFormData, AuditResult } from "@/types/audit";

const SHARE_AUDIT_ID_PREFIX = "share-audit-id-";
const saveAuditPromises = new Map<string, Promise<string | null>>();

function getShareAuditIdKey(auditResultId: string): string {
  return `${SHARE_AUDIT_ID_PREFIX}${auditResultId}`;
}

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const saveAudit = async (auditResult: AuditResult) => {
    const storageKey = getShareAuditIdKey(auditResult.id);

    try {
      const storedAuditId = sessionStorage.getItem(storageKey);
      if (storedAuditId) {
        setAuditId(storedAuditId);
        setShareUrl(`${window.location.origin}/audit/${storedAuditId}`);
        return;
      }

      let savePromise = saveAuditPromises.get(auditResult.id);

      if (!savePromise) {
        savePromise = (async () => {
          const response = await fetch("/api/save-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(auditResult),
          });

          if (!response.ok) return null;

          const { id } = (await response.json()) as { id: string };
          sessionStorage.setItem(storageKey, id);
          return id;
        })();
        saveAuditPromises.set(auditResult.id, savePromise);
      }

      const id = await savePromise;
      if (!id) return;

      setAuditId(id);
      setShareUrl(`${window.location.origin}/audit/${id}`);
    } catch (err) {
      saveAuditPromises.delete(auditResult.id);
      console.error("Failed to save audit:", err);
      // Fail silently — sharing is a bonus feature, not critical
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

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

    let formData: AuditFormData;
    try {
      formData = JSON.parse(raw) as AuditFormData;
    } catch {
      startTransition(() => {
        setError("Invalid audit data");
        setIsLoading(false);
      });
      const timer = setTimeout(() => router.replace("/"), 2000);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    async function loadAudit() {
      try {
        let auditResult = loadCurrentAuditResult();

        if (!auditResult) {
          auditResult = runAudit(formData);
          cacheAuditResult(auditResult);
        }

        if (cancelled) return;

        startTransition(() => {
          setResult(auditResult);
          setIsLoading(false);
        });
        void saveAudit(auditResult);
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
        <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-sm sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Share your results
            </p>
            {auditId === null || shareUrl === null ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500"
                  aria-hidden
                />
                Generating share link...
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700"
                >
                  {copySuccess ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            )}
          </div>
        </section>
        <RecommendationList result={result} />
        <CredexCTA
          result={result}
          auditId={auditId ?? undefined}
          totalMonthlySavings={result.totalMonthlySavings}
        />
      </main>
    </div>
  );
}
