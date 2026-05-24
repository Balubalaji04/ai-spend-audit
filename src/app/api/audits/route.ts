import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AuditResult } from "@/types/audit";

function buildAuditRows(result: AuditResult, id: string) {
  const base = {
    id,
    tools: result.formData.tools,
    team_size: result.formData.teamSize,
    primary_use_case: result.formData.primaryUseCase,
    recommendations: result.recommendations,
  };

  const withTotals = {
    ...base,
    total_monthly_savings: result.totalMonthlySavings,
    total_annual_savings: result.totalAnnualSavings,
  };

  return { withTotals, base };
}

export async function POST(request: NextRequest) {
  try {
    const result = (await request.json()) as AuditResult;

    if (!result?.formData || !Array.isArray(result.recommendations)) {
      return NextResponse.json(
        { error: "Invalid audit data" },
        { status: 400 },
      );
    }

    const id = result.id ?? crypto.randomUUID();
    const { withTotals, base } = buildAuditRows(result, id);

    let { error } = await supabaseAdmin.from("audits").upsert(withTotals, {
      onConflict: "id",
    });

    if (error?.message?.includes("total_monthly_savings") ||
        error?.message?.includes("total_annual_savings")) {
      console.warn(
        "[audits] Totals columns missing, saving without them:",
        error.message,
      );
      const retry = await supabaseAdmin.from("audits").upsert(base, {
        onConflict: "id",
      });
      error = retry.error;
    }

    if (error) {
      console.error("[audits] Supabase upsert failed:", error);
      return NextResponse.json(
        { error: "Failed to save audit" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[audits] Request failed:", error);
    return NextResponse.json(
      { error: "Failed to save audit" },
      { status: 500 },
    );
  }
}
