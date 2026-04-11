'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAuditLogs(filters?: {
  action?: string
  entity_type?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()
  const pageSize = filters?.limit || 50
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(pageSize)

  if (filters?.action) query = query.eq('action', filters.action)
  if (filters?.entity_type) query = query.eq('entity_type', filters.entity_type)
  if (filters?.offset) query = query.range(filters.offset, filters.offset + pageSize - 1)

  const { data } = await query

  // Get user names for the logs
  const userIds = [...new Set((data || []).map((l) => l.user_id).filter(Boolean))]
  let userMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: members } = await supabase
      .from('org_members')
      .select('user_id, name')
      .in('user_id', userIds)
    userMap = Object.fromEntries(
      (members || []).map((m) => [m.user_id, m.name])
    )
  }

  return (data || []).map((log) => ({
    ...log,
    user_name: log.user_id ? userMap[log.user_id] || 'Inconnu' : 'Système',
  }))
}

export async function createAuditLog(data: {
  action: string
  entity_type: string
  entity_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user?.id || '')
    .single()

  await supabase.from('audit_logs').insert({
    org_id: member?.org_id,
    user_id: user?.id,
    ...data,
  })
}
