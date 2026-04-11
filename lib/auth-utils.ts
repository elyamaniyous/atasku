import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { OrgRole } from '@/lib/types/database'

export type UserContext = {
  user: { id: string; email: string; name: string }
  orgId: string
  role: OrgRole
  orgPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  orgName: string
}

export async function getCurrentUser(): Promise<UserContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, name, organizations(name, plan)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!member) redirect('/onboarding')

  return {
    user: { id: user.id, email: user.email!, name: member.name },
    orgId: member.org_id,
    role: member.role as OrgRole,
    orgPlan: (member.organizations as unknown as { plan: string } | null)?.plan as
      | 'FREE'
      | 'PRO'
      | 'ENTERPRISE' ?? 'FREE',
    orgName: (member.organizations as unknown as { name: string } | null)?.name ?? '',
  }
}

export function hasPermission(role: OrgRole, permission: string): boolean {
  const PERMISSIONS: Record<OrgRole, string[]> = {
    OWNER: ['*'],
    ADMIN: [
      'dashboard',
      'ot:*',
      'equipment:*',
      'planning:read',
      'alert:*',
      'report:*',
      'team:*',
      'settings:*',
      'audit:read',
    ],
    TECHNICIAN: [
      'dashboard:limited',
      'ot:read',
      'ot:create:di',
      'ot:update:own',
      'equipment:read',
      'planning:read:own',
      'alert:acknowledge',
      'report:read:own',
    ],
    SITE_MANAGER: [
      'dashboard',
      'ot:read',
      'equipment:read',
      'planning:read',
      'alert:read',
      'report:read',
    ],
    READONLY: ['dashboard:read', 'equipment:read'],
  }
  const perms = PERMISSIONS[role]
  if (perms.includes('*')) return true
  return perms.some(
    (p) => p === permission || permission.startsWith(p.replace(':*', ':'))
  )
}

export function requireRole(role: OrgRole, ...allowed: OrgRole[]): void {
  if (!allowed.includes(role)) redirect('/')
}
