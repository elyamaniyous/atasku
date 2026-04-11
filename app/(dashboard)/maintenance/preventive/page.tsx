import { Target, Calendar, AlertTriangle } from 'lucide-react'
import {
  getPreventiveStats,
  getPreventiveSchedule,
  getPreventiveOTs,
} from '@/actions/maintenance'
import { KPICard } from '@/components/dashboard/kpi-card'
import { OTTable } from '@/components/ot/ot-table'
import { PreventiveSchedule } from '@/components/maintenance/preventive-schedule'

export default async function PreventiveMaintenancePage() {
  const [stats, schedule, ots] = await Promise.all([
    getPreventiveStats(),
    getPreventiveSchedule(),
    getPreventiveOTs(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">
          Maintenance Préventive
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Planification et suivi des révisions préventives
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          icon={Target}
          value={stats.executionRate}
          label="Taux d'exécution"
          suffix="%"
          color="green"
        />
        <KPICard
          icon={Calendar}
          value={stats.dueSoon}
          label="Révisions proches"
          color="orange"
        />
        <KPICard
          icon={AlertTriangle}
          value={stats.overdue}
          label="En retard"
          color="red"
        />
      </div>

      {/* Preventive Schedule */}
      <div>
        <h2 className="mb-4 font-heading text-lg text-stone-900">
          Planning préventif
        </h2>
        <PreventiveSchedule data={schedule} />
      </div>

      {/* Preventive OT Table */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-4 font-heading text-lg text-stone-900">
          Ordres préventifs
        </h2>
        <OTTable data={ots} />
      </div>
    </div>
  )
}
