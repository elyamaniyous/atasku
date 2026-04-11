import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  const supabase = createAdminClient() // Service role — bypasses RLS

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const orgId = session.metadata?.org_id
      if (orgId && session.subscription) {
        await supabase
          .from('organizations')
          .update({
            plan: 'PRO',
            plan_status: 'active',
            stripe_subscription_id: session.subscription as string,
            max_users: 20,
            max_equipment: 100,
            max_storage_mb: 10240,
            trial_ends_at: null,
          })
          .eq('id', orgId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const orgId = subscription.metadata?.org_id
      if (orgId) {
        const status = subscription.status
        await supabase
          .from('organizations')
          .update({
            plan_status:
              status === 'active'
                ? 'active'
                : status === 'past_due'
                  ? 'past_due'
                  : 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      // Downgrade to FREE
      await supabase
        .from('organizations')
        .update({
          plan: 'FREE',
          plan_status: 'active',
          stripe_subscription_id: null,
          max_users: 3,
          max_equipment: 10,
          max_storage_mb: 500,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : null
      if (subscriptionId) {
        await supabase
          .from('organizations')
          .update({
            plan_status: 'past_due',
          })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }
  }

  return new Response('OK', { status: 200 })
}
