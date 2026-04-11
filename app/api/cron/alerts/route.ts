import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Verify cron secret (Vercel sends CRON_SECRET header)
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()

  // 1. Check for equipment with hours_counter approaching 250h intervals
  const { data: equipment } = await supabase
    .from('equipment')
    .select('id, org_id, code, designation, hours_counter')
    .gt('hours_counter', 0)

  let alertsCreated = 0

  for (const eq of equipment || []) {
    const hoursUntilNext250 = 250 - (eq.hours_counter % 250)
    if (hoursUntilNext250 <= 10) {
      // Within 10 hours of a 250h interval
      // Check if alert already exists for this cycle
      const cycleNumber = Math.ceil(eq.hours_counter / 250)
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('equipment_id', eq.id)
        .eq('type', 'HOURS_250')
        .gte(
          'sent_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ) // Last 7 days
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.from('alerts').insert({
          org_id: eq.org_id,
          type: 'HOURS_250',
          message: `${eq.code} — ${eq.designation}: compteur à ${Math.round(eq.hours_counter)}h, révision ${cycleNumber * 250}h imminente`,
          channels: ['push', 'email'],
          equipment_id: eq.id,
        })
        alertsCreated++
      }
    }
  }

  // 2. Check for preventive maintenance due
  const { data: preventiveDue } = await supabase
    .from('equipment')
    .select('id, org_id, code, designation, next_revision')
    .not('next_revision', 'is', null)

  for (const eq of preventiveDue || []) {
    const daysUntil = Math.ceil(
      (new Date(eq.next_revision).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )

    let alertType: string | null = null
    if (daysUntil <= 1) alertType = 'PREVENTIVE_J1'
    else if (daysUntil <= 3) alertType = 'PREVENTIVE_J3'
    else if (daysUntil <= 7) alertType = 'PREVENTIVE_J7'

    if (alertType) {
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('equipment_id', eq.id)
        .eq('type', alertType)
        .gte(
          'sent_at',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.from('alerts').insert({
          org_id: eq.org_id,
          type: alertType,
          message: `${eq.code} — ${eq.designation}: maintenance préventive dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`,
          channels: ['push', 'email'],
          equipment_id: eq.id,
        })
        alertsCreated++
      }
    }
  }

  // 3. Check for unassigned urgent OTs (older than 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { data: unassignedUrgent } = await supabase
    .from('work_orders')
    .select('id, org_id, code, equipment_id')
    .eq('status', 'NEW')
    .eq('priority', 'URGENT')
    .lt('created_at', twoHoursAgo)

  for (const wo of unassignedUrgent || []) {
    const { data: existing } = await supabase
      .from('alerts')
      .select('id')
      .eq('type', 'OT_UNASSIGNED')
      .gte(
        'sent_at',
        new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      )
      .limit(1)

    if (!existing || existing.length === 0) {
      await supabase.from('alerts').insert({
        org_id: wo.org_id,
        type: 'OT_UNASSIGNED',
        message: `OT urgent ${wo.code} non affecté depuis plus de 2 heures`,
        channels: ['push', 'email'],
        equipment_id: wo.equipment_id,
      })
      alertsCreated++
    }
  }

  return Response.json({
    success: true,
    alertsCreated,
    timestamp: new Date().toISOString(),
  })
}
