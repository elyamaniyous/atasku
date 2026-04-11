'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type DataPoint = {
  month: string
  corrective: number
  preventive: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-stone-500">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-stone-600">{entry.name}:</span>
          <span className="font-mono text-xs font-semibold text-stone-900">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CorrectiveVsPreventiveChart({
  data,
}: {
  data: DataPoint[]
}) {
  const isEmpty = data.every((d) => d.corrective === 0 && d.preventive === 0)

  if (isEmpty) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-400">
        Pas de donnees
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4}>
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
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar
          dataKey="corrective"
          name="Correctif"
          fill="#DC2626"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="preventive"
          name="Preventif"
          fill="#2563EB"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
