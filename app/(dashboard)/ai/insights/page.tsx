import { Suspense } from 'react'
import { getCachedInsights } from '@/actions/ai'
import { InsightsClient } from '@/components/ai/insights-client'

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-8 w-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted ring-1 ring-foreground/10" />
    </div>
  )
}

export default async function AIInsightsPage() {
  const data = await getCachedInsights()

  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <InsightsClient data={data} />
    </Suspense>
  )
}
