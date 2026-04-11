'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMembers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('org_members')
    .select('id, user_id, name, role, phone, avatar_url, is_active, accepted_at, created_at')
    .order('role')
    .order('name')
  return data || []
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Verify caller is OWNER
  const { data: caller } = await supabase
    .from('org_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (caller?.role !== 'OWNER') return { error: 'Seul le propriétaire peut changer les rôles' }

  // Prevent changing own role
  const { data: target } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('id', memberId)
    .single()
  if (target?.user_id === user.id) return { error: 'Vous ne pouvez pas modifier votre propre rôle' }

  const { error } = await supabase
    .from('org_members')
    .update({ role: newRole })
    .eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}

export async function deactivateMember(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: target } = await supabase
    .from('org_members')
    .select('user_id')
    .eq('id', memberId)
    .single()
  if (target?.user_id === user.id) return { error: 'Vous ne pouvez pas vous désactiver' }

  const { error } = await supabase
    .from('org_members')
    .update({ is_active: false })
    .eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}

export async function reactivateMember(memberId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('org_members')
    .update({ is_active: true })
    .eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}

export async function cancelInvitation(invitationId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}
