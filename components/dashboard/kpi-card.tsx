'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  AlertTriangle, Wrench, CheckCircle, Clock, ClipboardList, Activity,
  Zap, Settings, BarChart3, Shield, TrendingUp, Calendar,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle, Wrench, CheckCircle, Clock, ClipboardList, Activity,
  Zap, Settings, BarChart3, Shield, TrendingUp, Calendar,
}

interface KPICardProps {
  icon: string
  value: number
  label: string
  suffix?: string
  color: string
  subtitle?: string
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  red: {
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
  green: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  orange: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
  violet: {
    border: 'border-l-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
}

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const isDecimal = value % 1 !== 0
  const rounded = useTransform(motionValue, (v) =>
    isDecimal ? v.toFixed(1) : Math.round(v).toString()
  )
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1,
      ease: 'easeOut',
    })
    return controls.stop
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = v + (suffix || '')
      }
    })
    return unsubscribe
  }, [rounded, suffix])

  return (
    <span
      ref={displayRef}
      className="font-mono text-3xl font-bold text-stone-900"
    >
      0{suffix || ''}
    </span>
  )
}

export function KPICard({ icon, value, label, suffix, color, subtitle }: KPICardProps) {
  const Icon = ICON_MAP[icon] || ClipboardList
  const colors = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-stone-200 bg-white p-6 border-l-4 transition-shadow hover:shadow-md',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <AnimatedNumber value={value} suffix={suffix} />
          <p className="text-sm text-stone-500">{label}</p>
          {subtitle && (
            <p className="text-xs text-stone-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-full', colors.bg)}>
          <Icon className={cn('size-5', colors.text)} />
        </div>
      </div>
    </div>
  )
}
