import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { AuditResult } from '@/types/audit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const result = (await request.json()) as AuditResult

    const { data, error } = await supabase
      .from('audits')
      .insert({
        tools: result.formData.tools.map((t) => ({
          toolName: t.toolName,
          plan: t.plan,
          seats: t.seats,
          useCase: t.useCase,
          // NOTE: monthlySpend intentionally excluded for privacy
        })),
        team_size: result.formData.teamSize,
        primary_use_case: result.formData.primaryUseCase,
        recommendations: result.recommendations.map((r) => ({
          toolName: r.toolName,
          currentPlan: r.currentPlan,
          recommendedAction: r.recommendedAction,
          estimatedMonthlySavings: r.estimatedMonthlySavings,
          reason: r.reason,
          // NOTE: currentMonthlySpend excluded for privacy
        })),
        total_monthly_savings: result.totalMonthlySavings,
        total_annual_savings: result.totalAnnualSavings,
      })
      .select()
      .single()

    if (error) {
      console.error('[save-audit] Supabase insert failed:', error)
      return NextResponse.json(
        { error: 'Unable to save audit' },
        { status: 500 },
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('[save-audit] Request failed:', error)
    return NextResponse.json(
      { error: 'Unable to save audit' },
      { status: 500 },
    )
  }
}
