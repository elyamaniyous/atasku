'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type DataPoint = {
  name: string
  designation: string
  availability: number
  cost: number
}

function getBarColor(availability: number) {
  if (availability >= 90) return '#059669'
  if (availability >= 70) return '#F97316'
  return '#DC2626'
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: DataPoint }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-stone-900">
        {item.name}
      </p>
      <p className="mb-1 text-xs text-stone-500">{item.designation}</p>
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: getBarColor(item.availability) }}
        />
        <span className="text-xs text-stone-600">Disponibilite:</span>
        <span className="font-mono text-xs font-semibold text-stone-900">
          {item.availability}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-stone-400" />
        <span className="text-xs text-stone-600">Cout:</span>
        <span className="font-mono text-xs font-semibold text-stone-900">
          {item.cost.toLocaleString('fr-FR')} MAD
        </span>
      </div>
    </div>
  )
}

export function EquipmentAvailabilityChart({
  data,
}: {
  data: DataPoint[]
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-stone-400">
        Pas de donnees
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 36)}>
      <BarChart data={data} layout="vertical" barSize={20}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e7e5e4"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#78716c' }}
          tickLine={false}
          axisLine={{ stroke: '#d6d3d1' }}
          unit="%"
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#78716c' }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="availability" radius={[0, 6, 6, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.availability)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
