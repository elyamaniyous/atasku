'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, MapPin, Wrench, Fuel } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge, CriticalityBadge } from '@/components/equipment/status-badge'
import type { Equipment } from '@/lib/types/database'

const GROUP_LABELS: Record<string, string> = {
  ELECTROGEN: 'Électrogène',
  TURBINE: 'Turbine',
  TRANSFORMER: 'Transformateur',
  PUMP: 'Moto-pompe',
  COMPRESSOR: 'Compresseur',
  OTHER: 'Autre',
}

export function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const isCritical = equipment.criticality === 'CRITICAL'

  return (
    <Link href={`/actifs/${equipment.id}`}>
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative flex flex-col rounded-xl border border-stone-200 bg-white p-4 transition-colors',
          isCritical && 'border-l-[3px] border-l-red-500'
        )}
      >
        {/* Top row: status + criticality */}
        <div className="mb-3 flex items-center justify-between">
          <StatusBadge status={equipment.status} />
          {(equipment.criticality === 'CRITICAL' || equipment.criticality === 'LOW') && (
            <CriticalityBadge criticality={equipment.criticality} />
          )}
        </div>

        {/* Title + code */}
        <h3 className="text-sm font-semibold text-stone-900 leading-tight">
          {equipment.designation}
        </h3>
        <p className="mt-0.5 font-mono text-xs text-stone-400">
          {equipment.code}
        </p>

        {/* Info grid */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-stone-400" />
            <span className="font-mono">{equipment.hours_counter}h</span>
          </div>
          {equipment.brand ? (
            <div className="flex items-center gap-1.5 truncate">
              <Wrench className="size-3.5 shrink-0 text-stone-400" />
              <span className="truncate">
                {equipment.brand}
                {equipment.model ? ` ${equipment.model}` : ''}
              </span>
            </div>
          ) : (
            <div />
          )}
          {equipment.location ? (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0 text-stone-400" />
              <span className="truncate">{equipment.location}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 text-[10px] font-medium uppercase">
              Grp
            </span>
            <span>{GROUP_LABELS[equipment.group_name] ?? equipment.group_name}</span>
          </div>
        </div>

        {/* Fuel type badge */}
        {equipment.fuel_type && (
          <div className="mt-3 flex items-center gap-1.5">
            <Fuel className="size-3.5 text-stone-400" />
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
              {equipment.fuel_type}
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  )
}
