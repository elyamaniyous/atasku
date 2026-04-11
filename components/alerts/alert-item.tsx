'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import {
  Clock,
  Calendar,
  AlertTriangle,
  Timer,
  FileText,
  Brain,
  Check,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { acknowledgeAlert } from '@/actions/alerts'
import { Button } from '@/components/ui/button'

export type AlertType =
  | 'HOURS_250'
  | 'PREVENTIVE_J7'
  | 'PREVENTIVE_J3'
  | 'PREVENTIVE_J1'
  | 'OT_UNASSIGNED'
  | 'SLA_WARNING'
  | 'DAILY_SUMMARY'
  | 'AI_PREDICTION'

export type AlertStatus = 'SENT' | 'READ' | 'ACKNOWLEDGED'

export type Alert = {
  id: string
  type: AlertType
  status: AlertStatus
  message: string
  sent_at: string
  read_at: string | null
  acknowledged_at: string | null
  equipment_id: string | null
  equipment?: { code: string; designation: string } | null
}

const ALERT_CONFIG: Record<
  AlertType,
  { icon: typeof Clock; color: string; bgColor: string }
> = {
  HOURS_250: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  PREVENTIVE_J7: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  PREVENTIVE_J3: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  PREVENTIVE_J1: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  OT_UNASSIGNED: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  SLA_WARNING: {
    icon: Timer,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  DAILY_SUMMARY: {
    icon: FileText,
    color: 'text-stone-500',
    bgColor: 'bg-stone-100',
  },
  AI_PREDICTION: {
    icon: Brain,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
  },
}

type AlertItemProps = {
  alert: Alert
  compact?: boolean
  onAcknowledge?: () => void
}

export function AlertItem({
  alert,
  compact = false,
  onAcknowledge,
}: AlertItemProps) {
  const [isPending, startTransition] = useTransition()
  const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.DAILY_SUMMARY
  const Icon = config.icon
  const isUnread = alert.status === 'SENT'
  const isAcknowledged = alert.status === 'ACKNOWLEDGED'

  function handleAcknowledge() {
    startTransition(async () => {
      await acknowledgeAlert(alert.id)
      onAcknowledge?.()
    })
  }

  const timeAgo = formatDistanceToNow(new Date(alert.sent_at), {
    locale: fr,
    addSuffix: true,
  })

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-stone-50',
          isUnread && 'bg-blue-50/50'
        )}
      >
        <div
          className={cn(
            'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
            config.bgColor
          )}
        >
          <Icon className={cn('size-3.5', config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-sm text-stone-700',
              isUnread && 'font-medium text-stone-900'
            )}
          >
            {alert.message}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">{timeAgo}</span>
            {alert.equipment && (
              <span className="truncate text-xs text-stone-400">
                {alert.equipment.designation}
              </span>
            )}
          </div>
        </div>
        {isUnread && (
          <div className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />
        )}
        {isAcknowledged && (
          <Check className="mt-1.5 size-3.5 shrink-0 text-green-600" />
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:bg-stone-50',
        isUnread && 'border-blue-200 bg-blue-50/30'
      )}
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          config.bgColor
        )}
      >
        <Icon className={cn('size-4', config.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm text-stone-700',
              isUnread && 'font-semibold text-stone-900'
            )}
          >
            {alert.message}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {isUnread && (
              <div className="size-2 rounded-full bg-blue-500" />
            )}
            {isAcknowledged && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <Check className="size-3" />
                Acquitte
              </span>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-stone-400">
          <span>{timeAgo}</span>
          {alert.equipment && (
            <Link
              href={`/actifs/${alert.equipment_id}`}
              className="text-blue-600 hover:underline"
            >
              {alert.equipment.code} — {alert.equipment.designation}
            </Link>
          )}
        </div>
        {!isAcknowledged && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcknowledge}
              disabled={isPending}
              className="h-7 text-xs"
            >
              {isPending ? 'En cours...' : 'Acquitter'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
