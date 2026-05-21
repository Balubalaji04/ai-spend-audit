"use client";

import { TOOL_LABELS, TOOL_PLANS, USE_CASES } from "@/data/pricing";
import type { ToolEntry, ToolName } from "@/types/audit";

const TOOL_NAMES = Object.keys(TOOL_LABELS) as ToolName[];

type ToolRowProps = {
  entry: ToolEntry;
  onUpdate: (updated: ToolEntry) => void;
  onRemove: (id: string) => void;
};

function getPlan(toolName: ToolName, planValue: string) {
  const plans = TOOL_PLANS[toolName];
  return plans.find((p) => p.value === planValue) ?? plans[0];
}

function computeMonthlySpend(seats: number, pricePerSeat: number): number {
  return pricePerSeat > 0 ? seats * pricePerSeat : 0;
}

const fieldClass =
  "w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

const labelClass = "mb-1 block text-xs font-medium text-zinc-400";

export function ToolRow({ entry, onUpdate, onRemove }: ToolRowProps) {
  const plans = TOOL_PLANS[entry.toolName];
  const selectedPlan = getPlan(entry.toolName, entry.plan);
  const isManualSpend = selectedPlan.pricePerSeat === 0;

  const update = (patch: Partial<ToolEntry>) => {
    onUpdate({ ...entry, ...patch });
  };

  const handleToolChange = (toolName: ToolName) => {
    const newPlans = TOOL_PLANS[toolName];
    const firstPlan = newPlans[0];
    const monthlySpend = computeMonthlySpend(entry.seats, firstPlan.pricePerSeat);
    onUpdate({
      ...entry,
      toolName,
      plan: firstPlan.value,
      monthlySpend,
    });
  };

  const handlePlanChange = (plan: string) => {
    const planOption = getPlan(entry.toolName, plan);
    const monthlySpend = computeMonthlySpend(entry.seats, planOption.pricePerSeat);
    onUpdate({
      ...entry,
      plan,
      monthlySpend,
    });
  };

  const handleSeatsChange = (seats: number) => {
    const safeSeats = Math.max(1, seats);
    const monthlySpend = computeMonthlySpend(
      safeSeats,
      selectedPlan.pricePerSeat,
    );
    onUpdate({
      ...entry,
      seats: safeSeats,
      monthlySpend,
    });
  };

  const handleMonthlySpendChange = (value: string) => {
    const monthlySpend = value === "" ? 0 : Math.max(0, Number(value));
    update({ monthlySpend: Number.isNaN(monthlySpend) ? 0 : monthlySpend });
  };

  const handleUseCaseChange = (useCase: ToolEntry["useCase"]) => {
    update({ useCase });
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-row lg:items-end lg:gap-2">
        <div className="min-w-0 flex-1 lg:min-w-[140px]">
          <label className={labelClass} htmlFor={`tool-${entry.id}`}>
            Tool
          </label>
          <select
            id={`tool-${entry.id}`}
            className={fieldClass}
            value={entry.toolName}
            onChange={(e) => handleToolChange(e.target.value as ToolName)}
          >
            {TOOL_NAMES.map((name) => (
              <option key={name} value={name}>
                {TOOL_LABELS[name]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 flex-1 lg:min-w-[120px]">
          <label className={labelClass} htmlFor={`plan-${entry.id}`}>
            Plan
          </label>
          <select
            id={`plan-${entry.id}`}
            className={fieldClass}
            value={entry.plan}
            onChange={(e) => handlePlanChange(e.target.value)}
          >
            {plans.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label}
                {plan.pricePerSeat > 0
                  ? ` ($${plan.pricePerSeat}/seat)`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 lg:w-20">
          <label className={labelClass} htmlFor={`seats-${entry.id}`}>
            Seats
          </label>
          <input
            id={`seats-${entry.id}`}
            type="number"
            min={1}
            className={fieldClass}
            value={entry.seats}
            onChange={(e) =>
              handleSeatsChange(parseInt(e.target.value, 10) || 1)
            }
          />
        </div>

        <div className="min-w-0 flex-1 lg:min-w-[100px]">
          <label className={labelClass} htmlFor={`spend-${entry.id}`}>
            Monthly spend ($)
          </label>
          <input
            id={`spend-${entry.id}`}
            type="number"
            min={0}
            step={0.01}
            className={fieldClass}
            value={
              isManualSpend && entry.monthlySpend === 0
                ? ""
                : entry.monthlySpend
            }
            placeholder={
              isManualSpend
                ? "Enter your actual monthly spend"
                : undefined
            }
            onChange={(e) => handleMonthlySpendChange(e.target.value)}
          />
        </div>

        <div className="min-w-0 flex-1 lg:min-w-[120px]">
          <label className={labelClass} htmlFor={`usecase-${entry.id}`}>
            Use case
          </label>
          <select
            id={`usecase-${entry.id}`}
            className={fieldClass}
            value={entry.useCase}
            onChange={(e) =>
              handleUseCaseChange(e.target.value as ToolEntry["useCase"])
            }
          >
            {USE_CASES.map((uc) => (
              <option key={uc.value} value={uc.value}>
                {uc.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end lg:pb-0.5">
          <button
            type="button"
            aria-label="Remove tool"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onRemove(entry.id)}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
