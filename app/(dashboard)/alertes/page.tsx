import { Suspense } from 'react'
import {
  Bell,
  CheckCheck,
  BarChart3,
  Clock,
  CalendarCheck,
} from 'lucide-react'
import { getAlerts, getAlertStats, markAllRead } from '@/actions/alerts'
import { AlertItem, type Alert } from '@/components/alerts/alert-item'
import { AlertFilters } from '@/components/alerts/alert-filters'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export const metadata = {
  title: 'Alertes — Atasku',
}

function groupAlertsByDate(alerts: Alert[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekStart = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; alerts: Alert[] }[] = [
    { label: "Aujourd'hui", alerts: [] },
    { label: 'Hier', alerts: [] },
    { label: 'Cette semaine', alerts: [] },
    { label: 'Plus ancien', alerts: [] },
  ]

  for (const alert of alerts) {
    const date = new Date(alert.sent_at)
    if (date >= today) {
      groups[0].alerts.push(alert)
    } else if (date >= yesterday) {
      groups[1].alerts.push(alert)
    } else if (date >= weekStart) {
      groups[2].alerts.push(alert)
    } else {
      groups[3].alerts.push(alert)
    }
  }

  return groups.filter((g) => g.alerts.length > 0)
}

async function AlertsContent({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; tab?: string }
}) {
  const filters: { type?: string; status?: string } = {}
  if (searchParams.type) filters.type = searchParams.type
  if (searchParams.status) filters.status = searchParams.status
  if (searchParams.tab === 'unread') filters.status = 'SENT'
  if (searchParams.tab === 'acknowledged') filters.status = 'ACKNOWLEDGED'

  const alerts = (await getAlerts(filters)) as Alert[]
  const groups = groupAlertsByDate(alerts)

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-stone-200 bg-white py-16">
        <Bell className="size-12 stroke-1 text-stone-300" />
        <p className="text-sm text-stone-400">Aucune alerte</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AlertesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; tab?: string }>
}) {
  const params = await searchParams
  const stats = await getAlertStats()
  const currentTab = params.tab || 'all'

  async function handleMarkAllRead() {
    'use server'
    await markAllRead()
  }

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: BarChart3,
      color: 'text-stone-600',
      bg: 'bg-stone-100',
    },
    {
      label: 'Non lues',
      value: stats.unread,
      icon: Bell,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      label: 'Acquittees',
      value: stats.acknowledged,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Cette semaine',
      value: stats.thisWeek,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-stone-900 md:text-3xl">
            Centre d&apos;Alertes
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Suivez et gerez les alertes de votre parc equipements
          </p>
        </div>
        {stats.unread > 0 && (
          <form action={handleMarkAllRead}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CheckCheck className="size-4" />
              Tout marquer comme lu
            </Button>
          </form>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"
          >
            <div
              className={`flex size-9 items-center justify-center rounded-full ${stat.bg}`}
            >
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
            <div>
              <p className="font-mono text-lg font-semibold text-stone-900">
                {stat.value}
              </p>
              <p className="text-xs text-stone-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          <a
            href="/alertes?tab=all"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Toutes
          </a>
          <a
            href="/alertes?tab=unread"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'unread'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Non lues
            {stats.unread > 0 && (
              <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                {stats.unread}
              </Badge>
            )}
          </a>
          <a
            href="/alertes?tab=acknowledged"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'acknowledged'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Acquittees
          </a>
        </div>
        <Suspense>
          <AlertFilters />
        </Suspense>
      </div>

      {/* Alert list */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <div className="size-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          </div>
        }
      >
        <AlertsContent searchParams={params} />
      </Suspense>
    </div>
  )
}
