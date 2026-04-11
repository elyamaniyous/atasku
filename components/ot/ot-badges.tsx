import { cn } from '@/lib/utils'
import type { OTStatus, Priority, WorkOrderType } from '@/lib/types/database'

// ---- OT Status Badge ----

const OT_STATUS_CONFIG: Record<OTStatus, { label: string; color: string; bg: string; dot: string }> = {
  NEW: {
    label: 'Nouveau',
    color: 'text-stone-700',
    bg: 'bg-stone-100',
    dot: 'bg-stone-400',
  },
  ASSIGNED: {
    label: 'Affecté',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'En cours',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    dot: 'bg-orange-500',
  },
  ON_HOLD: {
    label: 'En attente',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Terminé',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Annulé',
    color: 'text-red-400',
    bg: 'bg-red-50',
    dot: 'bg-red-300',
  },
}

export function OTStatusBadge({
  status,
  className,
}: {
  status: OTStatus
  className?: string
}) {
  const config = OT_STATUS_CONFIG[status] ?? OT_STATUS_CONFIG.NEW

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.bg,
        config.color,
        className
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

// ---- Priority Badge ----

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  URGENT: {
    label: 'Urgent',
    color: 'text-red-700',
    bg: 'bg-red-50',
  },
  NORMAL: {
    label: 'Normal',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  LOW: {
    label: 'Basse',
    color: 'text-green-700',
    bg: 'bg-green-50',
  },
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority
  className?: string
}) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.NORMAL

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}

// ---- Type Badge ----

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CORRECTIVE: {
    label: 'Correctif',
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
  PREVENTIVE: {
    label: 'Préventif',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  CONDITIONAL: {
    label: 'Conditionnel',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
  IMPROVEMENT: {
    label: 'Amélioration',
    color: 'text-teal-700',
    bg: 'bg-teal-100',
  },
}

export function TypeBadge({
  type,
  className,
}: {
  type: WorkOrderType
  className?: string
}) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.CORRECTIVE

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}

// Export configs for reuse
export { OT_STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG }
