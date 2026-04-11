'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OTStatus, OTStatusHistory } from '@/lib/types/database'

const NORMAL_FLOW: OTStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']
const STATUS_LABELS: Record<OTStatus, string> = {
  NEW: 'Nouveau',
  ASSIGNED: 'Affecté',
  IN_PROGRESS: 'En cours',
  ON_HOLD: 'En attente',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
}

type Props = {
  currentStatus: OTStatus
  statusHistory: OTStatusHistory[]
}

export function OTStatusTimeline({ currentStatus, statusHistory }: Props) {
  // Build a map of status → earliest timestamp
  const statusTimestamps: Partial<Record<OTStatus, string>> = {}
  // Sort history ascending by changed_at
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  )
  for (const entry of sortedHistory) {
    if (!statusTimestamps[entry.to_status as OTStatus]) {
      statusTimestamps[entry.to_status as OTStatus] = entry.changed_at
    }
  }

  const isCancelled = currentStatus === 'CANCELLED'
  const wasOnHold = statusTimestamps['ON_HOLD'] != null

  // Determine steps to display
  let steps: OTStatus[] = [...NORMAL_FLOW]
  if (wasOnHold) {
    // Insert ON_HOLD between IN_PROGRESS and COMPLETED
    const idx = steps.indexOf('IN_PROGRESS')
    steps.splice(idx + 1, 0, 'ON_HOLD')
  }

  // Determine the index of the current status in the flow
  const currentIdx = isCancelled
    ? // For cancelled, find the last status before CANCELLED
      (() => {
        const cancelEntry = sortedHistory.findLast(e => e.to_status === 'CANCELLED')
        const fromStatus = cancelEntry?.from_status as OTStatus | null
        if (fromStatus && steps.includes(fromStatus)) return steps.indexOf(fromStatus)
        return 0
      })()
    : steps.indexOf(currentStatus)

  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-start gap-0">
        {steps.map((step, idx) => {
          const timestamp = statusTimestamps[step]
          const isPast = idx < currentIdx
          const isCurrent = idx === currentIdx && !isCancelled
          const isCancelledHere = isCancelled && idx === currentIdx
          const isFuture = idx > currentIdx

          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              {/* Connector + Circle row */}
              <div className="flex w-full items-center">
                {/* Left line */}
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    idx === 0 ? 'bg-transparent' : isPast || isCurrent ? 'bg-emerald-400' : 'bg-stone-200'
                  )}
                />
                {/* Circle */}
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isPast && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-blue-500 bg-blue-500 text-white',
                    isCancelledHere && 'border-red-500 bg-red-500 text-white',
                    isFuture && 'border-stone-300 bg-white text-stone-400'
                  )}
                >
                  {isPast ? (
                    <Check className="size-4" />
                  ) : isCancelledHere ? (
                    <X className="size-4" />
                  ) : isCurrent ? (
                    <span className="size-2.5 rounded-full bg-white" />
                  ) : (
                    <span className="size-2 rounded-full bg-stone-300" />
                  )}
                </div>
                {/* Right line */}
                <div
                  className={cn(
                    'h-0.5 flex-1',
                    idx === steps.length - 1 ? 'bg-transparent' : isPast ? 'bg-emerald-400' : 'bg-stone-200'
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-center text-xs font-medium',
                  (isPast || isCurrent) && 'text-stone-700',
                  isCancelledHere && 'text-red-600',
                  isFuture && 'text-stone-400'
                )}
              >
                {isCancelledHere ? 'Annulé' : STATUS_LABELS[step]}
              </span>

              {/* Timestamp */}
              {timestamp && (
                <span className="mt-0.5 text-center text-[10px] text-stone-400">
                  {format(new Date(timestamp), 'dd/MM HH:mm', { locale: fr })}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex sm:hidden flex-col gap-0">
        {steps.map((step, idx) => {
          const timestamp = statusTimestamps[step]
          const isPast = idx < currentIdx
          const isCurrent = idx === currentIdx && !isCancelled
          const isCancelledHere = isCancelled && idx === currentIdx
          const isFuture = idx > currentIdx

          return (
            <div key={step} className="flex items-start gap-3">
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center">
                {idx > 0 && (
                  <div
                    className={cn(
                      'w-0.5 h-6',
                      isPast || isCurrent ? 'bg-emerald-400' : 'bg-stone-200'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                    isPast && 'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent && 'border-blue-500 bg-blue-500 text-white',
                    isCancelledHere && 'border-red-500 bg-red-500 text-white',
                    isFuture && 'border-stone-300 bg-white text-stone-400'
                  )}
                >
                  {isPast ? (
                    <Check className="size-3.5" />
                  ) : isCancelledHere ? (
                    <X className="size-3.5" />
                  ) : isCurrent ? (
                    <span className="size-2 rounded-full bg-white" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-stone-300" />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-4',
                      isPast ? 'bg-emerald-400' : 'bg-stone-200'
                    )}
                  />
                )}
              </div>

              {/* Label + timestamp */}
              <div className="pb-4 pt-0.5">
                <span
                  className={cn(
                    'text-sm font-medium',
                    (isPast || isCurrent) && 'text-stone-700',
                    isCancelledHere && 'text-red-600',
                    isFuture && 'text-stone-400'
                  )}
                >
                  {isCancelledHere ? 'Annulé' : STATUS_LABELS[step]}
                </span>
                {timestamp && (
                  <p className="text-[11px] text-stone-400">
                    {format(new Date(timestamp), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
