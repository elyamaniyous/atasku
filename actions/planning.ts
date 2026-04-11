'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type CalendarEvent = {
  id: string
  title: string
  code: string
  equipmentName: string
  start: string
  duration: number
  type: string
  status: string
  priority: string
  technicianId: string | null
  technicianName: string | null
}

export type TeamMember = {
  userId: string
  name: string
  role: string
  scheduledHours: number
  capacity: number
}

export async function getCalendarEvents(
  startDate: string,
  endDate: string,
  technicianId?: string
): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  let query = supabase
    .from('work_orders')
    .select(
      'id, code, type, status, priority, estimated_duration, started_at, created_at, completed_at, technician_id, equipment(code, designation)'
    )
    .eq('org_id', member.org_id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('status', 'in', '("CANCELLED")')

  if (technicianId) query = query.eq('technician_id', technicianId)

  const { data: workOrders } = await query

  // Get technician names
  const techIds = [
    ...new Set(
      (workOrders || []).map((wo) => wo.technician_id).filter(Boolean)
    ),
  ]
  let techMap: Record<string, string> = {}
  if (techIds.length > 0) {
    const { data: members } = await supabase
      .from('org_members')
      .select('user_id, name')
      .in('user_id', techIds)
    techMap = Object.fromEntries(
      (members || []).map((m) => [m.user_id, m.name])
    )
  }

  return (workOrders || []).map((wo) => ({
    id: wo.id,
    title: `${wo.code} — ${(wo.equipment as any)?.designation || ''}`,
    code: wo.code,
    equipmentName: (wo.equipment as any)?.designation || '',
    start: wo.started_at || wo.created_at,
    duration: wo.estimated_duration || 2,
    type: wo.type,
    status: wo.status,
    priority: wo.priority,
    technicianId: wo.technician_id,
    technicianName: wo.technician_id
      ? techMap[wo.technician_id] || 'Inconnu'
      : null,
  }))
}

export async function getTeamAvailability(
  weekStart: string
): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  const weekEnd = new Date(
    new Date(weekStart).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString()

  const { data: members } = await supabase
    .from('org_members')
    .select('user_id, name, role')
    .eq('org_id', member.org_id)
    .in('role', ['OWNER', 'ADMIN', 'TECHNICIAN'])
    .eq('is_active', true)

  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('technician_id, estimated_duration')
    .eq('org_id', member.org_id)
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd)
    .not('status', 'in', '("COMPLETED","CANCELLED")')

  return (members || []).map((m) => {
    const assigned = (workOrders || []).filter(
      (wo) => wo.technician_id === m.user_id
    )
    const scheduledHours = assigned.reduce(
      (s, wo) => s + (wo.estimated_duration || 2),
      0
    )
    return {
      userId: m.user_id,
      name: m.name,
      role: m.role,
      scheduledHours,
      capacity: Math.min(Math.round((scheduledHours / 40) * 100), 100),
    }
  })
}
