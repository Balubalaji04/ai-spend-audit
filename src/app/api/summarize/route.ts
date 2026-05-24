import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AuditResult } from "@/types/audit";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (record.count >= 5) return true;
  record.count++;
  return false;
}

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

async function saveAiSummary(auditId: string | undefined, summary: string) {
  if (!auditId) return;

  const { error } = await supabaseAdmin
    .from("audits")
    .update({ ai_summary: summary })
    .eq("id", auditId);

  if (error) {
    console.error("[summarize] Failed to save ai_summary:", error);
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let result: AuditResult;

  try {
    result = (await request.json()) as AuditResult;
  } catch {
    return NextResponse.json({
      summary:
        "Your AI spending audit is complete. Review the recommendations above for specific ways to optimize your tool stack and reduce monthly costs.",
    });
  }

  const teamSize = result.formData.teamSize;
  const useCase = result.formData.primaryUseCase;
  const totalMonthlySavings = formatAmount(result.totalMonthlySavings);
  const totalAnnualSavings = formatAmount(result.totalAnnualSavings);
  const currentSpend = formatAmount(
    result.formData.tools.reduce((sum, t) => sum + t.monthlySpend, 0),
  );

  const top3 = [...result.recommendations]
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
    .slice(0, 3);

  const userPrompt = `Write a 100-word personalized audit summary for this team:

Team size: ${teamSize} people
Primary use case: ${useCase}
Current total AI spend: $${currentSpend}/month
Potential savings identified: $${totalMonthlySavings}/month ($${totalAnnualSavings}/year)
Top recommendations:
${top3.map((r, i) => `${i + 1}. ${r.recommendedAction} — ${r.reason}`).join("\n")}

Write 2-3 sentences summarizing what the audit found. Then 1-2 sentences on the most important actions to take first. End with one sentence on the annual impact. Do not use bullet points. Total length: exactly 90-110 words. Be specific with the numbers. Write in second person (you/your).`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system:
        "You are a concise financial advisor helping startup founders optimize their AI tool spending. Write in a friendly but professional tone. Always be specific with dollar amounts. Never use vague language like \"significant\" without a number.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const summary =
      message.content[0]?.type === "text"
        ? message.content[0].text
        : buildFallbackSummary(result);
    const finalSummary = summary || buildFallbackSummary(result);

    await saveAiSummary(result.id, finalSummary);

    return NextResponse.json({ summary: finalSummary });
  } catch {
    const fallback = buildFallbackSummary(result);
    await saveAiSummary(result.id, fallback);
    return NextResponse.json({ summary: fallback });
  }
}
