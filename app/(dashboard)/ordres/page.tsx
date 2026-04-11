import { Suspense } from 'react'
import { Plus, AlertTriangle, CheckCircle2, ClipboardList, Kanban, List } from 'lucide-react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth-utils'
import { getKanbanData, getWorkOrderStats } from '@/actions/ot'
import { KanbanBoard } from '@/components/kanban/board'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default async function WorkOrdersPage() {
  const { role, user } = await getCurrentUser()
  const [kanbanData, stats] = await Promise.all([
    getKanbanData(),
    getWorkOrderStats(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Ordres de Travail
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Gestion des interventions et ordres de travail
          </p>
        </div>

        <Button className="bg-red-600 hover:bg-red-700" disabled>
          <Plus className="size-4" />
          Nouvelle DI
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
          <ClipboardList className="size-4 text-blue-500" />
          <span className="text-sm font-medium text-stone-700">
            {stats.active} actif{stats.active !== 1 ? 's' : ''}
          </span>
        </div>
        {stats.urgent > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <AlertTriangle className="size-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">
              {stats.urgent} urgent{stats.urgent !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
          <CheckCircle2 className="size-4 text-green-500" />
          <span className="text-sm font-medium text-stone-700">
            {stats.completedThisMonth} termin&eacute;{stats.completedThisMonth !== 1 ? 's' : ''} ce mois
          </span>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 w-fit">
        <Button size="sm" variant="default" className="gap-1.5">
          <Kanban className="size-3.5" />
          Kanban
        </Button>
        <Link
          href="/ordres/liste"
          className="inline-flex items-center gap-1.5 rounded-[min(var(--radius-md),12px)] px-2.5 h-7 text-[0.8rem] font-medium text-stone-500 hover:bg-stone-100 transition-colors"
        >
          <List className="size-3.5" />
          Liste
        </Link>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        initialData={kanbanData}
        userRole={role}
        userId={user.id}
      />
    </div>
  )
}
