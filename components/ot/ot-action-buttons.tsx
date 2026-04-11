'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Play,
  CheckCircle2,
  Pause,
  XCircle,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateWorkOrderStatus, assignTechnician } from '@/actions/ot'
import type { OTStatus, OrgRole } from '@/lib/types/database'

type Technician = { user_id: string; name: string; role: string }

type Props = {
  workOrderId: string
  currentStatus: OTStatus
  role: OrgRole
  userId: string
  technicianId: string | null
  technicians: Technician[]
}

export function OTActionButtons({
  workOrderId,
  currentStatus,
  role,
  userId,
  technicianId,
  technicians,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedTech, setSelectedTech] = useState('')
  const [cancelComment, setCancelComment] = useState('')

  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN'
  const isAssignedTech = technicianId === userId

  function handleStatusChange(newStatus: string, comment?: string) {
    startTransition(async () => {
      const result = await updateWorkOrderStatus(workOrderId, newStatus, comment)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Statut mis à jour')
        router.refresh()
      }
    })
  }

  function handleAssign() {
    if (!selectedTech) return
    startTransition(async () => {
      const result = await assignTechnician(workOrderId, selectedTech)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Technicien affecté')
        setAssignDialogOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Assign button - NEW status, OWNER/ADMIN only */}
        {currentStatus === 'NEW' && isOwnerOrAdmin && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setAssignDialogOpen(true)}
            disabled={isPending}
          >
            <UserPlus className="size-3.5" />
            Affecter
          </Button>
        )}

        {/* Start button - ASSIGNED, assigned tech or admin */}
        {currentStatus === 'ASSIGNED' && (isAssignedTech || isOwnerOrAdmin) && (
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={isPending}
          >
            <Play className="size-3.5" />
            Démarrer
          </Button>
        )}

        {/* Complete button - IN_PROGRESS */}
        {currentStatus === 'IN_PROGRESS' && (isAssignedTech || isOwnerOrAdmin) && (
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleStatusChange('COMPLETED')}
            disabled={isPending}
          >
            <CheckCircle2 className="size-3.5" />
            Terminer
          </Button>
        )}

        {/* On Hold button - IN_PROGRESS */}
        {currentStatus === 'IN_PROGRESS' && (isAssignedTech || isOwnerOrAdmin) && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-amber-600 border-amber-300 hover:bg-amber-50"
            onClick={() => handleStatusChange('ON_HOLD')}
            disabled={isPending}
          >
            <Pause className="size-3.5" />
            Mettre en attente
          </Button>
        )}

        {/* Resume button - ON_HOLD */}
        {currentStatus === 'ON_HOLD' && (isAssignedTech || isOwnerOrAdmin) && (
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleStatusChange('IN_PROGRESS')}
            disabled={isPending}
          >
            <Play className="size-3.5" />
            Reprendre
          </Button>
        )}

        {/* Cancel button - not COMPLETED/CANCELLED, OWNER/ADMIN only */}
        {!['COMPLETED', 'CANCELLED'].includes(currentStatus) && isOwnerOrAdmin && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => setCancelDialogOpen(true)}
            disabled={isPending}
          >
            <XCircle className="size-3.5" />
            Annuler
          </Button>
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Affecter un technicien</DialogTitle>
            <DialogDescription>
              Sélectionnez le technicien à affecter à cet ordre de travail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Sélectionner un technicien</option>
              {technicians.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleAssign}
              disabled={isPending || !selectedTech}
            >
              Affecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Annuler l&apos;ordre de travail</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Ajoutez un commentaire optionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <textarea
              value={cancelComment}
              onChange={(e) => setCancelComment(e.target.value)}
              placeholder="Raison de l'annulation (optionnel)"
              className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm min-h-[80px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isPending}
            >
              Retour
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => {
                handleStatusChange('CANCELLED', cancelComment || undefined)
                setCancelDialogOpen(false)
              }}
              disabled={isPending}
            >
              Confirmer l&apos;annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
