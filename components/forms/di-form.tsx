'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Search, Wrench } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createWorkOrder } from '@/actions/ot'
import { getEquipmentList } from '@/actions/equipment'

type EquipmentItem = {
  id: string
  code: string
  designation: string
  group_name: string
  criticality: string
}

export function DIFormDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (open) {
      getEquipmentList().then(setEquipmentList)
    }
  }, [open])

  function resetForm() {
    setSelectedEquipment(null)
    setDescription('')
    setPriority('NORMAL')
    setSearchTerm('')
    setErrors({})
  }

  function handleSubmit() {
    if (!selectedEquipment) {
      setErrors({ equipment_id: ['Sélectionnez un équipement'] })
      return
    }
    if (description.trim().length < 5) {
      setErrors({ description: ['La description doit contenir au moins 5 caractères'] })
      return
    }

    const formData = new FormData()
    formData.set('equipment_id', selectedEquipment.id)
    formData.set('type', 'CORRECTIVE')
    formData.set('priority', priority)
    formData.set('description', description.trim())

    startTransition(async () => {
      const result = await createWorkOrder(formData)
      if (result.error) {
        setErrors(result.error as Record<string, string[]>)
        toast.error('Erreur lors de la création')
      } else if (result.success && result.workOrder) {
        toast.success(`${result.workOrder.code} créé`)
        setOpen(false)
        resetForm()
        router.refresh()
      }
    })
  }

  const filteredEquipment = equipmentList.filter(
    (e) =>
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger render={<span />}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle Demande d&apos;Intervention</DialogTitle>
          <DialogDescription>
            Créez rapidement une DI corrective.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Equipment search */}
          <div className="space-y-1.5">
            <Label>Équipement *</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-stone-400" />
              <Input
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {errors.equipment_id && (
              <p className="text-xs text-red-600">{errors.equipment_id[0]}</p>
            )}

            {/* Equipment list (compact) */}
            {searchTerm && !selectedEquipment && (
              <div className="max-h-[120px] overflow-y-auto space-y-0.5 rounded-md border border-stone-200 p-1">
                {filteredEquipment.length === 0 ? (
                  <p className="py-3 text-center text-xs text-stone-400">Aucun résultat.</p>
                ) : (
                  filteredEquipment.slice(0, 5).map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => {
                        setSelectedEquipment(eq)
                        setSearchTerm('')
                      }}
                      className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <Wrench className="size-3 shrink-0 text-stone-400" />
                      <span className="font-mono text-[11px] text-stone-500">{eq.code}</span>
                      <span className="text-xs text-stone-700 truncate">{eq.designation}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected equipment */}
            {selectedEquipment && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div>
                  <span className="font-mono text-xs text-emerald-700">{selectedEquipment.code}</span>
                  <span className="text-xs text-emerald-800"> — {selectedEquipment.designation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEquipment(null)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème constaté..."
              className="min-h-[80px] resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description[0]}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <Label>Priorité</Label>
            <div className="flex gap-2">
              {[
                { value: 'URGENT', label: 'Urgent', active: 'border-red-500 bg-red-50 text-red-700' },
                { value: 'NORMAL', label: 'Normal', active: 'border-orange-500 bg-orange-50 text-orange-700' },
                { value: 'LOW', label: 'Basse', active: 'border-green-500 bg-green-50 text-green-700' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    priority === opt.value
                      ? opt.active
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? 'Création...' : 'Créer la DI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
