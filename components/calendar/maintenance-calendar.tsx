'use client'

import { useState, useCallback, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WeekView } from './week-view'
import { MonthView } from './month-view'
import { getCalendarEvents } from '@/actions/planning'
import type { CalendarEvent } from '@/actions/planning'

type ViewMode = 'week' | 'month'

interface Technician {
  user_id: string
  name: string
}

interface MaintenanceCalendarProps {
  initialEvents: CalendarEvent[]
  technicians: Technician[]
}

export function MaintenanceCalendar({
  initialEvents,
  technicians,
}: MaintenanceCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Read initial state from URL params
  const initialView = (searchParams.get('view') as ViewMode) || 'week'
  const initialDateStr = searchParams.get('date')
  const initialDate = initialDateStr ? new Date(initialDateStr) : new Date()
  const initialTech = searchParams.get('technicianId') || ''

  const [view, setView] = useState<ViewMode>(initialView)
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedTechnician, setSelectedTechnician] = useState(initialTech)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  // Compute date range based on view
  const getDateRange = useCallback(
    (date: Date, mode: ViewMode) => {
      if (mode === 'week') {
        const start = startOfWeek(date, { weekStartsOn: 1 })
        const end = endOfWeek(date, { weekStartsOn: 1 })
        return { start, end }
      }
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      return { start, end }
    },
    []
  )

  // Fetch events when date/view/tech changes
  const fetchEvents = useCallback(
    (date: Date, mode: ViewMode, techId: string) => {
      startTransition(async () => {
        const { start, end } = getDateRange(date, mode)
        const data = await getCalendarEvents(
          start.toISOString(),
          end.toISOString(),
          techId || undefined
        )
        setEvents(data)
      })
    },
    [getDateRange]
  )

  // Update URL params
  const updateParams = useCallback(
    (date: Date, mode: ViewMode, techId: string) => {
      const params = new URLSearchParams()
      params.set('view', mode)
      params.set('date', format(date, 'yyyy-MM-dd'))
      if (techId) params.set('technicianId', techId)
      router.replace(`/planning?${params.toString()}`, { scroll: false })
    },
    [router]
  )

  // Navigation handlers
  const goToday = () => {
    const today = new Date()
    setCurrentDate(today)
    fetchEvents(today, view, selectedTechnician)
    updateParams(today, view, selectedTechnician)
  }

  const goPrev = () => {
    const newDate = view === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1)
    setCurrentDate(newDate)
    fetchEvents(newDate, view, selectedTechnician)
    updateParams(newDate, view, selectedTechnician)
  }

  const goNext = () => {
    const newDate = view === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1)
    setCurrentDate(newDate)
    fetchEvents(newDate, view, selectedTechnician)
    updateParams(newDate, view, selectedTechnician)
  }

  const handleViewChange = (mode: ViewMode) => {
    setView(mode)
    fetchEvents(currentDate, mode, selectedTechnician)
    updateParams(currentDate, mode, selectedTechnician)
  }

  const handleTechnicianChange = (value: string | null) => {
    const techId = !value || value === 'all' ? '' : value
    setSelectedTechnician(techId)
    fetchEvents(currentDate, view, techId)
    updateParams(currentDate, view, techId)
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setView('week')
    fetchEvents(date, 'week', selectedTechnician)
    updateParams(date, 'week', selectedTechnician)
  }

  // Date display string
  const dateLabel =
    view === 'week'
      ? `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM yyyy', { locale: fr })}`
      : format(currentDate, 'MMMM yyyy', { locale: fr })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1">
            <button
              onClick={() => handleViewChange('week')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'week'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <CalendarDays className="size-3.5" />
              Semaine
            </button>
            <button
              onClick={() => handleViewChange('month')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'month'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <Grid3X3 className="size-3.5" />
              Mois
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              className="size-8 p-0"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToday}
              className="text-xs"
            >
              Aujourd&apos;hui
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              className="size-8 p-0"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Date label */}
          <h2 className="hidden text-sm font-semibold capitalize text-stone-700 sm:block">
            {dateLabel}
          </h2>
        </div>

        {/* Technician filter */}
        <Select
          value={selectedTechnician || 'all'}
          onValueChange={handleTechnicianChange}
        >
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Tous les techniciens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les techniciens</SelectItem>
            {technicians.map((tech) => (
              <SelectItem key={tech.user_id} value={tech.user_id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile date label */}
      <h2 className="text-sm font-semibold capitalize text-stone-700 sm:hidden">
        {dateLabel}
      </h2>

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <div className="size-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
          Chargement...
        </div>
      )}

      {/* Calendar views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'week' ? (
            <WeekView currentDate={currentDate} events={events} />
          ) : (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDayClick={handleDayClick}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
