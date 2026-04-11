import { Suspense } from 'react'
import { getCurrentUser } from '@/lib/auth-utils'
import { getReportData, type Period } from '@/actions/reports'
import { ReportsClient } from '@/components/dashboard/reports-client'

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { orgPlan } = await getCurrentUser()
  const params = await searchParams
  const period = (['week', 'month', 'quarter', 'year'].includes(
    params.period ?? ''
  )
    ? params.period
    : 'month') as Period

  const data = await getReportData(period)

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-stone-200 border-t-red-600" />
        </div>
      }
    >
      <ReportsClient data={data} period={period} orgPlan={orgPlan} />
    </Suspense>
  )
}
