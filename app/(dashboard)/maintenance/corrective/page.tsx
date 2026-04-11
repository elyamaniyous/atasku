import { AlertTriangle, Wrench, CheckCircle, Clock } from 'lucide-react'
import { getCorrectiveStats, getCorrectiveOTs } from '@/actions/maintenance'
import { KPICard } from '@/components/dashboard/kpi-card'
import { OTTable } from '@/components/ot/ot-table'
import { DIFormDialog } from '@/components/forms/di-form'
import { Button } from '@/components/ui/button'
import { CorrectiveCharts } from '@/components/maintenance/corrective-charts'

export default async function CorrectiveMaintenancePage() {
  const [stats, ots] = await Promise.all([getCorrectiveStats(), getCorrectiveOTs()])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Maintenance Corrective
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Suivi des pannes et interventions correctives
          </p>
        </div>
        <DIFormDialog>
          <Button className="bg-red-600 hover:bg-red-700">
            <AlertTriangle className="size-4" />
            Nouvelle DI
          </Button>
        </DIFormDialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={AlertTriangle}
          value={stats.total}
          label="Total pannes"
          color="red"
        />
        <KPICard
          icon={Wrench}
          value={stats.active}
          label="En cours"
          color="orange"
        />
        <KPICard
          icon={CheckCircle}
          value={stats.completedThisMonth}
          label="Résolues ce mois"
          color="green"
        />
        <KPICard
          icon={Clock}
          value={stats.avgResolutionHours}
          label="Temps moyen"
          suffix="h"
          color="blue"
        />
      </div>

      {/* Main content: Table + Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* OT Table (2/3) */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="mb-4 font-heading text-lg text-stone-900">
              Ordres correctifs
            </h2>
            <OTTable data={ots} />
          </div>
        </div>

        {/* Charts sidebar (1/3) */}
        <div className="space-y-6">
          <CorrectiveCharts
            byPriority={stats.byPriority}
            byStatus={stats.byStatus}
          />
        </div>
      </div>
    </div>
  )
}
