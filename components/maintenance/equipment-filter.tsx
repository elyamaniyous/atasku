'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useMemo } from 'react'

type EquipmentOption = {
  id: string
  code: string
  designation: string
}

export function EquipmentFilter({
  equipmentList,
  currentId,
}: {
  equipmentList: EquipmentOption[]
  currentId: string | undefined
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return equipmentList
    const lower = search.toLowerCase()
    return equipmentList.filter(
      e =>
        e.code.toLowerCase().includes(lower) ||
        e.designation.toLowerCase().includes(lower)
    )
  }, [equipmentList, search])

  function handleSelect(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('equipment', id)
    } else {
      params.delete('equipment')
    }
    router.push(`/maintenance/historique?${params.toString()}`)
  }

  const selected = equipmentList.find(e => e.id === currentId)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="text-sm font-medium text-stone-700">
          Filtrer par équipement
        </label>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300"
          />
        </div>
        <select
          value={currentId || ''}
          onChange={e => handleSelect(e.target.value)}
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-red-300 focus:outline-none focus:ring-1 focus:ring-red-300"
        >
          <option value="">Tous les équipements</option>
          {filtered.map(eq => (
            <option key={eq.id} value={eq.id}>
              {eq.code} — {eq.designation}
            </option>
          ))}
        </select>
        {selected && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            {selected.code} — {selected.designation}
          </span>
        )}
      </div>
    </div>
  )
}
