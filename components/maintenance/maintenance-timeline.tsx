'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type PartUsage = {
  id: string
  description: string
  quantity: number
  unit_cost: number
}

type TimelineEntry = {
  id: string
  actions: string
  root_cause: string | null
  duration: number
  parts_cost: number
  labor_cost: number
  started_at: string
  technician_name: string
  equipment: { code: string; designation: string } | null
  work_orders: { code: string; type: string; priority: string } | null
  part_usages: PartUsage[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export function MaintenanceTimeline({ data }: { data: TimelineEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm text-stone-400">
          Aucun historique de maintenance
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative space-y-0"
    >
      {/* Vertical connector line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-stone-200" />

      {data.map((entry, index) => {
        const isCorrectif = entry.work_orders?.type === 'CORRECTIVE'
        const dotColor = isCorrectif ? 'bg-red-500' : 'bg-blue-500'
        const totalCost = entry.parts_cost + entry.labor_cost
        const parts = entry.part_usages || []

        return (
          <motion.div
            key={entry.id}
            variants={item}
            className={cn(
              'relative flex gap-4 py-3 pl-0',
              index % 2 === 0 ? 'bg-transparent' : 'bg-stone-50/50'
            )}
          >
            {/* Dot */}
            <div className="relative z-10 flex size-10 shrink-0 items-center justify-center">
              <div
                className={cn(
                  'size-3 rounded-full ring-4 ring-white',
                  dotColor
                )}
              />
            </div>

            {/* Card */}
            <div className="flex-1 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              {/* Header row */}
              <div className="flex flex-wrap items-center gap-2">
                {entry.work_orders && (
                  <Link
                    href={`/ordres/${entry.id}`}
                    className="font-mono text-xs font-semibold text-stone-700 hover:text-red-600 hover:underline"
                  >
                    {entry.work_orders.code}
                  </Link>
                )}
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                    isCorrectif
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {isCorrectif ? 'Correctif' : 'Préventif'}
                </span>
                <span className="font-mono text-[11px] text-stone-400">
                  {format(new Date(entry.started_at), 'dd MMM yyyy HH:mm', {
                    locale: fr,
                  })}
                </span>
              </div>

              {/* Equipment */}
              {entry.equipment && (
                <p className="mt-1 text-xs text-stone-500">
                  <span className="font-mono">{entry.equipment.code}</span>
                  {' — '}
                  {entry.equipment.designation}
                </p>
              )}

              {/* Actions */}
              <p className="mt-2 text-sm text-stone-700">
                <span className="font-semibold text-stone-500">Actions : </span>
                {entry.actions}
              </p>

              {/* Root cause */}
              {entry.root_cause && (
                <p className="mt-1 text-sm text-stone-600">
                  <span className="font-semibold text-stone-500">Cause : </span>
                  {entry.root_cause}
                </p>
              )}

              {/* Meta badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  <span className="font-mono font-semibold">{entry.duration}h</span>
                  <span className="ml-1 text-stone-400">durée</span>
                </span>
                <span className="text-xs text-stone-500">
                  {entry.technician_name}
                </span>
              </div>

              {/* Parts used */}
              {parts.length > 0 && (
                <div className="mt-3 rounded-md border border-stone-100 bg-stone-50 p-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Pièces utilisées
                  </p>
                  <div className="space-y-0.5">
                    {parts.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs text-stone-600"
                      >
                        <span>{p.description}</span>
                        <span className="font-mono">
                          {p.quantity} x {p.unit_cost.toLocaleString('fr-FR')} DH
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total cost */}
              {totalCost > 0 && (
                <p className="mt-2 text-right text-xs font-semibold text-stone-700">
                  Total : {totalCost.toLocaleString('fr-FR')} DH
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
