'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Clock, User, Wrench } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { KanbanWorkOrder } from '@/actions/ot'
import type { Priority, WorkOrderType } from '@/lib/types/database'

// Priority left-border colors
const PRIORITY_BORDER: Record<Priority, string> = {
  URGENT: 'border-l-red-500',
  NORMAL: 'border-l-orange-400',
  LOW: 'border-l-green-500',
}

// Type badge config
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  CORRECTIVE: { label: 'Correctif', bg: 'bg-red-100', text: 'text-red-700' },
  PREVENTIVE: { label: 'Préventif', bg: 'bg-blue-100', text: 'text-blue-700' },
  CONDITIONAL: { label: 'Conditionnel', bg: 'bg-purple-100', text: 'text-purple-700' },
  IMPROVEMENT: { label: 'Amélioration', bg: 'bg-teal-100', text: 'text-teal-700' },
}

// Priority badge for urgents
const PRIORITY_BADGE: Record<Priority, { label: string; bg: string; text: string } | null> = {
  URGENT: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-700' },
  NORMAL: null,
  LOW: null,
}

interface KanbanCardProps {
  workOrder: KanbanWorkOrder
  overlay?: boolean
}

export function KanbanCard({ workOrder, overlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: workOrder.id,
    data: {
      type: 'work-order',
      workOrder,
      status: workOrder.status,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const typeConfig = TYPE_CONFIG[workOrder.type] ?? TYPE_CONFIG.CORRECTIVE
  const priorityBadge = PRIORITY_BADGE[workOrder.priority]

  const cardContent = (
    <div className="space-y-2">
      {/* Top row: code + type badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-stone-400">
          {workOrder.code}
        </span>
        <div className="flex items-center gap-1">
          {priorityBadge && (
            <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold', priorityBadge.bg, priorityBadge.text)}>
              {priorityBadge.label}
            </span>
          )}
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', typeConfig.bg, typeConfig.text)}>
            {typeConfig.label}
          </span>
        </div>
      </div>

      {/* Equipment */}
      {workOrder.equipment && (
        <div className="flex items-center gap-1.5 text-xs">
          <Wrench className="size-3 shrink-0 text-stone-400" />
          <span className="truncate font-medium text-stone-700">
            {workOrder.equipment.designation}
          </span>
        </div>
      )}

      {/* Description preview */}
      <p className="line-clamp-2 text-xs text-stone-500">
        {workOrder.description}
      </p>

      {/* Bottom row: technician + duration */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <User className="size-3 shrink-0" />
          <span className="truncate">
            {workOrder.technician_name ?? 'Non affect\u00e9'}
          </span>
        </div>
        {workOrder.estimated_duration && (
          <div className="flex items-center gap-1 text-xs text-stone-400">
            <Clock className="size-3 shrink-0" />
            <span>{workOrder.estimated_duration}h</span>
          </div>
        )}
      </div>
    </div>
  )

  if (overlay) {
    return (
      <div
        className={cn(
          'rounded-lg border border-stone-200 bg-white p-3 shadow-lg border-l-[3px]',
          PRIORITY_BORDER[workOrder.priority],
          'scale-[1.03] opacity-90'
        )}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        'group cursor-grab rounded-lg border border-stone-200 bg-white p-3 border-l-[3px] transition-shadow',
        PRIORITY_BORDER[workOrder.priority],
        isDragging && 'z-50 scale-[1.03] shadow-lg opacity-50',
        !isDragging && 'hover:shadow-md'
      )}
    >
      <Link href={`/ordres/${workOrder.id}`} className="block" onClick={(e) => {
        // Prevent navigation when dragging
        if (isDragging) e.preventDefault()
      }}>
        {cardContent}
      </Link>
    </motion.div>
  )
}
