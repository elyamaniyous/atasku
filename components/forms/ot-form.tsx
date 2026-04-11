'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronLeft, ChevronRight, Check, Wrench } from 'lucide-react'
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
import { getTechnicians } from '@/actions/ot'

type EquipmentItem = {
  id: string
  code: string
  designation: string
  group_name: string
  criticality: string
}

type Technician = {
  user_id: string
  name: string
  role: string
  avatar_url: string | null
}

const STEP_LABELS = ['Équipement', 'Détails', 'Affectation']

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

export function OTFormDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Data lists
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [technicianList, setTechnicianList] = useState<Technician[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)
  const [type, setType] = useState('CORRECTIVE')
  const [priority, setPriority] = useState('NORMAL')
  const [description, setDescription] = useState('')
  const [cause, setCause] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [selectedTechnician, setSelectedTechnician] = useState('')

  const [errors, setErrors] = useState<Record<string, string[]>>({})

  // Load equipment and technicians when dialog opens
  useEffect(() => {
    if (open) {
      getEquipmentList().then(setEquipmentList)
      getTechnicians().then(setTechnicianList)
    }
  }, [open])

  function resetForm() {
    setStep(0)
    setDirection(0)
    setSelectedEquipment(null)
    setType('CORRECTIVE')
    setPriority('NORMAL')
    setDescription('')
    setCause('')
    setEstimatedDuration('')
    setSelectedTechnician('')
    setSearchTerm('')
    setErrors({})
  }

  function goNext() {
    // Validate current step
    if (step === 0 && !selectedEquipment) return
    if (step === 1 && description.trim().length < 5) {
      setErrors({ description: ['La description doit contenir au moins 5 caractères'] })
      return
    }
    setErrors({})
    setDirection(1)
    setStep((s) => Math.min(s + 1, 2))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleSubmit() {
    if (!selectedEquipment) return

    const formData = new FormData()
    formData.set('equipment_id', selectedEquipment.id)
    formData.set('type', type)
    formData.set('priority', priority)
    formData.set('description', description.trim())
    if (cause.trim()) formData.set('cause', cause.trim())
    if (estimatedDuration) formData.set('estimated_duration', estimatedDuration)
    if (selectedTechnician) formData.set('technician_id', selectedTechnician)

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel Ordre de Travail</DialogTitle>
          <DialogDescription>
            Étape {step + 1} sur 3 — {STEP_LABELS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {STEP_LABELS.map((label, idx) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  idx < step
                    ? 'bg-emerald-500 text-white'
                    : idx === step
                    ? 'bg-red-600 text-white'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {idx < step ? <Check className="size-3.5" /> : idx + 1}
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${idx < step ? 'bg-emerald-400' : 'bg-stone-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content with animation */}
        <div className="min-h-[240px] relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {step === 0 && (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-stone-400" />
                    <Input
                      placeholder="Rechercher un équipement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Equipment list */}
                  <div className="max-h-[180px] overflow-y-auto space-y-1">
                    {filteredEquipment.length === 0 ? (
                      <p className="py-6 text-center text-sm text-stone-400">
                        Aucun équipement trouvé.
                      </p>
                    ) : (
                      filteredEquipment.map((eq) => (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => setSelectedEquipment(eq)}
                          className={`w-full flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
                            selectedEquipment?.id === eq.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          <Wrench className="size-4 shrink-0 text-stone-400" />
                          <div className="min-w-0">
                            <span className="font-mono text-xs text-stone-500">{eq.code}</span>
                            <p className="text-sm font-medium text-stone-700 truncate">
                              {eq.designation}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Selected preview */}
                  {selectedEquipment && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">Sélectionné :</p>
                      <p className="text-sm text-emerald-800">
                        <span className="font-mono">{selectedEquipment.code}</span> — {selectedEquipment.designation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  {/* Type */}
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'CORRECTIVE', label: 'Correctif' },
                        { value: 'PREVENTIVE', label: 'Préventif' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setType(opt.value)}
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            type === opt.value
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
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

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label>Description *</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez le problème ou l'intervention nécessaire..."
                      className="min-h-[80px] resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600">{errors.description[0]}</p>
                    )}
                  </div>

                  {/* Cause */}
                  <div className="space-y-1.5">
                    <Label>Cause (optionnel)</Label>
                    <Input
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                      placeholder="Cause identifiée"
                    />
                  </div>

                  {/* Estimated duration */}
                  <div className="space-y-1.5">
                    <Label>Durée estimée (heures)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="Ex: 2.5"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-stone-500">
                    Affectez un technicien maintenant ou laissez non affecté.
                  </p>

                  <div className="space-y-1">
                    {/* Unassigned option */}
                    <button
                      type="button"
                      onClick={() => setSelectedTechnician('')}
                      className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                        selectedTechnician === ''
                          ? 'border-red-500 bg-red-50'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 text-xs font-semibold">
                        —
                      </div>
                      <span className="text-sm font-medium text-stone-600">
                        Laisser non affecté
                      </span>
                    </button>

                    {/* Technician list */}
                    {technicianList.map((tech) => (
                      <button
                        key={tech.user_id}
                        type="button"
                        onClick={() => setSelectedTechnician(tech.user_id)}
                        className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          selectedTechnician === tech.user_id
                            ? 'border-red-500 bg-red-50'
                            : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                          {tech.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-700">{tech.name}</p>
                          <p className="text-xs text-stone-400">{tech.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" onClick={goBack} disabled={isPending}>
              <ChevronLeft className="size-4" />
              Précédent
            </Button>
          )}
          {step < 2 ? (
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={goNext}
              disabled={step === 0 && !selectedEquipment}
            >
              Suivant
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? 'Création...' : 'Créer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
