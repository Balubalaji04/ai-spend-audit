"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { AuditResult } from "@/types/audit";

type CredexCTAProps = {
  result: AuditResult;
  auditId?: string;
  totalMonthlySavings: number;
};

function SubmitSuccess({
  email,
  totalMonthlySavings,
}: {
  email: string;
  totalMonthlySavings: number;
}) {
  return (
    <div className="mt-6 text-center sm:text-left">
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 sm:mx-0"
        aria-hidden
      >
        <svg
          className="h-7 w-7 text-emerald-400"
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
      <h3 className="mt-4 text-xl font-bold text-white">You&apos;re all set!</h3>
      <p className="mt-2 text-base text-zinc-400">
        Check your inbox — we just sent your audit results to{" "}
        <span className="font-medium text-zinc-200">{email}</span>
      </p>
      {totalMonthlySavings > 500 && (
        <p className="mt-3 text-sm text-amber-400/90">
          A Credex team member will reach out within 1 business day.
        </p>
      )}
    </div>
  );
}

function EmailCaptureForm({
  buttonText,
  auditId,
  totalMonthlySavings,
  teamSize,
}: {
  buttonText: string;
  auditId?: string;
  totalMonthlySavings: number;
  teamSize: number;
}) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setSubmitError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          companyName: companyName.trim() || undefined,
          auditId,
          teamSize,
          totalMonthlySavings,
          website: "",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = (await response.json()) as { error?: string };
        setSubmitError(
          data.error || "Something went wrong. Please try again.",
        );
      }
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SubmitSuccess
        email={email.trim()}
        totalMonthlySavings={totalMonthlySavings}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSubmitError(null);
          }}
          placeholder="your@email.com"
          disabled={isSubmitting}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
        />
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company (optional)"
          disabled={isSubmitting}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50 sm:max-w-[200px]"
        />
      </div>
      {submitError && (
        <p className="text-sm text-red-400" role="alert">
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : buttonText}
      </button>
    </form>
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

function ModerateSavingsCTA({
  auditId,
  totalMonthlySavings,
  teamSize,
}: {
  auditId?: string;
  totalMonthlySavings: number;
  teamSize: number;
}) {
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

      <EmailCaptureForm
        buttonText="Notify Me When Deals Match My Stack"
        auditId={auditId}
        totalMonthlySavings={totalMonthlySavings}
        teamSize={teamSize}
      />
    </div>
  );
}

function OptimalCTA({
  auditId,
  totalMonthlySavings,
  teamSize,
}: {
  auditId?: string;
  totalMonthlySavings: number;
  teamSize: number;
}) {
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

      <EmailCaptureForm
        buttonText="Keep Me Posted on AI Pricing Changes"
        auditId={auditId}
        totalMonthlySavings={totalMonthlySavings}
        teamSize={teamSize}
      />
    </div>
  );
}

export function CredexCTA({
  result,
  auditId,
  totalMonthlySavings,
}: CredexCTAProps) {
  const savings = totalMonthlySavings;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
      {savings > 500 ? (
        <HighSavingsCTA result={result} />
      ) : savings > 0 ? (
        <ModerateSavingsCTA
          auditId={auditId}
          totalMonthlySavings={totalMonthlySavings}
          teamSize={result.formData.teamSize}
        />
      ) : (
        <OptimalCTA
          auditId={auditId}
          totalMonthlySavings={totalMonthlySavings}
          teamSize={result.formData.teamSize}
        />
      )}
    </section>
  );
}
