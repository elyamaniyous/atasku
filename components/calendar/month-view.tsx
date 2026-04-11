'use client'

import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarEventPill } from './calendar-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { CalendarEvent } from '@/actions/planning'

const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MAX_VISIBLE = 3

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDayClick?: (date: Date) => void
}

export function MonthView({ currentDate, events, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const event of events) {
      try {
        const key = format(parseISO(event.start), 'yyyy-MM-dd')
        if (!map[key]) map[key] = []
        map[key].push(event)
      } catch {
        // skip invalid dates
      }
    }
    return map
  }, [events])

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {DAY_NAMES.map((name, i) => (
            <div
              key={i}
              className="px-2 py-2 text-center text-xs font-semibold uppercase text-stone-400"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay[key] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const overflow = dayEvents.length - MAX_VISIBLE

            return (
              <button
                key={key}
                type="button"
                onClick={() => onDayClick?.(day)}
                className={cn(
                  'group min-h-[100px] border-b border-r border-stone-100 p-1.5 text-left transition-colors hover:bg-stone-50 last:border-r-0',
                  !isCurrentMonth && 'bg-stone-50/50'
                )}
              >
                {/* Date number */}
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                      today
                        ? 'bg-blue-600 font-bold text-white'
                        : isCurrentMonth
                          ? 'text-stone-800'
                          : 'text-stone-300'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-medium text-stone-400">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event pills */}
                <div className="space-y-0.5">
                  {dayEvents.slice(0, MAX_VISIBLE).map((event) => (
                    <CalendarEventPill
                      key={event.id}
                      event={event}
                      compact
                    />
                  ))}
                  {overflow > 0 && (
                    <p className="text-center text-[10px] font-medium text-stone-400">
                      +{overflow} de plus
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
