import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { DIDocument } from '@/lib/pdf-templates/di'
import { BTDocument } from '@/lib/pdf-templates/bt'
import { RSDocument } from '@/lib/pdf-templates/rs'
import { MonthlyReportDocument } from '@/lib/pdf-templates/monthly-report'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const { searchParams } = new URL(request.url)
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get org info
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, name, role, organizations(name, plan)')
    .eq('user_id', user.id)
    .single()
  if (!member) {
    return new Response('No organization', { status: 403 })
  }

  const orgName =
    (member.organizations as unknown as { name: string } | null)?.name ||
    'Atasku'

  let pdfBuffer: Buffer

  try {
    if (type === 'di' || type === 'bt' || type === 'rs') {
      const workOrderId = searchParams.get('workOrderId')
      if (!workOrderId) {
        return new Response('workOrderId required', { status: 400 })
      }

      // Fetch work order with equipment (extended fields for BT)
      const { data: wo } = await supabase
        .from('work_orders')
        .select(
          '*, equipment(code, designation, location, brand, model, status)'
        )
        .eq('id', workOrderId)
        .eq('org_id', member.org_id)
        .single()
      if (!wo) {
        return new Response('Work order not found', { status: 404 })
      }

      // Get technician name
      let techName = 'Non affecte'
      if (wo.technician_id) {
        const { data: tech } = await supabase
          .from('org_members')
          .select('name')
          .eq('user_id', wo.technician_id)
          .single()
        techName = tech?.name || 'Inconnu'
      }

      // Get creator name + role
      const { data: creator } = await supabase
        .from('org_members')
        .select('name, role')
        .eq('user_id', wo.created_by_id)
        .single()

      // Get interventions + part_usages for RS / BT
      const { data: interventions } = await supabase
        .from('interventions')
        .select('*, part_usages(*)')
        .eq('work_order_id', workOrderId)

      const docData = {
        wo,
        orgName,
        techName,
        creatorName: creator?.name || 'Inconnu',
        creatorRole: creator?.role || '',
        interventions: interventions || [],
      }

      if (type === 'di') {
        pdfBuffer = await renderToBuffer(<DIDocument {...docData} />)
      } else if (type === 'bt') {
        pdfBuffer = await renderToBuffer(<BTDocument {...docData} />)
      } else {
        pdfBuffer = await renderToBuffer(<RSDocument {...docData} />)
      }
    } else if (type === 'monthly') {
      const month = parseInt(
        searchParams.get('month') || String(new Date().getMonth() + 1)
      )
      const year = parseInt(
        searchParams.get('year') || String(new Date().getFullYear())
      )

      // Date range for the month
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

      const [{ data: wos }, { data: equip }, { data: mems }] =
        await Promise.all([
          supabase
            .from('work_orders')
            .select('*, equipment(code, designation)')
            .eq('org_id', member.org_id)
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString()),
          supabase
            .from('equipment')
            .select(
              'id, code, designation, total_main_cost, status, hours_counter'
            )
            .eq('org_id', member.org_id),
          supabase
            .from('org_members')
            .select('user_id, name, role')
            .eq('org_id', member.org_id)
            .in('role', ['OWNER', 'ADMIN', 'TECHNICIAN'])
            .eq('is_active', true),
        ])

      pdfBuffer = await renderToBuffer(
        <MonthlyReportDocument
          orgName={orgName}
          month={month}
          year={year}
          workOrders={wos || []}
          equipment={equip || []}
          members={mems || []}
        />
      )
    } else {
      return new Response('Invalid type. Use: di, bt, rs, monthly', {
        status: 400,
      })
    }

    const filename = `${type.toUpperCase()}-${new Date().toISOString().split('T')[0]}.pdf`
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PDF generation error:', err)
    return new Response(`PDF generation failed: ${message}`, { status: 500 })
  }
}
