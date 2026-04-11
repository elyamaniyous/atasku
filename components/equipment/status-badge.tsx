import { cn } from '@/lib/utils'
import type { EquipmentStatus, Criticality } from '@/lib/types/database'

// ---- Status Badge ----

const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string; bg: string; dot: string }> = {
  OPERATIONAL: {
    label: 'Opérationnel',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  DEGRADED: {
    label: 'Dégradé',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    dot: 'bg-orange-500',
  },
  BROKEN: {
    label: 'En panne',
    color: 'text-red-700',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
  },
  IN_REVISION: {
    label: 'En révision',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  REVISION_DUE: {
    label: 'Révision due',
    color: 'text-stone-600',
    bg: 'bg-stone-100',
    dot: 'bg-stone-400',
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: EquipmentStatus
  className?: string
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPERATIONAL

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

// ---- Criticality Badge ----

const CRITICALITY_CONFIG: Record<Criticality, { label: string; border: string; color: string }> = {
  CRITICAL: {
    label: 'Critique',
    border: 'border-red-300',
    color: 'text-red-700',
  },
  STANDARD: {
    label: 'Standard',
    border: 'border-stone-300',
    color: 'text-stone-600',
  },
  LOW: {
    label: 'Faible',
    border: 'border-stone-200',
    color: 'text-stone-500',
  },
}

export function CriticalityBadge({
  criticality,
  className,
}: {
  criticality: Criticality
  className?: string
}) {
  const config = CRITICALITY_CONFIG[criticality] ?? CRITICALITY_CONFIG.STANDARD

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        config.border,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}

// Export configs for reuse
export { STATUS_CONFIG, CRITICALITY_CONFIG }
