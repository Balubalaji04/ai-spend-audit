"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import type { AuditFormData, AuditResult } from "@/types/audit";

const PENDING_AUDIT_KEY = "pending-audit";

export default function AuditPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PENDING_AUDIT_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      const formData = JSON.parse(raw) as AuditFormData;
      startTransition(() => {
        setResult(runAudit(formData));
      });
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <h1 className="text-2xl font-semibold text-white">Audit results</h1>
      <p className="mt-2 text-zinc-400">
        Total savings:{" "}
        <span className="font-medium text-emerald-400">
          ${result.totalMonthlySavings}/mo
        </span>{" "}
        (${result.totalAnnualSavings}/yr)
      </p>
      <pre className="mt-8 max-w-2xl w-full overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-left text-sm text-zinc-300">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
