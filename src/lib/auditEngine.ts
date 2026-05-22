import { TOOL_PLANS } from "@/data/pricing";
import type {
  AuditFormData,
  AuditRecommendation,
  AuditResult,
  ToolEntry,
  ToolName,
} from "@/types/audit";

type RuleMatch = {
  recommendedAction: string;
  estimatedMonthlySavings: number;
  reason: string;
};

function getPlanPrice(toolName: ToolName, plan: string): number {
  const option = TOOL_PLANS[toolName].find((p) => p.value === plan);
  return option?.pricePerSeat ?? 0;
}

function getPlanLabel(toolName: ToolName, plan: string): string {
  const option = TOOL_PLANS[toolName].find((p) => p.value === plan);
  return option?.label ?? plan;
}

function evaluateRules(
  entry: ToolEntry,
  formData: AuditFormData,
): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const planPrice = getPlanPrice(entry.toolName, entry.plan);
  const { teamSize, tools } = formData;

  const hasTool = (name: ToolName) => tools.some((t) => t.toolName === name);
  const getTool = (name: ToolName) => tools.find((t) => t.toolName === name);

  // --- CURSOR ---
  if (entry.toolName === "cursor") {
    if (entry.plan === "business" && entry.seats < 5) {
      matches.push({
        recommendedAction: "Recommend downgrade to Pro",
        estimatedMonthlySavings: entry.seats * 20,
        reason:
          "Business plan adds SSO and admin controls that teams under 5 seats rarely need.",
      });
    }
    if (
      planPrice > 0 &&
      entry.monthlySpend > entry.seats * planPrice * 1.1
    ) {
      matches.push({
        recommendedAction:
          "Verify billing — you may be paying more than your plan price.",
        estimatedMonthlySavings: entry.monthlySpend - entry.seats * planPrice,
        reason: `Your reported spend ($${entry.monthlySpend}/mo) exceeds the list price for this plan ($${entry.seats * planPrice}/mo for ${entry.seats} seat${entry.seats === 1 ? "" : "s"}).`,
      });
    }
  }

  // --- GITHUB COPILOT ---
  if (entry.toolName === "github-copilot") {
    if (entry.plan === "enterprise" && entry.seats < 20) {
      matches.push({
        recommendedAction: "Recommend downgrade to Business",
        estimatedMonthlySavings: entry.seats * 20,
        reason:
          "Enterprise adds audit logs and policy controls only relevant at 20+ seats.",
      });
    }
    if (entry.plan === "business" && entry.seats < 3) {
      matches.push({
        recommendedAction: "Recommend downgrade to Individual",
        estimatedMonthlySavings: entry.seats * 9,
        reason:
          "Individual plan is functionally identical for teams under 3 without an org account.",
      });
    }
  }

  // --- CLAUDE ---
  if (entry.toolName === "claude") {
    if (entry.plan === "team" && entry.seats < 3) {
      matches.push({
        recommendedAction: "Recommend switching to individual Pro plans",
        estimatedMonthlySavings: entry.seats * 30 - entry.seats * 20,
        reason:
          "Team plan pricing exceeds the cost of individual Pro subscriptions for under 3 users.",
      });
    }
    if (entry.useCase === "coding") {
      matches.push({
        recommendedAction:
          "Suggest considering Cursor or GitHub Copilot as primary coding tool",
        estimatedMonthlySavings: 10 * entry.seats,
        reason:
          "IDE-native coding tools have deeper integration than general-purpose chat interfaces for development workflows.",
      });
    }
  }

  // --- CHATGPT ---
  if (entry.toolName === "chatgpt") {
    if (entry.plan === "team" && entry.seats < 3) {
      matches.push({
        recommendedAction: "Recommend switching to Plus",
        estimatedMonthlySavings: entry.seats * 10,
        reason:
          "ChatGPT Team minimum pricing exceeds individual Plus for teams under 3.",
      });
    }
    const claudeEntry = getTool("claude");
    if (claudeEntry && entry.monthlySpend <= claudeEntry.monthlySpend) {
      matches.push({
        recommendedAction: "Flag as redundant",
        estimatedMonthlySavings: entry.monthlySpend,
        reason:
          "Running two general-purpose LLM subscriptions with overlapping capabilities is rarely justified.",
      });
    }
  }

  // --- CLAUDE redundant (cheaper of chatgpt + claude) ---
  if (entry.toolName === "claude") {
    const chatgptEntry = getTool("chatgpt");
    if (
      chatgptEntry &&
      hasTool("chatgpt") &&
      entry.monthlySpend < chatgptEntry.monthlySpend
    ) {
      matches.push({
        recommendedAction: "Flag as redundant",
        estimatedMonthlySavings: entry.monthlySpend,
        reason:
          "Running two general-purpose LLM subscriptions with overlapping capabilities is rarely justified.",
      });
    }
  }

  // --- API TOOLS ---
  if (
    (entry.toolName === "anthropic-api" || entry.toolName === "openai-api") &&
    entry.monthlySpend > 500
  ) {
    matches.push({
      recommendedAction: "Consider Credex for discounted API credits",
      estimatedMonthlySavings: entry.monthlySpend * 0.15,
      reason:
        "Credex offers discounted credits sourced from companies that overforecast usage. At your spend level, savings of 10-20% are typical.",
    });
  }

  // --- GEMINI ---
  if (
    entry.toolName === "gemini" &&
    entry.useCase === "coding" &&
    entry.plan !== "free"
  ) {
    matches.push({
      recommendedAction: "Suggest Cursor Pro instead",
      estimatedMonthlySavings: Math.max(0, entry.monthlySpend - 20 * entry.seats),
      reason:
        "For coding workflows, IDE-native tools like Cursor outperform browser-based AI assistants.",
    });
  }

  // --- WINDSURF ---
  if (entry.toolName === "windsurf" && hasTool("cursor")) {
    matches.push({
      recommendedAction: "Flag Windsurf as redundant",
      estimatedMonthlySavings: entry.monthlySpend,
      reason:
        "Cursor and Windsurf serve identical use cases — running both doubles your AI coding tool cost.",
    });
  }

  return matches;
}

function evaluateGeneralRule(
  entry: ToolEntry,
  formData: AuditFormData,
): RuleMatch[] {
  const planPrice = getPlanPrice(entry.toolName, entry.plan);
  const { teamSize } = formData;

  if (
    planPrice > 0 &&
    entry.seats > teamSize * 1.5 &&
    entry.seats > teamSize
  ) {
    return [
      {
        recommendedAction: "Flag as seat bloat",
        estimatedMonthlySavings: (entry.seats - teamSize) * planPrice,
        reason:
          "You have significantly more seats than team members. Reducing to match your team size eliminates waste.",
      },
    ];
  }

  return [];
}

function pickBestMatch(matches: RuleMatch[]): RuleMatch {
  return matches.reduce((best, current) =>
    current.estimatedMonthlySavings > best.estimatedMonthlySavings
      ? current
      : best,
  );
}

function resolveRecommendation(
  entry: ToolEntry,
  formData: AuditFormData,
): RuleMatch[] {
  const specific = evaluateRules(entry, formData);
  if (specific.length > 0) return [pickBestMatch(specific)];
  return evaluateGeneralRule(entry, formData);
}

function buildRecommendation(
  entry: ToolEntry,
  match: RuleMatch,
): AuditRecommendation {
  return {
    toolEntryId: entry.id,
    toolName: entry.toolName,
    currentPlan: getPlanLabel(entry.toolName, entry.plan),
    currentMonthlySpend: entry.monthlySpend,
    recommendedAction: match.recommendedAction,
    estimatedMonthlySavings: match.estimatedMonthlySavings,
    reason: match.reason,
  };
}

export function runAudit(formData: AuditFormData): AuditResult {
  const recommendations: AuditRecommendation[] = formData.tools.map(
    (entry) => {
      const matches = resolveRecommendation(entry, formData);

      if (matches.length === 0) {
        return {
          toolEntryId: entry.id,
          toolName: entry.toolName,
          currentPlan: getPlanLabel(entry.toolName, entry.plan),
          currentMonthlySpend: entry.monthlySpend,
          recommendedAction: "No action needed",
          estimatedMonthlySavings: 0,
          reason: "This tool and plan look well-matched to your usage.",
        };
      }

      return buildRecommendation(entry, pickBestMatch(matches));
    },
  );

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedMonthlySavings,
    0,
  );

  return {
    id: crypto.randomUUID(),
    formData,
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    generatedAt: new Date().toISOString(),
  };
}
