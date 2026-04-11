'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ---- Corrective Stats ----

export async function getCorrectiveStats() {
  const supabase = await createClient()
  const { data: wos } = await supabase
    .from('work_orders')
    .select('id, status, priority, actual_duration, completed_at, created_at')
    .eq('type', 'CORRECTIVE')

  const all = wos || []
  const active = all.filter(wo => !['COMPLETED', 'CANCELLED'].includes(wo.status))
  const completed = all.filter(wo => wo.status === 'COMPLETED')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const completedThisMonth = completed.filter(
    wo => wo.completed_at && new Date(wo.completed_at) >= monthStart
  )

  const avgResolution =
    completed.length > 0
      ? completed.reduce((s, wo) => s + (wo.actual_duration || 0), 0) / completed.length
      : 0

  return {
    total: all.length,
    active: active.length,
    completedThisMonth: completedThisMonth.length,
    avgResolutionHours: Math.round(avgResolution * 10) / 10,
    byPriority: {
      URGENT: all.filter(wo => wo.priority === 'URGENT').length,
      NORMAL: all.filter(wo => wo.priority === 'NORMAL').length,
      LOW: all.filter(wo => wo.priority === 'LOW').length,
    },
    byStatus: {
      NEW: all.filter(wo => wo.status === 'NEW').length,
      ASSIGNED: all.filter(wo => wo.status === 'ASSIGNED').length,
      IN_PROGRESS: all.filter(wo => wo.status === 'IN_PROGRESS').length,
      ON_HOLD: all.filter(wo => wo.status === 'ON_HOLD').length,
      COMPLETED: completed.length,
      CANCELLED: all.filter(wo => wo.status === 'CANCELLED').length,
    },
  }
}

// ---- Get Corrective Work Orders ----

export async function getCorrectiveOTs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('work_orders')
    .select('*, equipment(code, designation)')
    .eq('type', 'CORRECTIVE')
    .order('created_at', { ascending: false })

  if (!data) return []

  // Resolve technician names
  const techIds = [...new Set(data.filter(wo => wo.technician_id).map(wo => wo.technician_id!))]
  let techMap: Record<string, string> = {}

  if (techIds.length > 0) {
    const { data: techs } = await supabase
      .from('org_members')
      .select('user_id, name')
      .in('user_id', techIds)
    if (techs) {
      techMap = Object.fromEntries(techs.map(t => [t.user_id, t.name]))
    }
  }

  return data.map(wo => ({
    id: wo.id,
    code: wo.code,
    equipment_designation: (wo.equipment as { code: string; designation: string } | null)?.designation ?? null,
    equipment_code: (wo.equipment as { code: string; designation: string } | null)?.code ?? null,
    type: wo.type,
    priority: wo.priority,
    status: wo.status,
    technician_name: wo.technician_id ? techMap[wo.technician_id] ?? null : null,
    created_at: wo.created_at,
    estimated_duration: wo.estimated_duration,
  }))
}

// ---- Preventive Schedule ----

export async function getPreventiveSchedule() {
  const supabase = await createClient()
  const { data: equipment } = await supabase
    .from('equipment')
    .select('id, code, designation, preventive_freq, last_revision, next_revision, status, hours_counter')
    .not('preventive_freq', 'is', null)
    .order('next_revision', { ascending: true })

  const now = new Date()
  return (equipment || []).map(eq => {
    const nextRev = eq.next_revision ? new Date(eq.next_revision) : null
    const daysUntil = nextRev
      ? Math.ceil((nextRev.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null
    let scheduleStatus: 'overdue' | 'due_soon' | 'upcoming' | 'ok' = 'ok'
    if (daysUntil !== null) {
      if (daysUntil < 0) scheduleStatus = 'overdue'
      else if (daysUntil <= 3) scheduleStatus = 'due_soon'
      else if (daysUntil <= 7) scheduleStatus = 'upcoming'
    }
    return { ...eq, daysUntil, scheduleStatus }
  })
}

// ---- Generate Preventive OT ----

export async function generatePreventiveOT(equipmentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return { error: 'Pas de membre' }

  // Get equipment info
  const { data: equipment } = await supabase
    .from('equipment')
    .select('code, designation, preventive_freq')
    .eq('id', equipmentId)
    .single()
  if (!equipment) return { error: 'Équipement non trouvé' }

  // Auto-generate code
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)
    .ilike('code', `INT-${year}-%`)
  const seq = String((count || 0) + 1).padStart(3, '0')

  const { data: wo, error } = await supabase
    .from('work_orders')
    .insert({
      org_id: member.org_id,
      code: `INT-${year}-${seq}`,
      type: 'PREVENTIVE',
      priority: 'NORMAL',
      description: `Maintenance préventive ${equipment.preventive_freq} — ${equipment.designation} (${equipment.code})`,
      equipment_id: equipmentId,
      created_by_id: user.id,
      status: 'NEW',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Update equipment last_revision
  await supabase
    .from('equipment')
    .update({ last_revision: new Date().toISOString() })
    .eq('id', equipmentId)

  // Status history
  await supabase.from('ot_status_history').insert({
    org_id: member.org_id,
    work_order_id: wo.id,
    to_status: 'NEW',
    changed_by: user.id,
  })

  revalidatePath('/maintenance/preventive')
  return { success: true, workOrder: wo }
}

// ---- Get Preventive Work Orders ----

export async function getPreventiveOTs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('work_orders')
    .select('*, equipment(code, designation)')
    .eq('type', 'PREVENTIVE')
    .order('created_at', { ascending: false })

  if (!data) return []

  const techIds = [...new Set(data.filter(wo => wo.technician_id).map(wo => wo.technician_id!))]
  let techMap: Record<string, string> = {}

  if (techIds.length > 0) {
    const { data: techs } = await supabase
      .from('org_members')
      .select('user_id, name')
      .in('user_id', techIds)
    if (techs) {
      techMap = Object.fromEntries(techs.map(t => [t.user_id, t.name]))
    }
  }

  return data.map(wo => ({
    id: wo.id,
    code: wo.code,
    equipment_designation: (wo.equipment as { code: string; designation: string } | null)?.designation ?? null,
    equipment_code: (wo.equipment as { code: string; designation: string } | null)?.code ?? null,
    type: wo.type,
    priority: wo.priority,
    status: wo.status,
    technician_name: wo.technician_id ? techMap[wo.technician_id] ?? null : null,
    created_at: wo.created_at,
    estimated_duration: wo.estimated_duration,
  }))
}

// ---- Preventive Stats ----

export async function getPreventiveStats() {
  const supabase = await createClient()
  const { data: wos } = await supabase
    .from('work_orders')
    .select('status')
    .eq('type', 'PREVENTIVE')

  const all = wos || []
  const completed = all.filter(wo => wo.status === 'COMPLETED').length
  const total = all.length

  const { data: scheduleData } = await supabase
    .from('equipment')
    .select('next_revision')
    .not('preventive_freq', 'is', null)

  const now = new Date()
  const dueSoon = (scheduleData || []).filter(eq => {
    if (!eq.next_revision) return false
    const days = Math.ceil(
      (new Date(eq.next_revision).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return days <= 7 && days >= 0
  }).length

  const overdue = (scheduleData || []).filter(eq => {
    if (!eq.next_revision) return false
    return new Date(eq.next_revision) < now
  }).length

  return {
    executionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    dueSoon,
    overdue,
    total,
    completed,
  }
}

// ---- Maintenance History ----

export async function getMaintenanceHistory(equipmentId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('interventions')
    .select('*, equipment(code, designation), work_orders(code, type, priority), part_usages(*)')
    .order('started_at', { ascending: false })
    .limit(50)

  if (equipmentId) query = query.eq('equipment_id', equipmentId)

  const { data } = await query

  // Resolve technician names
  const techIds = [...new Set((data || []).map(i => i.technician_id))]
  let techMap: Record<string, string> = {}
  if (techIds.length > 0) {
    const { data: members } = await supabase
      .from('org_members')
      .select('user_id, name')
      .in('user_id', techIds)
    techMap = Object.fromEntries((members || []).map(m => [m.user_id, m.name]))
  }

  return (data || []).map(i => ({
    ...i,
    technician_name: techMap[i.technician_id] || 'Inconnu',
  }))
}

// ---- Calculate MTBF ----

export async function calculateMTBF(equipmentId: string) {
  const supabase = await createClient()

  const { data: equipment } = await supabase
    .from('equipment')
    .select('hours_counter, commission_date')
    .eq('id', equipmentId)
    .single()

  const { count: failureCount } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('equipment_id', equipmentId)
    .eq('type', 'CORRECTIVE')
    .eq('status', 'COMPLETED')

  if (!equipment || !failureCount || failureCount === 0) return null
  return Math.round((equipment.hours_counter / failureCount) * 10) / 10
}

// ---- Calculate MTTR ----

export async function calculateMTTR(equipmentId: string) {
  const supabase = await createClient()

  const { data: interventions } = await supabase
    .from('interventions')
    .select('duration')
    .eq('equipment_id', equipmentId)

  if (!interventions || interventions.length === 0) return null
  const totalDuration = interventions.reduce((s, i) => s + (i.duration || 0), 0)
  return Math.round((totalDuration / interventions.length) * 10) / 10
}

// ---- Equipment List (for filter) ----

export async function getMaintenanceEquipmentList() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('equipment')
    .select('id, code, designation')
    .order('code')
  return data || []
}
