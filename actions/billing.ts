'use server'

import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Create a Stripe Checkout session to upgrade to Pro.
 * Only the organization OWNER can initiate this.
 */
export async function createCheckoutSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select(
      'org_id, role, organizations(id, name, stripe_customer_id, plan)'
    )
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'OWNER') {
    return { error: 'Seul le propri\u00e9taire peut g\u00e9rer la facturation' }
  }

  const org = member.organizations as unknown as {
    id: string
    name: string
    stripe_customer_id: string | null
    plan: string
  }

  // Create Stripe customer if not exists
  let customerId = org.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: org.name,
      metadata: { org_id: org.id },
    })
    customerId = customer.id
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org.id)
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID
  if (!priceId || priceId === 'price_placeholder') {
    return { error: 'La configuration Stripe n\'est pas encore termin\u00e9e.' }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?canceled=true`,
    metadata: { org_id: org.id },
    subscription_data: {
      metadata: { org_id: org.id },
    },
  })

  return { url: session.url }
}

/**
 * Create a Stripe Customer Portal session so the OWNER can manage
 * their subscription (cancel, update payment, view invoices).
 */
export async function createPortalSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(stripe_customer_id)')
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'OWNER') {
    return { error: 'Seul le propri\u00e9taire peut g\u00e9rer la facturation' }
  }

  const customerId = (
    member.organizations as unknown as { stripe_customer_id: string | null }
  )?.stripe_customer_id
  if (!customerId) return { error: 'Aucun compte de facturation trouv\u00e9' }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
  })

  return { url: session.url }
}

/**
 * Fetch current billing info: plan, status, usage, trial days left.
 */
export async function getBillingInfo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select(
      'org_id, organizations(plan, plan_status, trial_ends_at, max_users, max_equipment, max_storage_mb, stripe_subscription_id)'
    )
    .eq('user_id', user.id)
    .single()

  if (!member) redirect('/onboarding')

  const org = member.organizations as unknown as {
    plan: string
    plan_status: string
    trial_ends_at: string | null
    max_users: number
    max_equipment: number
    max_storage_mb: number
    stripe_subscription_id: string | null
  }

  // Get current usage counts
  const [{ count: userCount }, { count: equipmentCount }] = await Promise.all([
    supabase
      .from('org_members')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', member.org_id)
      .eq('is_active', true),
    supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', member.org_id),
  ])

  // Calculate trial days remaining
  const trialDaysLeft = org.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(org.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  return {
    plan: org.plan as 'FREE' | 'PRO' | 'ENTERPRISE',
    planStatus: org.plan_status as
      | 'active'
      | 'past_due'
      | 'canceled'
      | 'trialing',
    trialDaysLeft,
    usage: {
      users: { current: userCount || 0, max: org.max_users },
      equipment: { current: equipmentCount || 0, max: org.max_equipment },
      storage: { current: 0, max: org.max_storage_mb }, // TODO: calculate actual storage usage
    },
    hasSubscription: !!org.stripe_subscription_id,
  }
}
