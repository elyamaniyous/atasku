'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { KanbanColumn } from './column'
import { KanbanCard } from './card'
import { updateWorkOrderStatus } from '@/actions/ot'
import type { KanbanWorkOrder } from '@/actions/ot'
import type { OTStatus, OrgRole } from '@/lib/types/database'

// Valid status transitions (client-side mirror for optimistic checks)
const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
}

const STATUSES: OTStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']

interface KanbanBoardProps {
  initialData: Record<OTStatus, KanbanWorkOrder[]>
  userRole: OrgRole
  userId?: string
}

export function KanbanBoard({ initialData, userRole, userId }: KanbanBoardProps) {
  const [data, setData] = useState(initialData)
  const [activeCard, setActiveCard] = useState<KanbanWorkOrder | null>(null)

  // Require minimum drag distance to avoid accidental drags on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const findWorkOrder = useCallback((id: string): { wo: KanbanWorkOrder; status: OTStatus } | null => {
    for (const status of STATUSES) {
      const wo = data[status].find(w => w.id === id)
      if (wo) return { wo, status }
    }
    return null
  }, [data])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const found = findWorkOrder(event.active.id as string)
    if (found) setActiveCard(found.wo)
  }, [findWorkOrder])

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // We handle moves in onDragEnd only for simplicity
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeId = active.id as string
    const found = findWorkOrder(activeId)
    if (!found) return

    const sourceStatus = found.status

    // Determine target status: could be dropping on a column or on another card
    let targetStatus: OTStatus
    const overData = over.data.current

    if (overData?.type === 'column') {
      targetStatus = overData.status as OTStatus
    } else if (overData?.type === 'work-order') {
      targetStatus = overData.status as OTStatus
    } else {
      // Fallback: check if over.id is a status string
      if (STATUSES.includes(over.id as OTStatus)) {
        targetStatus = over.id as OTStatus
      } else {
        return
      }
    }

    // Same column — no-op
    if (sourceStatus === targetStatus) return

    // RBAC: technicians can only move their own cards
    if (userRole === 'TECHNICIAN' && found.wo.technician_id !== userId) {
      toast.error('Vous ne pouvez modifier que vos propres ordres de travail')
      return
    }

    // Check valid transition
    const allowed = VALID_TRANSITIONS[sourceStatus] || []
    if (!allowed.includes(targetStatus)) {
      toast.error(`Transition ${sourceStatus} \u2192 ${targetStatus} non autoris\u00e9e`)
      return
    }

    // Optimistic update
    const previousData = { ...data }
    setData(prev => {
      const next = { ...prev }
      // Remove from source
      next[sourceStatus] = prev[sourceStatus].filter(wo => wo.id !== activeId)
      // Add to target with updated status
      const movedWo = { ...found.wo, status: targetStatus }
      next[targetStatus] = [movedWo, ...prev[targetStatus]]
      return next
    })

    // Server action
    const result = await updateWorkOrderStatus(activeId, targetStatus)

    if (result.error) {
      // Revert optimistic update
      setData(previousData)
      toast.error(result.error)
    } else {
      toast.success('Statut mis \u00e0 jour')
    }
  }, [data, findWorkOrder, userRole, userId])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            workOrders={data[status]}
            defaultCollapsed={status === 'COMPLETED' || status === 'CANCELLED'}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? <KanbanCard workOrder={activeCard} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
