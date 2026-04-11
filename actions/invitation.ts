'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod/v4'
import crypto from 'crypto'
import { isPlanLimitReached } from '@/lib/stripe/plans'
import type { PlanKey } from '@/lib/stripe/plans'

const inviteSchema = z.object({
  email: z.email('Adresse email invalide'),
  role: z.enum(['ADMIN', 'TECHNICIAN', 'SITE_MANAGER', 'READONLY']),
})

export async function createInvitation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/onboarding')

  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Check plan user limit
  const { count: activeUsers } = await supabase
    .from('org_members')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)
    .eq('is_active', true)
  const { data: orgData } = await supabase
    .from('org_members')
    .select('organizations(plan)')
    .eq('user_id', user.id)
    .single()
  const plan = ((orgData?.organizations as unknown as { plan: string } | null)?.plan || 'FREE') as PlanKey
  if (isPlanLimitReached(plan, 'users', activeUsers || 0)) {
    return { error: { email: ['Limite du plan atteinte. Passez au Pro pour inviter plus d\'utilisateurs.'] } }
  }

  const token = crypto.randomUUID()

  const { error } = await supabase.from('invitations').insert({
    org_id: member.org_id,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    invited_by: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  })

  if (error) return { error: { email: [error.message] } }
  return { success: true }
}

export async function getInvitations() {
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
    .from('invitations')
    .select('id, email, role, created_at')
    .eq('org_id', member.org_id)
    .is('accepted_at', null)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getInvitationCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return 0

  const { count } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', member.org_id)
    .is('accepted_at', null)

  return count ?? 0
}
