import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth-utils'
import { getEquipment } from '@/actions/equipment'
import { EquipmentDetail } from '@/components/equipment/equipment-detail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params
  const { role } = await getCurrentUser()

  const data = await getEquipment(id)
  if (!data) notFound()

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-stone-400">
        <Link href="/actifs" className="hover:text-stone-600 transition-colors">
          Actifs
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-mono text-stone-600">{data.equipment.code}</span>
      </nav>

      <EquipmentDetail
        equipment={data.equipment}
        workOrders={data.workOrders}
        spareParts={data.spareParts}
        meterReadings={data.meterReadings}
        role={role}
      />
    </div>
  )
}
