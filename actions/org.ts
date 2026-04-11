'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod/v4'
import slugify from 'slugify'

const createOrgSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  industry: z.enum(['POWER_PLANT', 'SOLAR', 'WIND', 'HYDRO', 'MINING', 'CEMENT', 'OTHER']),
  country: z.string().min(2),
  timezone: z.string(),
})

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = createOrgSchema.safeParse({
    name: formData.get('name'),
    industry: formData.get('industry'),
    country: formData.get('country'),
    timezone: formData.get('timezone'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const slug = slugify(parsed.data.name, { lower: true, strict: true })

  // Create organization with 14-day Pro trial
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      plan: 'PRO',
      plan_status: 'trialing',
      max_users: 20,
      max_equipment: 100,
      max_storage_mb: 10240,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (orgError) return { error: { name: [orgError.message] } }

  // Create org_member with OWNER role
  await supabase.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'OWNER',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Owner',
    accepted_at: new Date().toISOString(),
  })

  redirect('/onboarding/equipment')
}

export async function getOrganization() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(*)')
    .eq('user_id', user.id)
    .single()

  return member?.organizations ?? null
}

export async function updateOrganization(data: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/onboarding')

  const { error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', member.org_id)

  return { error: error?.message }
}
