'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { KanbanCard } from './card'
import type { KanbanWorkOrder } from '@/actions/ot'
import type { OTStatus } from '@/lib/types/database'

// Column config: French label + top border color
const COLUMN_CONFIG: Record<OTStatus, { label: string; borderColor: string; dotColor: string }> = {
  NEW: { label: 'Nouveau', borderColor: 'border-t-stone-400', dotColor: 'bg-stone-400' },
  ASSIGNED: { label: 'Affect\u00e9', borderColor: 'border-t-blue-500', dotColor: 'bg-blue-500' },
  IN_PROGRESS: { label: 'En cours', borderColor: 'border-t-orange-500', dotColor: 'bg-orange-500' },
  ON_HOLD: { label: 'En attente', borderColor: 'border-t-amber-400', dotColor: 'bg-amber-400' },
  COMPLETED: { label: 'Termin\u00e9', borderColor: 'border-t-green-500', dotColor: 'bg-green-500' },
  CANCELLED: { label: 'Annul\u00e9', borderColor: 'border-t-red-300', dotColor: 'bg-red-300' },
}

interface KanbanColumnProps {
  status: OTStatus
  workOrders: KanbanWorkOrder[]
  defaultCollapsed?: boolean
}

export function KanbanColumn({ status, workOrders, defaultCollapsed = false }: KanbanColumnProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const config = COLUMN_CONFIG[status]

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  const itemIds = workOrders.map(wo => wo.id)

  return (
    <div className={cn(
      'flex w-72 shrink-0 flex-col rounded-lg border border-stone-200 bg-stone-50/50 border-t-[3px]',
      config.borderColor,
      isOver && 'ring-2 ring-blue-300 ring-offset-1'
    )}>
      {/* Column header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="size-4 text-stone-400" />
          ) : (
            <ChevronDown className="size-4 text-stone-400" />
          )}
          <span className={cn('size-2 rounded-full', config.dotColor)} />
          <span className="text-sm font-semibold text-stone-700">
            {config.label}
          </span>
        </div>
        <span className="flex size-5 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600">
          {workOrders.length}
        </span>
      </button>

      {/* Card list */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className="flex max-h-[calc(100vh-280px)] flex-col gap-2 overflow-y-auto px-2 pb-2"
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence mode="popLayout">
              {workOrders.length > 0 ? (
                workOrders.map((wo) => (
                  <KanbanCard key={wo.id} workOrder={wo} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-200 px-4 py-8"
                >
                  <span className="text-xs text-stone-400">Aucun ordre</span>
                </motion.div>
              )}
            </AnimatePresence>
          </SortableContext>
        </div>
      )}

      {/* Collapsed summary */}
      {collapsed && workOrders.length > 0 && (
        <div className="px-3 pb-2">
          <div className="rounded bg-stone-100 px-2 py-1 text-center text-xs text-stone-500">
            {workOrders.length} ordre{workOrders.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

export { COLUMN_CONFIG }
