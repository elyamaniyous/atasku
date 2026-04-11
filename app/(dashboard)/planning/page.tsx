import { Suspense } from 'react'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { getCurrentUser } from '@/lib/auth-utils'
import { getCalendarEvents, getTeamAvailability } from '@/actions/planning'
import { getTechnicians } from '@/actions/ot'
import { MaintenanceCalendar } from '@/components/calendar/maintenance-calendar'
import { WorkloadBar } from '@/components/calendar/workload-bar'
import { Skeleton } from '@/components/ui/skeleton'

export default async function PlanningPage() {
  await getCurrentUser()

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const [events, team, technicians] = await Promise.all([
    getCalendarEvents(weekStart.toISOString(), weekEnd.toISOString()),
    getTeamAvailability(weekStart.toISOString()),
    getTechnicians(),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl text-stone-900">Planning</h1>
        <p className="mt-1 text-sm text-stone-500">
          Calendrier des interventions et charge de l&apos;&eacute;quipe
        </p>
      </div>

      {/* Workload summary */}
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <WorkloadBar team={team} />
      </Suspense>

      {/* Calendar */}
      <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-xl" />}>
        <MaintenanceCalendar
          initialEvents={events}
          technicians={technicians.map((t) => ({
            user_id: t.user_id,
            name: t.name,
          }))}
        />
      </Suspense>
    </div>
  )
}
