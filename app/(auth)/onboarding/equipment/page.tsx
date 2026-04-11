'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { createEquipment, getEquipmentList } from '@/actions/equipment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Wrench, AlertTriangle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GROUPS = [
  { value: 'ELECTROGEN', label: 'Électrogène' },
  { value: 'TURBINE', label: 'Hydro-électrique' },
  { value: 'COMPRESSOR', label: 'Compresseur' },
  { value: 'PUMP', label: 'Moto-pompe' },
  { value: 'OTHER', label: 'Panneau solaire' },
  { value: 'OTHER', label: 'Éolienne' },
  { value: 'TRANSFORMER', label: 'Transformateur' },
]

// De-duplicate by value (OTHER appears twice, use unique labels)
const GROUP_OPTIONS = [
  { value: 'ELECTROGEN', label: 'Électrogène' },
  { value: 'TURBINE', label: 'Hydro-électrique' },
  { value: 'COMPRESSOR', label: 'Compresseur' },
  { value: 'PUMP', label: 'Moto-pompe' },
  { value: 'TRANSFORMER', label: 'Transformateur' },
  { value: 'OTHER', label: 'Autre' },
]

const CRITICALITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critique' },
  { value: 'STANDARD', label: 'Important' },
  { value: 'LOW', label: 'Standard' },
]

type EquipmentItem = {
  id: string
  code: string
  designation: string
  group_name: string
  criticality: string
}

const CRITICALITY_ICONS: Record<string, typeof Zap> = {
  CRITICAL: AlertTriangle,
  STANDARD: Zap,
  LOW: Wrench,
}

export default function EquipmentPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // Load existing equipment on mount
  useEffect(() => {
    getEquipmentList().then((data) => setEquipment(data as EquipmentItem[]))
  }, [])

  function handleAdd(formData: FormData) {
    setIsAdding(true)
    setErrors(null)
    startTransition(async () => {
      const result = await createEquipment(formData)
      if (result?.error) {
        setErrors(result.error as Record<string, string[]>)
        setIsAdding(false)
        return
      }
      // Refresh list
      const list = await getEquipmentList()
      setEquipment(list as EquipmentItem[])
      setIsAdding(false)
      // Reset form
      const form = document.getElementById('equipment-form') as HTMLFormElement
      form?.reset()
    })
  }

  const groupLabel = (value: string) =>
    GROUP_OPTIONS.find((g) => g.value === value)?.label ?? value

  const critLabel = (value: string) =>
    CRITICALITY_OPTIONS.find((c) => c.value === value)?.label ?? value

  return (
    <div>
      <StepIndicator currentStep={2} />

      <h2 className="font-heading text-2xl text-stone-800">
        Ajoutez vos équipements
      </h2>
      <p className="mt-1 mb-6 text-sm text-stone-500">
        Ajoutez au moins un équipement pour commencer
      </p>

      {/* Quick add form */}
      <form id="equipment-form" action={handleAdd} className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="GE-001"
              className="h-9"
              required
              aria-invalid={!!errors?.code}
            />
            {errors?.code && (
              <p className="text-xs text-red-600">{errors.code[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="designation">Désignation</Label>
            <Input
              id="designation"
              name="designation"
              placeholder="Groupe Électrogène Principal"
              className="h-9"
              required
              aria-invalid={!!errors?.designation}
            />
            {errors?.designation && (
              <p className="text-xs text-red-600">{errors.designation[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="group_name">Groupe</Label>
            <select
              id="group_name"
              name="group_name"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue="ELECTROGEN"
            >
              {GROUP_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="criticality">Criticité</Label>
            <select
              id="criticality"
              name="criticality"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              defaultValue="STANDARD"
            >
              {CRITICALITY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={isPending || isAdding}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Ajouter
            </>
          )}
        </Button>
      </form>

      {/* Equipment list */}
      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-stone-500">
          {equipment.length} équipement{equipment.length !== 1 ? 's' : ''} ajouté{equipment.length !== 1 ? 's' : ''}
        </p>
        <AnimatePresence mode="popLayout">
          {equipment.map((eq) => {
            const Icon = CRITICALITY_ICONS[eq.criticality] ?? Wrench
            return (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100">
                    <Icon className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      <span className="font-mono text-xs text-stone-500">{eq.code}</span>{' '}
                      {eq.designation}
                    </p>
                    <p className="text-xs text-stone-400">
                      {groupLabel(eq.group_name)} &middot; {critLabel(eq.criticality)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <Button
        size="lg"
        className="mt-6 w-full bg-red-600 text-white hover:bg-red-700"
        disabled={equipment.length === 0}
        onClick={() => router.push('/onboarding/team')}
      >
        Suivant
      </Button>
    </div>
  )
}
