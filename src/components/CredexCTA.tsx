"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { AuditResult } from "@/types/audit";

type CredexCTAProps = {
  result: AuditResult;
};

type CapturedLead = {
  email: string;
  companyName: string;
  savings: number;
};

const LEAD_STORAGE_KEY = "captured-lead";

function EmailCaptureForm({
  buttonText,
  savings,
  onSuccess,
}: {
  buttonText: string;
  savings: number;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    const lead: CapturedLead = {
      email: trimmed,
      companyName: companyName.trim(),
      savings,
    };
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(lead));
    setValidationError(null);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidationError(null);
          }}
          placeholder="your@email.com"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company (optional)"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:max-w-[200px]"
        />
      </div>
      {validationError && (
        <p className="text-sm text-red-400" role="alert">
          {validationError}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 sm:w-auto"
      >
        {buttonText}
      </button>
    </form>
  );
}

function SuccessMessage() {
  return (
    <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
      ✅ You&apos;re on the list! We&apos;ll reach out when relevant credits
      become available.
    </p>
  );
}

function HighSavingsCTA({ result }: { result: AuditResult }) {
  const monthly = result.totalMonthlySavings;
  const annual = result.totalAnnualSavings;

  return (
    <div className="w-full rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-900 p-6 shadow-lg shadow-emerald-950/20 sm:p-10">
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-emerald-500/30">
        💰 Significant Savings Opportunity
      </span>

      <h2 className="mt-6 text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        You&apos;re leaving {formatCurrency(annual)} on the table every year
      </h2>

      <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300">
        <p>
          Your audit found {formatCurrency(monthly)} in monthly optimizations —
          but that&apos;s just the start. Credex sells discounted AI
          infrastructure credits sourced from companies that overforecast their
          usage.
        </p>
        <p>
          Our users typically capture an additional 15–30% in savings beyond
          what a plan downgrade alone achieves. For a team at your spend level,
          that&apos;s worth a 15-minute conversation.
        </p>
      </div>

      <a
        href="https://credex.rocks"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400 sm:w-auto sm:text-lg"
      >
        Book a Free Credex Consultation →
      </a>

      <p className="mt-4 text-center text-xs text-zinc-500 sm:text-left">
        No commitment. 15-minute call. We&apos;ll show you what&apos;s available
        for your exact stack.
      </p>
    </div>
  );
}

function ModerateSavingsCTA({ result }: { result: AuditResult }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/60 p-6 sm:p-10">
      <h2 className="text-xl font-bold text-white sm:text-3xl">
        Want to capture even more savings?
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
        Credex offers discounted AI credits from companies that overforecast
        usage. Sign up to be notified when deals matching your stack become
        available.
      </p>

      {submitted ? (
        <SuccessMessage />
      ) : (
        <EmailCaptureForm
          buttonText="Notify Me When Deals Match My Stack"
          savings={result.totalMonthlySavings}
          onSuccess={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}

function OptimalCTA({ result }: { result: AuditResult }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10">
      <p className="text-4xl" aria-hidden>
        🏆
      </p>
      <h2 className="mt-4 text-xl font-bold text-white sm:text-3xl">
        You&apos;re spending well
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
        Your AI stack looks lean and well-matched to your use case. We
        couldn&apos;t find any obvious optimizations — which means you&apos;re
        already ahead of most teams.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        AI pricing changes frequently. Drop your email and we&apos;ll let you
        know when new optimization opportunities appear for your tools.
      </p>

      {submitted ? (
        <SuccessMessage />
      ) : (
        <EmailCaptureForm
          buttonText="Keep Me Posted on AI Pricing Changes"
          savings={result.totalMonthlySavings}
          onSuccess={() => setSubmitted(true)}
        />
      )}
    </div>
  );
}

export function CredexCTA({ result }: CredexCTAProps) {
  const savings = result.totalMonthlySavings;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
      {savings > 500 ? (
        <HighSavingsCTA result={result} />
      ) : savings > 0 ? (
        <ModerateSavingsCTA result={result} />
      ) : (
        <OptimalCTA result={result} />
      )}
    </section>
  );
}
