import Link from 'next/link'
import { Plus, Kanban, List } from 'lucide-react'
import { getWorkOrders, getTechnicians } from '@/actions/ot'
import { OTTable, type OTTableRow } from '@/components/ot/ot-table'
import { Button } from '@/components/ui/button'
import { DIFormDialog } from '@/components/forms/di-form'

type SearchParams = Promise<{
  status?: string
  priority?: string
  type?: string
  technician_id?: string
}>

export default async function WorkOrdersListPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const filters = {
    status: params.status || undefined,
    priority: params.priority || undefined,
    type: params.type || undefined,
    technician_id: params.technician_id || undefined,
  }

  const [workOrders, technicians] = await Promise.all([
    getWorkOrders(filters),
    getTechnicians(),
  ])

  const tableData: OTTableRow[] = workOrders.map((wo) => ({
    id: wo.id,
    code: wo.code,
    equipment_designation: wo.equipment?.designation ?? null,
    equipment_code: wo.equipment?.code ?? null,
    type: wo.type,
    priority: wo.priority,
    status: wo.status,
    technician_name: wo.technician_name ?? null,
    created_at: wo.created_at,
    estimated_duration: wo.estimated_duration,
  }))

  // Build filter URL helper
  function filterUrl(key: string, value: string) {
    const sp = new URLSearchParams()
    if (params.status) sp.set('status', params.status)
    if (params.priority) sp.set('priority', params.priority)
    if (params.type) sp.set('type', params.type)
    if (params.technician_id) sp.set('technician_id', params.technician_id)

    if (value) {
      sp.set(key, value)
    } else {
      sp.delete(key)
    }
    const qs = sp.toString()
    return `/ordres/liste${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Ordres de Travail — Liste
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {tableData.length} ordre{tableData.length !== 1 ? 's' : ''} de travail
          </p>
        </div>

        <DIFormDialog>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="size-4" />
            Nouvelle DI
          </Button>
        </DIFormDialog>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 w-fit">
        <Link
          href="/ordres"
          className="inline-flex items-center gap-1.5 rounded-[min(var(--radius-md),12px)] px-2.5 h-7 text-[0.8rem] font-medium text-stone-500 hover:bg-stone-100 transition-colors"
        >
          <Kanban className="size-3.5" />
          Kanban
        </Link>
        <Button size="sm" variant="default" className="gap-1.5">
          <List className="size-3.5" />
          Liste
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <FilterSelect
          label="Statut"
          value={params.status}
          options={[
            { value: '', label: 'Tous' },
            { value: 'NEW', label: 'Nouveau' },
            { value: 'ASSIGNED', label: 'Affecté' },
            { value: 'IN_PROGRESS', label: 'En cours' },
            { value: 'ON_HOLD', label: 'En attente' },
            { value: 'COMPLETED', label: 'Terminé' },
            { value: 'CANCELLED', label: 'Annulé' },
          ]}
          buildUrl={(val) => filterUrl('status', val)}
        />

        {/* Priority filter */}
        <FilterSelect
          label="Priorité"
          value={params.priority}
          options={[
            { value: '', label: 'Toutes' },
            { value: 'URGENT', label: 'Urgent' },
            { value: 'NORMAL', label: 'Normal' },
            { value: 'LOW', label: 'Basse' },
          ]}
          buildUrl={(val) => filterUrl('priority', val)}
        />

        {/* Type filter */}
        <FilterSelect
          label="Type"
          value={params.type}
          options={[
            { value: '', label: 'Tous' },
            { value: 'CORRECTIVE', label: 'Correctif' },
            { value: 'PREVENTIVE', label: 'Préventif' },
          ]}
          buildUrl={(val) => filterUrl('type', val)}
        />

        {/* Technician filter */}
        <FilterSelect
          label="Technicien"
          value={params.technician_id}
          options={[
            { value: '', label: 'Tous' },
            ...technicians.map((t) => ({ value: t.user_id, label: t.name })),
          ]}
          buildUrl={(val) => filterUrl('technician_id', val)}
        />

        {/* Clear filters */}
        {(params.status || params.priority || params.type || params.technician_id) && (
          <Link
            href="/ordres/liste"
            className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
          >
            Réinitialiser
          </Link>
        )}
      </div>

      {/* Table */}
      <OTTable data={tableData} />
    </div>
  )
}

// ---- Server-rendered filter select (uses native HTML + links) ----

function FilterSelect({
  label,
  value,
  options,
  buildUrl,
}: {
  label: string
  value?: string
  options: { value: string; label: string }[]
  buildUrl: (val: string) => string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-stone-500">{label}:</span>
      <div className="flex items-center gap-0.5 rounded-md border border-stone-200 bg-white p-0.5">
        {options.map((opt) => {
          const isActive = (value ?? '') === opt.value
          return (
            <Link
              key={opt.value}
              href={buildUrl(opt.value)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              {opt.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
