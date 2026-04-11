'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'OPERATIONAL', label: 'Opérationnel' },
  { value: 'DEGRADED', label: 'Dégradé' },
  { value: 'BROKEN', label: 'En panne' },
  { value: 'IN_REVISION', label: 'En révision' },
  { value: 'REVISION_DUE', label: 'Révision due' },
]

const CRITICALITY_OPTIONS = [
  { value: '', label: 'Toutes criticités' },
  { value: 'CRITICAL', label: 'Critique' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'LOW', label: 'Faible' },
]

const GROUP_OPTIONS = [
  { value: '', label: 'Tous les groupes' },
  { value: 'ELECTROGEN', label: 'Électrogène' },
  { value: 'TURBINE', label: 'Turbine' },
  { value: 'TRANSFORMER', label: 'Transformateur' },
  { value: 'PUMP', label: 'Moto-pompe' },
  { value: 'COMPRESSOR', label: 'Compresseur' },
  { value: 'OTHER', label: 'Autre' },
]

export function EquipmentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentStatus = searchParams.get('status') ?? ''
  const currentCriticality = searchParams.get('criticality') ?? ''
  const currentGroup = searchParams.get('group_name') ?? ''
  const currentSearch = searchParams.get('search') ?? ''

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/actifs?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
        <Input
          placeholder="Rechercher..."
          defaultValue={currentSearch}
          className="pl-8"
          onChange={(e) => {
            const val = (e.target as HTMLInputElement).value
            // debounce-like: update on each change
            updateParams('search', val)
          }}
        />
      </div>

      {/* Status */}
      <Select
        value={currentStatus}
        onValueChange={(val) => updateParams('status', val ?? '')}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Criticality */}
      <Select
        value={currentCriticality}
        onValueChange={(val) => updateParams('criticality', val ?? '')}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Toutes criticités" />
        </SelectTrigger>
        <SelectContent>
          {CRITICALITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Group */}
      <Select
        value={currentGroup}
        onValueChange={(val) => updateParams('group_name', val ?? '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tous les groupes" />
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
  )
}
