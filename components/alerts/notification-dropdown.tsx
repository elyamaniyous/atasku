'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertItem, type Alert } from '@/components/alerts/alert-item'
import { getAlerts, markAllRead, getUnreadAlertCount } from '@/actions/alerts'
import { createClient } from '@/lib/supabase/client'

type NotificationDropdownProps = {
  initialCount?: number
}

export function NotificationDropdown({
  initialCount = 0,
}: NotificationDropdownProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAlerts({ limit: 10 })
      setAlerts(data as Alert[])
      const count = await getUnreadAlertCount()
      setUnreadCount(count)
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch alerts when dropdown opens
  useEffect(() => {
    if (open) {
      fetchAlerts()
    }
  }, [open, fetchAlerts])

  // Realtime subscription for new alerts
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        () => {
          setUnreadCount((prev) => prev + 1)
          if (open) {
            fetchAlerts()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, fetchAlerts])

  async function handleMarkAllRead() {
    await markAllRead()
    setUnreadCount(0)
    setAlerts((prev) =>
      prev.map((a) =>
        a.status === 'SENT'
          ? { ...a, status: 'READ' as const, read_at: new Date().toISOString() }
          : a
      )
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative flex size-8 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h3 className="font-heading text-sm font-semibold text-stone-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-blue-600 transition-colors hover:text-blue-700"
            >
              <CheckCheck className="size-3.5" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Alert list */}
        <ScrollArea className="max-h-[400px]">
          {loading && alerts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-stone-400">
              <Bell className="size-8 stroke-1" />
              <span className="text-sm">Aucune notification</span>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 py-1">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  compact
                  onAcknowledge={fetchAlerts}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-stone-200 px-4 py-2.5">
          <Link
            href="/alertes"
            className="flex items-center justify-center text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            onClick={() => setOpen(false)}
          >
            Voir toutes les alertes &rarr;
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
