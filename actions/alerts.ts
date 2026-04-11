'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAlerts(filters?: {
  type?: string
  status?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from('alerts')
    .select('*, equipment(code, designation)')
    .order('sent_at', { ascending: false })
    .limit(filters?.limit || 50)

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data } = await query
  return data || []
}

export async function getUnreadAlertCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'SENT')
  return count || 0
}

export async function acknowledgeAlert(alertId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alerts')
    .update({
      status: 'ACKNOWLEDGED',
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId)
  if (error) return { error: error.message }
  revalidatePath('/alertes')
  return { success: true }
}

export async function markAlertRead(alertId: string) {
  const supabase = await createClient()
  await supabase
    .from('alerts')
    .update({ status: 'READ', read_at: new Date().toISOString() })
    .eq('id', alertId)
    .eq('status', 'SENT')
}

export async function markAllRead() {
  const supabase = await createClient()
  await supabase
    .from('alerts')
    .update({ status: 'READ', read_at: new Date().toISOString() })
    .eq('status', 'SENT')
  revalidatePath('/alertes')
}

export async function getUrgentUnassignedOTs() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('work_orders')
    .select('code, equipment(code, designation)')
    .eq('status', 'NEW')
    .eq('priority', 'URGENT')
  return {
    count: data?.length || 0,
    equipmentNames: (data || [])
      .slice(0, 3)
      .map(
        (wo) =>
          (wo.equipment as unknown as { code: string; designation: string })
            ?.designation || wo.code
      ),
  }
}

export async function getAlertStats() {
  const supabase = await createClient()
  const { data } = await supabase.from('alerts').select('status, type, sent_at')
  const all = data || []
  const now = new Date()
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  )
  return {
    total: all.length,
    unread: all.filter((a) => a.status === 'SENT').length,
    acknowledged: all.filter((a) => a.status === 'ACKNOWLEDGED').length,
    thisWeek: all.filter((a) => new Date(a.sent_at) >= weekStart).length,
  }
}
