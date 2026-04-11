import { getCurrentUser, requireRole } from '@/lib/auth-utils'
import { getBillingInfo } from '@/actions/billing'
import { PLANS } from '@/lib/stripe/plans'
import { BillingClient } from './billing-client'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const ctx = await getCurrentUser()
  requireRole(ctx.role, 'OWNER')

  const billing = await getBillingInfo()
  const params = await searchParams

  return (
    <BillingClient
      billing={billing}
      plans={PLANS}
      success={params.success === 'true'}
      canceled={params.canceled === 'true'}
    />
  )
}
