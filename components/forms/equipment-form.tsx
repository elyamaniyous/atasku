'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createEquipment, updateEquipment, getNextEquipmentCode } from '@/actions/equipment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Equipment } from '@/lib/types/database'

type EquipmentFormDialogProps = {
  mode: 'create' | 'edit'
  equipment?: Equipment
  children: React.ReactNode
}

const GROUP_OPTIONS = [
  { value: 'ELECTROGEN', label: 'Électrogène' },
  { value: 'TURBINE', label: 'Turbine' },
  { value: 'TRANSFORMER', label: 'Transformateur' },
  { value: 'PUMP', label: 'Moto-pompe' },
  { value: 'COMPRESSOR', label: 'Compresseur' },
  { value: 'OTHER', label: 'Autre' },
]

const CRITICALITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critique' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'LOW', label: 'Faible' },
]

const TYPE_OPTIONS = [
  { value: 'CAPOTE', label: 'Capoté' },
  { value: 'NON_CAPOTE', label: 'Non capoté' },
]

const FUEL_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Gaz', label: 'Gaz' },
  { value: 'Solaire', label: 'Solaire' },
  { value: 'Éolien', label: 'Éolien' },
  { value: 'Hydraulique', label: 'Hydraulique' },
  { value: 'Électrique', label: 'Électrique' },
]

type FormState = {
  error?: Record<string, string[]>
  success?: boolean
} | null

async function submitCreate(_prev: FormState, formData: FormData): Promise<FormState> {
  return createEquipment(formData)
}

async function submitUpdate(id: string) {
  return async function (_prev: FormState, formData: FormData): Promise<FormState> {
    return updateEquipment(id, formData)
  }
}

export function EquipmentFormDialog({
  mode,
  equipment,
  children,
}: EquipmentFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [suggestedCode, setSuggestedCode] = useState('')

  const actionFn = mode === 'edit' && equipment
    ? async (_prev: FormState, formData: FormData) => updateEquipment(equipment.id, formData)
    : submitCreate

  const [state, formAction, isPending] = useActionState(actionFn, null)

  // Hidden select state since base-ui selects don't work natively in forms
  const [groupName, setGroupName] = useState<string>(equipment?.group_name ?? 'ELECTROGEN')
  const [criticality, setCriticality] = useState<string>(equipment?.criticality ?? 'STANDARD')
  const [type, setType] = useState<string>(equipment?.type ?? 'NON_CAPOTE')
  const [fuelType, setFuelType] = useState<string>(equipment?.fuel_type ?? '')

  // Suggest next code for create mode
  useEffect(() => {
    if (mode === 'create' && open) {
      getNextEquipmentCode().then(setSuggestedCode)
    }
  }, [mode, open])

  // Success handling
  useEffect(() => {
    if (state?.success) {
      toast.success(mode === 'create' ? 'Équipement créé avec succès' : 'Équipement mis à jour')
      setOpen(false)
      router.refresh()
    }
  }, [state?.success, mode, router])

  // Error handling
  useEffect(() => {
    if (state?.error) {
      const firstError = Object.values(state.error).flat()[0]
      if (firstError) toast.error(firstError)
    }
  }, [state?.error])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<span className="contents" />}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nouvel équipement' : 'Modifier l\'équipement'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Remplissez les informations pour ajouter un équipement.'
              : 'Modifiez les informations de l\'équipement.'}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {/* Hidden fields for select values */}
          <input type="hidden" name="group_name" value={groupName} />
          <input type="hidden" name="criticality" value={criticality} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="fuel_type" value={fuelType} />

          {/* Code + Designation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={equipment?.code ?? suggestedCode}
                placeholder="EQ-001"
                className="font-mono"
                required
              />
              {state?.error?.code && (
                <p className="text-xs text-red-600">{state.error.code[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Désignation *</Label>
              <Input
                id="designation"
                name="designation"
                defaultValue={equipment?.designation ?? ''}
                placeholder="Groupe électrogène #1"
                required
              />
              {state?.error?.designation && (
                <p className="text-xs text-red-600">{state.error.designation[0]}</p>
              )}
            </div>
          </div>

          {/* Brand + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={equipment?.brand ?? ''}
                placeholder="Caterpillar"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                name="model"
                defaultValue={equipment?.model ?? ''}
                placeholder="C32"
              />
            </div>
          </div>

          {/* Serial number */}
          <div className="space-y-1.5">
            <Label htmlFor="serial_number">Numéro de série</Label>
            <Input
              id="serial_number"
              name="serial_number"
              defaultValue={equipment?.serial_number ?? ''}
              placeholder="SN-2024-0001"
              className="font-mono"
            />
          </div>

          {/* Location + Site + Workshop */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Emplacement</Label>
              <Input
                id="location"
                name="location"
                defaultValue={equipment?.location ?? ''}
                placeholder="Bâtiment A"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                name="site"
                defaultValue={equipment?.site ?? ''}
                placeholder="Dakar"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workshop">Atelier</Label>
              <Input
                id="workshop"
                name="workshop"
                defaultValue={equipment?.workshop ?? ''}
                placeholder="Atelier 1"
              />
            </div>
          </div>

          {/* Type + Group + Criticality */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Groupe</Label>
              <Select value={groupName} onValueChange={(v) => v && setGroupName(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Criticité</Label>
              <Select value={criticality} onValueChange={(v) => v && setCriticality(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRITICALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Commission date + Preventive freq */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="commission_date">Date mise en service</Label>
              <Input
                id="commission_date"
                name="commission_date"
                type="date"
                defaultValue={equipment?.commission_date ?? ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preventive_freq">Fréquence préventive</Label>
              <Input
                id="preventive_freq"
                name="preventive_freq"
                defaultValue={equipment?.preventive_freq ?? ''}
                placeholder="250h ou mensuelle"
              />
            </div>
          </div>

          {/* Power + Fuel */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rated_power_kw">Puissance (kW)</Label>
              <Input
                id="rated_power_kw"
                name="rated_power_kw"
                type="number"
                step="0.1"
                defaultValue={equipment?.rated_power_kw ?? ''}
                placeholder="500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Carburant</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fuel_consumption_rate">Conso. (L/h)</Label>
              <Input
                id="fuel_consumption_rate"
                name="fuel_consumption_rate"
                type="number"
                step="0.1"
                defaultValue={equipment?.fuel_consumption_rate ?? ''}
                placeholder="45"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Enregistrement...'
                : mode === 'create'
                  ? 'Créer l\'équipement'
                  : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
