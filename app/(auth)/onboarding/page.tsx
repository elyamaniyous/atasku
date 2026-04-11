'use client'

import { useActionState, useEffect, useState } from 'react'
import { StepIndicator } from '@/components/onboarding/step-indicator'
import { createOrganization } from '@/actions/org'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Sparkles } from 'lucide-react'

const INDUSTRIES = [
  { value: 'POWER_PLANT', label: 'Centrale électrique' },
  { value: 'SOLAR', label: 'Solaire' },
  { value: 'WIND', label: 'Éolien' },
  { value: 'HYDRO', label: 'Hydraulique' },
  { value: 'MINING', label: 'Mine' },
  { value: 'CEMENT', label: 'Cimenterie' },
  { value: 'OTHER', label: 'Autre' },
]

const COUNTRIES = [
  { value: 'MA', label: 'Maroc' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'CM', label: 'Cameroun' },
  { value: 'TN', label: 'Tunisie' },
  { value: 'DZ', label: 'Algérie' },
  { value: 'OTHER', label: 'Autre' },
]

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await createOrganization(formData)
    },
    null
  )

  const [timezone, setTimezone] = useState('')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const errors = (state as { error?: Record<string, string[]> })?.error

  return (
    <div>
      <StepIndicator currentStep={1} />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-stone-800">
            Créez votre organisation
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Configurez votre espace de maintenance
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
          <Sparkles className="h-3 w-3" />
          14 jours d&apos;essai Pro gratuit
        </span>
      </div>

      {errors?.name && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.name[0]}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="timezone" value={timezone} />

        <div className="space-y-2">
          <Label htmlFor="name">Nom de l&apos;organisation</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Ex: SONABEL Ouagadougou"
            className="h-10"
            required
            aria-invalid={!!errors?.name}
          />
          {errors?.name && (
            <p className="text-xs text-red-600">{errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Secteur d&apos;activité</Label>
          <select
            id="industry"
            name="industry"
            required
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un secteur
            </option>
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
          {errors?.industry && (
            <p className="text-xs text-red-600">{errors.industry[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <select
            id="country"
            name="country"
            required
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            defaultValue=""
          >
            <option value="" disabled>
              Sélectionnez un pays
            </option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors?.country && (
            <p className="text-xs text-red-600">{errors.country[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-red-600 text-white hover:bg-red-700"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Suivant'
          )}
        </Button>
      </form>
    </div>
  )
}
