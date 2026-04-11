'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
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
import { updateOrganization } from '@/actions/org'
import { Save, Loader2 } from 'lucide-react'

const INDUSTRIES = [
  { value: 'POWER_PLANT', label: 'Centrale électrique' },
  { value: 'SOLAR', label: 'Solaire' },
  { value: 'WIND', label: 'Éolien' },
  { value: 'HYDRO', label: 'Hydraulique' },
  { value: 'MINING', label: 'Mines' },
  { value: 'CEMENT', label: 'Cimenterie' },
  { value: 'OTHER', label: 'Autre' },
]

const COUNTRIES = [
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'MA', label: 'Maroc' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'CM', label: 'Cameroun' },
  { value: 'DZ', label: 'Algérie' },
  { value: 'TN', label: 'Tunisie' },
  { value: 'CD', label: 'RD Congo' },
  { value: 'GA', label: 'Gabon' },
  { value: 'ML', label: 'Mali' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'US', label: 'États-Unis' },
  { value: 'CA', label: 'Canada' },
]

const LOCALES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
]

type OrgData = {
  name: string
  industry: string
  country: string
  timezone: string
  locale: string
}

export function OrgSettingsForm({ org }: { org: OrgData }) {
  const [isPending, startTransition] = useTransition()
  const [industry, setIndustry] = useState(org.industry)
  const [country, setCountry] = useState(org.country)
  const [locale, setLocale] = useState(org.locale || 'fr')

  function handleSubmit(formData: FormData) {
    const data: Record<string, unknown> = {
      name: formData.get('name'),
      industry,
      country,
      timezone: formData.get('timezone'),
      locale,
    }
    startTransition(async () => {
      const result = await updateOrganization(data)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Paramètres mis à jour')
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="org-name">Nom de l&apos;organisation</Label>
          <Input
            id="org-name"
            name="name"
            defaultValue={org.name}
            required
            minLength={2}
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label>Secteur d&apos;activité</Label>
          <Select defaultValue={org.industry} onValueChange={(v) => v && setIndustry(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label>Pays</Label>
          <Select defaultValue={org.country} onValueChange={(v) => v && setCountry(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="org-timezone">Fuseau horaire</Label>
          <Input
            id="org-timezone"
            name="timezone"
            defaultValue={org.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            readOnly
            className="bg-stone-50 text-stone-600"
          />
        </div>

        {/* Locale */}
        <div className="space-y-2">
          <Label>Langue</Label>
          <Select defaultValue={org.locale || 'fr'} onValueChange={(v) => v && setLocale(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Enregistrer
      </Button>
    </form>
  )
}
