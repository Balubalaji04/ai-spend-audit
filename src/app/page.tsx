"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToolRow } from "@/components/ToolRow";
import { TOOL_PLANS, USE_CASES } from "@/data/pricing";
import { runAudit } from "@/lib/auditEngine";
import { savePendingAudit } from "@/lib/auditStorage";
import type { AuditFormData, ToolEntry, ToolName } from "@/types/audit";

const FORM_STORAGE_KEY = "audit-form-data";

function createToolEntry(useCase: ToolEntry["useCase"] = "coding"): ToolEntry {
  const toolName: ToolName = "cursor";
  const plan = TOOL_PLANS[toolName][0];
  return {
    id: crypto.randomUUID(),
    toolName,
    plan: plan.value,
    seats: 1,
    monthlySpend: plan.pricePerSeat > 0 ? plan.pricePerSeat : 0,
    useCase,
  };
}

function createInitialFormData(): AuditFormData {
  return {
    tools: [createToolEntry()],
    teamSize: 1,
    primaryUseCase: "coding",
  };
}

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

function validateForm(data: AuditFormData): string | null {
  if (data.tools.length === 0) {
    return "Add at least one AI tool to audit.";
  }
  if (data.teamSize <= 0) {
    return "Team size must be greater than 0.";
  }
  const missingSpend = data.tools.some((t) => t.monthlySpend <= 0);
  if (missingSpend) {
    return "Each tool must have a monthly spend greater than $0.";
  }
  return null;
}

function loadFormData(): AuditFormData {
  const raw = localStorage.getItem(FORM_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AuditFormData;
      if (
        parsed &&
        Array.isArray(parsed.tools) &&
        parsed.tools.length > 0 &&
        typeof parsed.teamSize === "number" &&
        parsed.primaryUseCase
      ) {
        return parsed;
      }
    } catch {
      // ignore invalid stored data
    }
  }
  return createInitialFormData();
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<AuditFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      setFormData(loadFormData());
    });
  }, []);

  useEffect(() => {
    if (!formData) return;
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateTool = (updated: ToolEntry) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            tools: prev.tools.map((t) =>
              t.id === updated.id ? updated : t,
            ),
          }
        : prev,
    );
    setError(null);
  };

  const removeTool = (id: string) => {
    setFormData((prev) =>
      prev
        ? { ...prev, tools: prev.tools.filter((t) => t.id !== id) }
        : prev,
    );
    setError(null);
  };

  const addTool = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            tools: [...prev.tools, createToolEntry(prev.primaryUseCase)],
          }
        : prev,
    );
    setError(null);
  };

  const handleSubmit = () => {
    if (!formData) return;
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    const result = runAudit(formData);
    savePendingAudit(formData, result);
    router.push("/audit");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 text-center sm:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            SpendScope
          </h1>
          <p className="mt-3 text-lg text-zinc-300">
            Find out if you&apos;re overpaying for AI tools. Free, instant, no
            login required.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Tell us which AI subscriptions and API bills your team pays each
            month, and we&apos;ll compare your spend against current list prices
            and common overlap patterns.
          </p>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-zinc-400">
            You get a clear breakdown of where you might be overspending and
            practical steps to consolidate or downgrade—without a sales call.
          </p>
        </header>

        {!formData ? (
          <p className="text-center text-zinc-500">Loading form…</p>
        ) : (
          <section className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Team Info
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="team-size">
                    How many people on your team?
                  </label>
                  <input
                    id="team-size"
                    type="number"
                    min={1}
                    className={fieldClass}
                    value={formData.teamSize}
                    onChange={(e) => {
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              teamSize: Math.max(
                                0,
                                parseInt(e.target.value, 10) || 0,
                              ),
                            }
                          : prev,
                      );
                      setError(null);
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="primary-use-case">
                    Primary use case
                  </label>
                  <select
                    id="primary-use-case"
                    className={fieldClass}
                    value={formData.primaryUseCase}
                    onChange={(e) => {
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              primaryUseCase: e.target
                                .value as AuditFormData["primaryUseCase"],
                            }
                          : prev,
                      );
                      setError(null);
                    }}
                  >
                    {USE_CASES.map((uc) => (
                      <option key={uc.value} value={uc.value}>
                        {uc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">
                AI tools you pay for
              </h2>
              <div className="space-y-3">
                {formData.tools.map((entry) => (
                  <ToolRow
                    key={entry.id}
                    entry={entry}
                    onUpdate={updateTool}
                    onRemove={removeTool}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addTool}
              className="w-full rounded-lg border border-dashed border-zinc-600 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-900 hover:text-white"
            >
              + Add Tool
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Run My Audit →
              </button>
              {error && (
                <p
                  className="mt-3 text-center text-sm text-red-400"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
