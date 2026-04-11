import { Suspense } from 'react'
import {
  getMaintenanceHistory,
  calculateMTBF,
  calculateMTTR,
  getMaintenanceEquipmentList,
} from '@/actions/maintenance'
import { EquipmentFilter } from '@/components/maintenance/equipment-filter'
import { MTBFMTTRDisplay } from '@/components/maintenance/mtbf-mttr-display'
import { MaintenanceTimeline } from '@/components/maintenance/maintenance-timeline'
import { CostChart } from '@/components/maintenance/cost-chart'

export default async function MaintenanceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ equipment?: string }>
}) {
  const params = await searchParams
  const equipmentId = params.equipment || undefined

  const [equipmentList, history] = await Promise.all([
    getMaintenanceEquipmentList(),
    getMaintenanceHistory(equipmentId),
  ])

  // Calculate MTBF/MTTR only if equipment is selected
  let mtbf: number | null = null
  let mttr: number | null = null
  if (equipmentId) {
    ;[mtbf, mttr] = await Promise.all([
      calculateMTBF(equipmentId),
      calculateMTTR(equipmentId),
    ])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">
          Historique de Maintenance
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Interventions passées, coûts et indicateurs de fiabilité
        </p>
      </div>

      {/* Equipment Filter */}
      <Suspense fallback={null}>
        <EquipmentFilter
          equipmentList={equipmentList}
          currentId={equipmentId}
        />
      </Suspense>

      {/* MTBF/MTTR Display — only when equipment selected */}
      {equipmentId && <MTBFMTTRDisplay mtbf={mtbf} mttr={mttr} />}

      {/* Cost Chart */}
      <CostChart data={history} />

      {/* Timeline */}
      <div>
        <h2 className="mb-4 font-heading text-lg text-stone-900">
          Chronologie des interventions
        </h2>
        <MaintenanceTimeline data={history} />
      </div>
    </div>
  )
}
