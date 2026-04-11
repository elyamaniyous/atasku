import { getCurrentUser, requireRole } from '@/lib/auth-utils'
import { getMembers } from '@/actions/members'
import { getInvitations } from '@/actions/invitation'
import { PLANS } from '@/lib/stripe/plans'
import { MemberTable } from '@/components/admin/member-table'
import { InviteForm } from '@/components/admin/invite-form'
import { Users, Mail } from 'lucide-react'
import type { PlanKey } from '@/lib/stripe/plans'

export default async function TeamPage() {
  const ctx = await getCurrentUser()
  requireRole(ctx.role, 'OWNER', 'ADMIN')

  const [members, invitations] = await Promise.all([
    getMembers(),
    getInvitations(),
  ])

  const activeCount = members.filter((m) => m.is_active).length
  const plan = PLANS[ctx.orgPlan as PlanKey]
  const maxUsers = plan.maxUsers

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">
          Gestion d&apos;Équipe
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {activeCount} membre{activeCount !== 1 ? 's' : ''} actif
            {activeCount !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" />
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} en
            attente
          </span>
        </div>
      </div>

      {/* Members */}
      <section>
        <h2 className="mb-4 font-heading text-lg text-stone-900">Membres</h2>
        <MemberTable
          members={members}
          currentUserId={ctx.user.id}
          callerRole={ctx.role}
        />
      </section>

      {/* Invitations */}
      <section>
        <h2 className="mb-4 font-heading text-lg text-stone-900">
          Inviter un membre
        </h2>
        <InviteForm
          invitations={invitations}
          activeCount={activeCount}
          maxUsers={maxUsers}
          planName={plan.name}
        />
      </section>
    </div>
  )
}
