'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod/v4'
import type { OTStatus, WorkOrder } from '@/lib/types/database'

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
}

export type KanbanWorkOrder = WorkOrder & {
  equipment: { code: string; designation: string } | null
  technician_name: string | null
  technician_avatar: string | null
}

type KanbanData = Record<OTStatus, KanbanWorkOrder[]>

// Get work orders grouped by status for Kanban
export async function getKanbanData(): Promise<KanbanData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  // Fetch work orders with equipment join
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select('*, equipment(code, designation)')
    .eq('org_id', member.org_id)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !workOrders) {
    return { NEW: [], ASSIGNED: [], IN_PROGRESS: [], ON_HOLD: [], COMPLETED: [], CANCELLED: [] }
  }

  // Fetch technician names from org_members for all assigned work orders
  const techIds = [...new Set(workOrders.filter(wo => wo.technician_id).map(wo => wo.technician_id!))]
  let techMap: Record<string, { name: string; avatar_url: string | null }> = {}

  if (techIds.length > 0) {
    const { data: techs } = await supabase
      .from('org_members')
      .select('user_id, name, avatar_url')
      .in('user_id', techIds)

    if (techs) {
      techMap = Object.fromEntries(techs.map(t => [t.user_id, { name: t.name, avatar_url: t.avatar_url }]))
    }
  }

  const grouped: KanbanData = {
    NEW: [], ASSIGNED: [], IN_PROGRESS: [], ON_HOLD: [], COMPLETED: [], CANCELLED: [],
  }

  for (const wo of workOrders) {
    const tech = wo.technician_id ? techMap[wo.technician_id] : null
    const kanbanWo: KanbanWorkOrder = {
      ...wo,
      equipment: wo.equipment as { code: string; designation: string } | null,
      technician_name: tech?.name ?? null,
      technician_avatar: tech?.avatar_url ?? null,
    }
    grouped[wo.status as OTStatus]?.push(kanbanWo)
  }

  return grouped
}

// Get work orders with filters (for list view)
export async function getWorkOrders(filters?: {
  status?: string
  priority?: string
  technician_id?: string
  equipment_id?: string
  type?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return []

  let query = supabase
    .from('work_orders')
    .select('*, equipment(code, designation)')
    .eq('org_id', member.org_id)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.technician_id) query = query.eq('technician_id', filters.technician_id)
  if (filters?.equipment_id) query = query.eq('equipment_id', filters.equipment_id)

  const { data } = await query
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
    ...wo,
    equipment: wo.equipment as { code: string; designation: string } | null,
    technician_name: wo.technician_id ? techMap[wo.technician_id] ?? null : null,
  }))
}

// Get single work order with all relations
export async function getWorkOrder(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('work_orders')
    .select('*, equipment(code, designation, status), interventions(*), attachments(*)')
    .eq('id', id)
    .single()

  if (!data) return null

  // Fetch status history with member names
  const { data: history } = await supabase
    .from('ot_status_history')
    .select('*')
    .eq('work_order_id', id)
    .order('changed_at', { ascending: false })

  return { ...data, status_history: history || [] }
}

// Create work order with auto-numbering
const createOTSchema = z.object({
  equipment_id: z.uuid(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  priority: z.enum(['URGENT', 'NORMAL', 'LOW']),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
  cause: z.string().optional(),
  estimated_duration: z.coerce.number().positive().optional(),
  technician_id: z.uuid().optional(),
})

export async function createWorkOrder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const raw = Object.fromEntries(formData)
  // Clean empty strings to undefined for optional fields
  if (raw.cause === '') delete raw.cause
  if (raw.estimated_duration === '') delete raw.estimated_duration
  if (raw.technician_id === '') delete raw.technician_id

  const parsed = createOTSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Get org_id from member
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  // Auto-generate code: INT-{YEAR}-{SEQ}
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('work_orders')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)
    .ilike('code', `INT-${year}-%`)
  const seq = String((count || 0) + 1).padStart(3, '0')
  const code = `INT-${year}-${seq}`

  const status: OTStatus = parsed.data.technician_id ? 'ASSIGNED' : 'NEW'

  const { data: wo, error } = await supabase
    .from('work_orders')
    .insert({
      org_id: member.org_id,
      code,
      ...parsed.data,
      status,
      created_by_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: { description: [error.message] } }

  // Create initial status history
  await supabase.from('ot_status_history').insert({
    org_id: member.org_id,
    work_order_id: wo.id,
    from_status: null,
    to_status: status,
    changed_by: user.id,
  })

  revalidatePath('/ordres')
  return { success: true, workOrder: wo }
}

// Update work order status (for Kanban drag-and-drop)
export async function updateWorkOrderStatus(
  workOrderId: string,
  newStatus: string,
  comment?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Get current status
  const { data: wo } = await supabase
    .from('work_orders')
    .select('status, org_id')
    .eq('id', workOrderId)
    .single()

  if (!wo) return { error: 'Ordre non trouvé' }

  // Validate transition
  const allowed = VALID_TRANSITIONS[wo.status] || []
  if (!allowed.includes(newStatus)) {
    return { error: `Transition ${wo.status} → ${newStatus} non autorisée` }
  }

  // Update status + timestamps
  const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
  if (newStatus === 'IN_PROGRESS') updates.started_at = new Date().toISOString()
  if (newStatus === 'COMPLETED') updates.completed_at = new Date().toISOString()

  const { error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', workOrderId)

  if (error) return { error: error.message }

  // Add status history
  await supabase.from('ot_status_history').insert({
    org_id: wo.org_id,
    work_order_id: workOrderId,
    from_status: wo.status,
    to_status: newStatus,
    comment,
    changed_by: user.id,
  })

  revalidatePath('/ordres')
  return { success: true }
}

// Assign technician
export async function assignTechnician(workOrderId: string, technicianId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('work_orders')
    .update({ technician_id: technicianId, status: 'ASSIGNED', updated_at: new Date().toISOString() })
    .eq('id', workOrderId)
    .eq('status', 'NEW') // Only assign if NEW

  if (error) return { error: error.message }
  revalidatePath('/ordres')
  return { success: true }
}

// Get OT stats
export async function getWorkOrderStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { total: 0, active: 0, urgent: 0, completedThisMonth: 0 }

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return { total: 0, active: 0, urgent: 0, completedThisMonth: 0 }

  const { data } = await supabase
    .from('work_orders')
    .select('status, priority, completed_at')
    .eq('org_id', member.org_id)

  if (!data) return { total: 0, active: 0, urgent: 0, completedThisMonth: 0 }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    total: data.length,
    active: data.filter(wo => !['COMPLETED', 'CANCELLED'].includes(wo.status)).length,
    urgent: data.filter(wo => wo.priority === 'URGENT' && !['COMPLETED', 'CANCELLED'].includes(wo.status)).length,
    completedThisMonth: data.filter(wo =>
      wo.status === 'COMPLETED' && wo.completed_at && new Date(wo.completed_at) >= monthStart
    ).length,
  }
}

// Get technicians for assignment dropdown
export async function getTechnicians() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return []

  const { data } = await supabase
    .from('org_members')
    .select('user_id, name, role, avatar_url')
    .eq('org_id', member.org_id)
    .in('role', ['OWNER', 'ADMIN', 'TECHNICIAN'])
    .eq('is_active', true)
  return data || []
}
