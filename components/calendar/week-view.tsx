'use client'

import { useMemo } from 'react'
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
  parseISO,
  getHours,
  getMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarEventPill } from './calendar-event'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { CalendarEvent } from '@/actions/planning'

const HOUR_START = 7
const HOUR_END = 19
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const SLOT_HEIGHT = 60 // px per hour

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
}

function useCurrentTimePosition() {
  const now = new Date()
  const h = getHours(now)
  const m = getMinutes(now)
  if (h < HOUR_START || h >= HOUR_END) return null
  return ((h - HOUR_START) * SLOT_HEIGHT) + (m / 60) * SLOT_HEIGHT
}

function groupOverlapping(events: CalendarEvent[]) {
  // Sort by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )
  const groups: CalendarEvent[][] = []

  for (const evt of sorted) {
    const evtStart = new Date(evt.start).getTime()
    const evtEnd = evtStart + evt.duration * 3600 * 1000

    // Find a group where this event overlaps
    let placed = false
    for (const group of groups) {
      const hasOverlap = group.some((g) => {
        const gStart = new Date(g.start).getTime()
        const gEnd = gStart + g.duration * 3600 * 1000
        return evtStart < gEnd && evtEnd > gStart
      })
      if (hasOverlap) {
        group.push(evt)
        placed = true
        break
      }
    }
    if (!placed) {
      groups.push([evt])
    }
  }
  return groups
}

export function WeekView({ currentDate, events }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const timePosition = useCurrentTimePosition()

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd')
      map[key] = events.filter((e) => {
        try {
          return isSameDay(parseISO(e.start), day)
        } catch {
          return false
        }
      })
    }
    return map
  }, [events, days])

  return (
    <TooltipProvider>
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-stone-200 bg-stone-50">
            <div className="border-r border-stone-200 p-2" />
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'border-r border-stone-200 px-2 py-3 text-center last:border-r-0',
                  isToday(day) && 'bg-blue-50'
                )}
              >
                <p className="text-xs font-medium uppercase text-stone-400">
                  {format(day, 'EEE', { locale: fr })}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-lg font-semibold',
                    isToday(day) ? 'text-blue-600' : 'text-stone-800'
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Time labels column */}
            <div className="border-r border-stone-200">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex h-[60px] items-start justify-end border-b border-stone-100 pr-2 pt-0.5"
                >
                  <span className="font-mono text-[10px] text-stone-400">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDay[key] || []
              const groups = groupOverlapping(dayEvents)

              return (
                <div
                  key={key}
                  className={cn(
                    'relative border-r border-stone-200 last:border-r-0',
                    isToday(day) && 'bg-blue-50/30'
                  )}
                >
                  {/* Grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-stone-100"
                    />
                  ))}

                  {/* Events positioned absolutely */}
                  {groups.map((group, gi) =>
                    group.map((event, ei) => {
                      const eventDate = parseISO(event.start)
                      const h = getHours(eventDate)
                      const m = getMinutes(eventDate)
                      if (h < HOUR_START || h >= HOUR_END) return null

                      const top =
                        (h - HOUR_START) * SLOT_HEIGHT +
                        (m / 60) * SLOT_HEIGHT
                      const height = Math.max(
                        event.duration * SLOT_HEIGHT,
                        24
                      )
                      const width = group.length > 1
                        ? `${Math.floor(100 / group.length)}%`
                        : '100%'
                      const left = group.length > 1
                        ? `${Math.floor((ei * 100) / group.length)}%`
                        : '0'

                      return (
                        <div
                          key={event.id}
                          className="absolute px-0.5"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            width,
                            left,
                          }}
                        >
                          <CalendarEventPill
                            event={event}
                            compact={group.length > 1}
                            className="h-full"
                          />
                        </div>
                      )
                    })
                  )}

                  {/* Current time indicator */}
                  {isToday(day) && timePosition !== null && (
                    <div
                      className="absolute left-0 right-0 z-10 flex items-center"
                      style={{ top: `${timePosition}px` }}
                    >
                      <div className="size-2 rounded-full bg-red-500" />
                      <div className="h-[2px] flex-1 bg-red-500" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
