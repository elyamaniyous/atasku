'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { generatePreventiveOT } from '@/actions/maintenance'
import { cn } from '@/lib/utils'

type ScheduleItem = {
  id: string
  code: string
  designation: string
  preventive_freq: string | null
  last_revision: string | null
  next_revision: string | null
  status: string
  hours_counter: number
  daysUntil: number | null
  scheduleStatus: 'overdue' | 'due_soon' | 'upcoming' | 'ok'
}

const SCHEDULE_BADGE: Record<string, { label: string; className: string }> = {
  overdue: {
    label: 'En retard',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  due_soon: {
    label: 'Bientôt',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  upcoming: {
    label: 'Sous 7j',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ok: {
    label: 'OK',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

export function PreventiveSchedule({ data }: { data: ScheduleItem[] }) {
  const router = useRouter()
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate(equipmentId: string) {
    setGeneratingId(equipmentId)
    startTransition(async () => {
      const result = await generatePreventiveOT(equipmentId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.workOrder) {
        toast.success(`OT ${result.workOrder.code} créé avec succès`)
        router.refresh()
      }
      setGeneratingId(null)
    })
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm text-stone-400">
          Aucun équipement avec fréquence préventive configurée.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Équipement
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Fréquence
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Dernière révision
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Prochaine révision
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Statut
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => {
            const badge = SCHEDULE_BADGE[item.scheduleStatus]
            const isGenerating = generatingId === item.id && isPending
            const canGenerate =
              item.scheduleStatus === 'overdue' || item.scheduleStatus === 'due_soon'

            return (
              <TableRow key={item.id} className="hover:bg-stone-50">
                <TableCell>
                  <div>
                    <span className="font-mono text-xs font-medium text-stone-500">
                      {item.code}
                    </span>
                    <p className="text-sm text-stone-700">{item.designation}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-stone-600">
                    {item.preventive_freq || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-stone-600">
                    {item.last_revision
                      ? format(new Date(item.last_revision), 'dd MMM yyyy', {
                          locale: fr,
                        })
                      : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-stone-600">
                    {item.next_revision
                      ? format(new Date(item.next_revision), 'dd MMM yyyy', {
                          locale: fr,
                        })
                      : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                </TableCell>
                <TableCell>
                  {canGenerate && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerate(item.id)}
                      disabled={isGenerating}
                      className="gap-1 text-xs"
                    >
                      {isGenerating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Plus className="size-3" />
                      )}
                      Générer OT
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
