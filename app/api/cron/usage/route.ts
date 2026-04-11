import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all organizations
  const { data: orgs } = await supabase.from('organizations').select('id')

  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  for (const org of orgs || []) {
    const [{ count: userCount }, { count: equipCount }] = await Promise.all([
      supabase
        .from('org_members')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .eq('is_active', true),
      supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', org.id),
    ])

    // Delete existing records for this period, then insert fresh ones
    // (avoids needing a unique constraint on org_id,metric,period_start)
    for (const [metric, value] of [
      ['USERS', userCount || 0],
      ['EQUIPMENT', equipCount || 0],
    ] as const) {
      await supabase
        .from('usage_records')
        .delete()
        .eq('org_id', org.id)
        .eq('metric', metric)
        .eq('period_start', periodStart.toISOString())

      await supabase.from('usage_records').insert({
        org_id: org.id,
        metric,
        value,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
      })
    }
  }

  return Response.json({
    success: true,
    orgsProcessed: orgs?.length || 0,
    timestamp: new Date().toISOString(),
  })
}
