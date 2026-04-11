'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  // Parallel queries for performance
  const [
    { data: workOrders },
    { data: equipment },
    { data: members },
  ] = await Promise.all([
    supabase
      .from('work_orders')
      .select('id, code, status, priority, type, description, estimated_duration, actual_duration, equipment_id, technician_id, created_at, completed_at, started_at, equipment(code, designation)')
      .eq('org_id', member.org_id),
    supabase
      .from('equipment')
      .select('id, code, designation, status, criticality, hours_counter')
      .eq('org_id', member.org_id),
    supabase
      .from('org_members')
      .select('user_id, name, role')
      .eq('org_id', member.org_id)
      .in('role', ['OWNER', 'ADMIN', 'TECHNICIAN'])
      .eq('is_active', true),
  ])

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // KPIs
  const activeOTs = (workOrders || []).filter(wo => !['COMPLETED', 'CANCELLED'].includes(wo.status))
  const urgentOTs = activeOTs.filter(wo => wo.priority === 'URGENT')
  const completedThisMonth = (workOrders || []).filter(wo =>
    wo.status === 'COMPLETED' && wo.completed_at && new Date(wo.completed_at) >= monthStart
  )

  // MTTR (Mean Time To Repair) in hours
  const completedWithDuration = (workOrders || []).filter(wo =>
    wo.status === 'COMPLETED' && wo.actual_duration
  )
  const mttr = completedWithDuration.length > 0
    ? completedWithDuration.reduce((sum, wo) => sum + (wo.actual_duration || 0), 0) / completedWithDuration.length
    : 0

  // Equipment availability
  const totalEquipment = (equipment || []).length
  const operationalEquipment = (equipment || []).filter(eq => eq.status === 'OPERATIONAL').length
  const availability = totalEquipment > 0
    ? Math.round((operationalEquipment / totalEquipment) * 100)
    : 100

  // Team workload (active OTs per technician)
  const techWorkload = (members || [])
    .filter(m => ['TECHNICIAN', 'ADMIN', 'OWNER'].includes(m.role))
    .map(m => {
      const assigned = activeOTs.filter(wo => wo.technician_id === m.user_id)
      const totalHours = assigned.reduce((sum, wo) => sum + (wo.estimated_duration || 0), 0)
      return {
        name: m.name,
        role: m.role,
        activeOTs: assigned.length,
        totalHours,
        capacity: Math.min(Math.round((totalHours / 40) * 100), 100),
      }
    })

  // Recent OTs (last 7)
  const recentOTs = (workOrders || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7)
    .map(wo => ({
      id: wo.id,
      code: wo.code,
      status: wo.status,
      priority: wo.priority,
      type: wo.type,
      description: wo.description,
      created_at: wo.created_at,
      equipment_code: wo.equipment ? (wo.equipment as unknown as { code: string; designation: string }).code : null,
      equipment_designation: wo.equipment ? (wo.equipment as unknown as { code: string; designation: string }).designation : null,
    }))

  // Equipment status distribution
  const equipmentByStatus = {
    OPERATIONAL: (equipment || []).filter(e => e.status === 'OPERATIONAL').length,
    DEGRADED: (equipment || []).filter(e => e.status === 'DEGRADED').length,
    BROKEN: (equipment || []).filter(e => e.status === 'BROKEN').length,
    IN_REVISION: (equipment || []).filter(e => e.status === 'IN_REVISION').length,
    REVISION_DUE: (equipment || []).filter(e => e.status === 'REVISION_DUE').length,
  }

  // Equipment list for grid (code, designation, status)
  const equipmentGrid = (equipment || []).map(e => ({
    id: e.id,
    code: e.code,
    designation: e.designation,
    status: e.status,
  }))

  return {
    kpis: {
      activeOTs: activeOTs.length,
      urgentOTs: urgentOTs.length,
      completedThisMonth: completedThisMonth.length,
      mttr: Math.round(mttr * 10) / 10,
      availability,
      totalEquipment,
    },
    recentOTs,
    techWorkload,
    equipmentByStatus,
    equipmentGrid,
    urgentUnassigned: urgentOTs.filter(wo => !wo.technician_id).length,
  }
}
