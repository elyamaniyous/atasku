'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type DataPoint = {
  month: string
  mttr: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-stone-500">{label}</p>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-orange-500" />
        <span className="text-xs text-stone-600">MTTR:</span>
        <span className="font-mono text-xs font-semibold text-stone-900">
          {payload[0].value}h
        </span>
      </div>
    </div>
  )
}

export function MTTRTrendChart({ data }: { data: DataPoint[] }) {
  const isEmpty = data.every((d) => d.mttr === 0)

  if (isEmpty) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-400">
        Pas de donnees
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="mttrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#78716c' }}
          tickLine={false}
          axisLine={{ stroke: '#d6d3d1' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#78716c' }}
          tickLine={false}
          axisLine={false}
          unit="h"
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={4}
          stroke="#059669"
          strokeDasharray="6 4"
          strokeWidth={1.5}
          label={{
            value: 'Objectif 4h',
            position: 'right',
            fill: '#059669',
            fontSize: 11,
          }}
        />
        <Area
          type="monotone"
          dataKey="mttr"
          stroke="#F97316"
          strokeWidth={2.5}
          fill="url(#mttrGradient)"
          dot={{ r: 4, fill: '#F97316', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
