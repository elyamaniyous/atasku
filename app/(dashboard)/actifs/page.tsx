import { Suspense } from 'react'
import { Plus, AlertTriangle, Package } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-utils'
import { getEquipments, getEquipmentCount } from '@/actions/equipment'
import { EquipmentCard } from '@/components/equipment/equipment-card'
import { EquipmentFilters } from '@/components/equipment/equipment-filters'
import { EquipmentFormDialog } from '@/components/forms/equipment-form'
import { Button } from '@/components/ui/button'

type Props = {
  searchParams: Promise<{
    status?: string
    criticality?: string
    group_name?: string
    search?: string
  }>
}

export default async function EquipmentListPage({ searchParams }: Props) {
  const params = await searchParams
  const { role, orgPlan } = await getCurrentUser()
  const canManage = role === 'OWNER' || role === 'ADMIN'

  const [equipments, totalCount] = await Promise.all([
    getEquipments({
      status: params.status,
      criticality: params.criticality,
      group_name: params.group_name,
      search: params.search,
    }),
    getEquipmentCount(),
  ])

  // Plan limits
  const MAX_EQUIPMENT: Record<string, number> = {
    FREE: 10,
    PRO: 100,
    ENTERPRISE: 999999,
  }
  const maxEquipment = MAX_EQUIPMENT[orgPlan] ?? 10
  const atLimit = totalCount >= maxEquipment

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl text-stone-900">
            Actifs &amp; Équipements
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {totalCount} équipement{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {canManage && (
          <EquipmentFormDialog mode="create">
            <Button disabled={atLimit}>
              <Plus className="size-4" />
              Ajouter un équipement
            </Button>
          </EquipmentFormDialog>
        )}
      </div>

      {/* Plan limit warning */}
      {atLimit && canManage && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            Vous avez atteint la limite de {maxEquipment} équipements pour votre plan {orgPlan}.
            Passez au plan supérieur pour en ajouter davantage.
          </span>
        </div>
      )}

      {/* Filters */}
      <Suspense fallback={null}>
        <EquipmentFilters />
      </Suspense>

      {/* Grid */}
      {equipments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipments.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-200 py-16">
          <div className="flex size-14 items-center justify-center rounded-full bg-stone-100">
            <Package className="size-7 text-stone-400" />
          </div>
          <h3 className="mt-4 font-heading text-base font-medium text-stone-900">
            Aucun équipement trouvé
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            {params.search || params.status || params.criticality || params.group_name
              ? 'Essayez de modifier vos filtres.'
              : 'Commencez par ajouter votre premier équipement.'}
          </p>
          {canManage && !params.search && !params.status && (
            <EquipmentFormDialog mode="create">
              <Button className="mt-4" variant="outline">
                <Plus className="size-4" />
                Ajouter un équipement
              </Button>
            </EquipmentFormDialog>
          )}
        </div>
      )}
    </div>
  )
}
