import { getCurrentUser, requireRole } from '@/lib/auth-utils'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AuditLogClient } from './audit-client'

export default async function AuditPage() {
  const ctx = await getCurrentUser()
  requireRole(ctx.role, 'OWNER', 'ADMIN')

  // Plan gate
  if (ctx.orgPlan !== 'ENTERPRISE') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Journal d&apos;Audit
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 py-20">
          <div className="flex size-16 items-center justify-center rounded-full bg-stone-100">
            <Lock className="size-8 text-stone-400" />
          </div>
          <h3 className="mt-6 font-heading text-lg font-medium text-stone-900">
            Journal d&apos;audit disponible avec le plan Entreprise
          </h3>
          <p className="mt-2 max-w-md text-center text-sm text-stone-500">
            Suivez toutes les actions effectuées par les membres de votre
            organisation avec le journal d&apos;audit détaillé.
          </p>
          <Button className="mt-6" render={<Link href="/admin/billing" />}>
            Passer au plan Entreprise
          </Button>
        </div>
      </div>
    )
  }

  return <AuditLogClient />
}
