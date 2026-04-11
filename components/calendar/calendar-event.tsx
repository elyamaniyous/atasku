'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/actions/planning'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TYPE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  CORRECTIVE: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  PREVENTIVE: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
}

const COMPLETED_STYLE = { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }

const PRIORITY_DOT: Record<string, string> = {
  URGENT: 'bg-red-500',
  NORMAL: 'bg-orange-400',
  LOW: 'bg-green-500',
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouveau',
  ASSIGNED: 'Affect\u00e9',
  IN_PROGRESS: 'En cours',
  ON_HOLD: 'En attente',
  COMPLETED: 'Termin\u00e9',
  CANCELLED: 'Annul\u00e9',
}

interface CalendarEventPillProps {
  event: CalendarEvent
  compact?: boolean
  className?: string
}

export function CalendarEventPill({
  event,
  compact = false,
  className,
}: CalendarEventPillProps) {
  const router = useRouter()
  const isCompleted = event.status === 'COMPLETED'
  const style = isCompleted
    ? COMPLETED_STYLE
    : TYPE_STYLES[event.type] || TYPE_STYLES.CORRECTIVE

  return (
    <Tooltip>
      <TooltipTrigger render={<div />}>
        <button
          onClick={() => router.push(`/ordres/${event.id}`)}
          className={cn(
            'group flex w-full items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs transition-shadow hover:shadow-sm',
            style.bg,
            style.border,
            style.text,
            className
          )}
        >
          {/* Priority dot */}
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              PRIORITY_DOT[event.priority] || PRIORITY_DOT.NORMAL
            )}
          />

          {/* Content */}
          <span className="min-w-0 flex-1 truncate">
            <span className={cn('font-mono font-medium', isCompleted && 'line-through')}>
              {compact ? event.code.split('-').pop() : event.code}
            </span>
            {!compact && (
              <span className="ml-1 font-normal opacity-70">
                {event.equipmentName.length > 16
                  ? event.equipmentName.slice(0, 16) + '...'
                  : event.equipmentName}
              </span>
            )}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1 text-xs">
          <p className="font-semibold">
            {event.code} — {event.equipmentName}
          </p>
          <p>
            <span className="text-stone-400">Statut :</span>{' '}
            {STATUS_LABELS[event.status] || event.status}
          </p>
          <p>
            <span className="text-stone-400">Type :</span>{' '}
            {event.type === 'CORRECTIVE' ? 'Correctif' : 'Pr\u00e9ventif'}
          </p>
          {event.technicianName && (
            <p>
              <span className="text-stone-400">Technicien :</span>{' '}
              {event.technicianName}
            </p>
          )}
          <p>
            <span className="text-stone-400">Dur\u00e9e :</span>{' '}
            {event.duration}h
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
