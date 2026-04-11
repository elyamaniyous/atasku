'use client'

import Link from 'next/link'
import { Cog } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

type EquipmentByStatus = {
  OPERATIONAL: number
  DEGRADED: number
  BROKEN: number
  IN_REVISION: number
  REVISION_DUE: number
}

type EquipmentItem = {
  id: string
  code: string
  designation: string
  status: string
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; circle: string }> = {
  OPERATIONAL: {
    label: 'Operationnel',
    dot: 'bg-emerald-500',
    circle: 'bg-emerald-400',
  },
  DEGRADED: {
    label: 'Degrade',
    dot: 'bg-orange-500',
    circle: 'bg-orange-400',
  },
  BROKEN: {
    label: 'En panne',
    dot: 'bg-red-500',
    circle: 'bg-red-400',
  },
  IN_REVISION: {
    label: 'En revision',
    dot: 'bg-blue-500',
    circle: 'bg-blue-400',
  },
  REVISION_DUE: {
    label: 'Revision due',
    dot: 'bg-stone-400',
    circle: 'bg-stone-300',
  },
}

export function EquipmentStatusGrid({
  byStatus,
  equipmentGrid,
}: {
  byStatus: EquipmentByStatus
  equipmentGrid: EquipmentItem[]
}) {
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-stone-900">Parc d&apos;equipements</h2>
        <Link
          href="/actifs"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Voir tout
        </Link>
      </div>

      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-100">
            <Cog className="size-6 text-stone-400" />
          </div>
          <p className="mt-3 text-sm text-stone-500">Aucun equipement</p>
          <p className="text-xs text-stone-400">Ajoutez vos equipements pour les suivre ici.</p>
        </div>
      ) : (
        <>
          {/* Status summary row */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = byStatus[key as keyof EquipmentByStatus] || 0
              if (count === 0) return null
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', config.dot)} />
                  <span className="text-xs text-stone-600">
                    {config.label}: <span className="font-mono font-semibold">{count}</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Visual grid */}
          <TooltipProvider>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {equipmentGrid.map((eq) => {
                const config = STATUS_CONFIG[eq.status] || STATUS_CONFIG.OPERATIONAL
                return (
                  <Tooltip key={eq.id}>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/actifs/${eq.id}`}
                          className={cn(
                            'size-4 rounded-full transition-transform hover:scale-125',
                            config.circle
                          )}
                        />
                      }
                    />
                    <TooltipContent>
                      <span className="font-mono text-[10px]">{eq.code}</span>
                      <span className="mx-1">-</span>
                      <span className="text-[10px]">{eq.designation}</span>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}
