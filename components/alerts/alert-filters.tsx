'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tous les types' },
  { value: 'HOURS_250', label: 'Compteur heures' },
  { value: 'PREVENTIVE_J7', label: 'Preventive J-7' },
  { value: 'PREVENTIVE_J3', label: 'Preventive J-3' },
  { value: 'PREVENTIVE_J1', label: 'Preventive J-1' },
  { value: 'OT_UNASSIGNED', label: 'OT non affecte' },
  { value: 'SLA_WARNING', label: 'SLA' },
  { value: 'DAILY_SUMMARY', label: 'Resume quotidien' },
  { value: 'AI_PREDICTION', label: 'Prediction IA' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'SENT', label: 'Non lues' },
  { value: 'READ', label: 'Lues' },
  { value: 'ACKNOWLEDGED', label: 'Acquittees' },
]

export function AlertFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get('type') || 'all'
  const currentStatus = searchParams.get('status') || 'all'

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/alertes?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={currentType}
        onValueChange={(val) => updateFilter('type', val as string)}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={(val) => updateFilter('status', val as string)}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
