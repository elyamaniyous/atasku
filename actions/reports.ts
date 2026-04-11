'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type Period = 'week' | 'month' | 'quarter' | 'year'

function getPeriodStart(period: Period): Date {
  const now = new Date()
  switch (period) {
    case 'week':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'quarter':
      return new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3,
        1
      )
    case 'year':
      return new Date(now.getFullYear(), 0, 1)
  }
}

export async function getReportData(period: Period = 'month') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  const periodStart = getPeriodStart(period)

  // Period-filtered work orders for KPIs
  const [{ data: workOrders }, { data: equipment }] = await Promise.all([
    supabase
      .from('work_orders')
      .select(
        'id, type, status, created_at, actual_duration, parts_cost, labor_cost, equipment_id, completed_at'
      )
      .eq('org_id', member.org_id)
      .gte('created_at', periodStart.toISOString()),
    supabase
      .from('equipment')
      .select('id, code, designation, status, hours_counter, total_main_cost')
      .eq('org_id', member.org_id),
  ])

  // KPIs from period-filtered data
  const completed = (workOrders || []).filter(
    (wo) => wo.status === 'COMPLETED'
  )
  const corrective = (workOrders || []).filter(
    (wo) => wo.type === 'CORRECTIVE'
  )
  const preventive = (workOrders || []).filter(
    (wo) => wo.type === 'PREVENTIVE'
  )

  const mttr =
    completed.length > 0
      ? completed.reduce((s, wo) => s + (wo.actual_duration || 0), 0) /
        completed.length
      : 0

  const totalEquip = (equipment || []).length
  const operational = (equipment || []).filter(
    (e) => e.status === 'OPERATIONAL'
  ).length
  const availability =
    totalEquip > 0 ? Math.round((operational / totalEquip) * 100) : 100

  const preventiveRate =
    corrective.length + preventive.length > 0
      ? Math.round(
          (preventive.filter((wo) => wo.status === 'COMPLETED').length /
            (preventive.length || 1)) *
            100
        )
      : 0

  // Monthly breakdown for charts (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const monthName = d.toLocaleDateString('fr-FR', { month: 'short' })
    return { month: monthName, monthStart, monthEnd }
  })

  // All work orders for charts (not period-filtered)
  const { data: allWOs } = await supabase
    .from('work_orders')
    .select(
      'type, status, created_at, actual_duration, parts_cost, labor_cost, equipment_id'
    )
    .eq('org_id', member.org_id)

  const correctiveVsPreventive = monthlyData.map(
    ({ month, monthStart, monthEnd }) => {
      const inMonth = (allWOs || []).filter((wo) => {
        const d = new Date(wo.created_at)
        return d >= monthStart && d <= monthEnd
      })
      return {
        month,
        corrective: inMonth.filter((wo) => wo.type === 'CORRECTIVE').length,
        preventive: inMonth.filter((wo) => wo.type === 'PREVENTIVE').length,
      }
    }
  )

  const mttrTrend = monthlyData.map(({ month, monthStart, monthEnd }) => {
    const completedInMonth = (allWOs || []).filter((wo) => {
      const d = new Date(wo.created_at)
      return (
        d >= monthStart &&
        d <= monthEnd &&
        wo.status === 'COMPLETED' &&
        wo.actual_duration
      )
    })
    const avg =
      completedInMonth.length > 0
        ? completedInMonth.reduce((s, wo) => s + wo.actual_duration, 0) /
          completedInMonth.length
        : 0
    return { month, mttr: Math.round(avg * 10) / 10 }
  })

  // Equipment availability (top 10 by maintenance cost)
  const equipAvailability = (equipment || [])
    .sort((a, b) => (b.total_main_cost || 0) - (a.total_main_cost || 0))
    .slice(0, 10)
    .map((eq) => ({
      name: eq.code,
      designation: eq.designation,
      availability:
        eq.status === 'OPERATIONAL'
          ? 95
          : eq.status === 'DEGRADED'
            ? 75
            : eq.status === 'BROKEN'
              ? 0
              : 85,
      cost: eq.total_main_cost || 0,
    }))

  // Cost distribution (top 5 equipment by total cost)
  const costDistribution = (equipment || [])
    .filter((eq) => (eq.total_main_cost || 0) > 0)
    .sort((a, b) => (b.total_main_cost || 0) - (a.total_main_cost || 0))
    .slice(0, 5)
    .map((eq) => ({ name: eq.code, value: eq.total_main_cost || 0 }))

  return {
    kpis: {
      mttr: Math.round(mttr * 10) / 10,
      availability,
      preventiveRate,
      totalOTs: (workOrders || []).length,
      completedOTs: completed.length,
      correctiveCount: corrective.length,
      preventiveCount: preventive.length,
    },
    correctiveVsPreventive,
    mttrTrend,
    equipAvailability,
    costDistribution,
  }
}
