'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight, ClipboardList } from 'lucide-react'
import { OTStatusBadge, PriorityBadge, TypeBadge } from '@/components/ot/ot-badges'
import type { OTStatus, Priority, WorkOrderType } from '@/lib/types/database'

type RecentOT = {
  id: string
  code: string
  status: string
  priority: string
  type: string
  description: string
  created_at: string
  equipment_code: string | null
  equipment_designation: string | null
}

export function RecentOTTable({ orders }: { orders: RecentOT[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-heading text-lg text-stone-900">Ordres recents</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-100">
            <ClipboardList className="size-6 text-stone-400" />
          </div>
          <p className="mt-3 text-sm text-stone-500">Aucun ordre de travail</p>
          <p className="text-xs text-stone-400">Les ordres apparaitront ici une fois crees.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-heading text-lg text-stone-900">Ordres recents</h2>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-xs text-stone-500">
              <th className="pb-2 pr-3 font-medium">Code</th>
              <th className="pb-2 pr-3 font-medium">Equipement</th>
              <th className="pb-2 pr-3 font-medium">Type</th>
              <th className="pb-2 pr-3 font-medium">Priorite</th>
              <th className="pb-2 pr-3 font-medium">Statut</th>
              <th className="pb-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {orders.map((ot) => (
              <tr key={ot.id} className="group hover:bg-stone-50/50">
                <td className="py-2.5 pr-3">
                  <Link
                    href={`/ordres/${ot.id}`}
                    className="font-mono text-xs font-medium text-stone-700 hover:text-blue-600 hover:underline"
                  >
                    {ot.code}
                  </Link>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-xs text-stone-600 truncate max-w-[160px] block">
                    {ot.equipment_designation || ot.equipment_code || <span className="text-stone-400">&mdash;</span>}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <TypeBadge type={ot.type as WorkOrderType} />
                </td>
                <td className="py-2.5 pr-3">
                  <PriorityBadge priority={ot.priority as Priority} />
                </td>
                <td className="py-2.5 pr-3">
                  <OTStatusBadge status={ot.status as OTStatus} />
                </td>
                <td className="py-2.5 text-xs text-stone-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(ot.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-t border-stone-100 pt-3">
        <Link
          href="/ordres"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Voir tous les ordres
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
