'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type DataPoint = {
  name: string
  value: number
}

const COLORS = ['#DC2626', '#2563EB', '#F97316', '#059669', '#7C3AED']

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: DataPoint; color: string }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xs text-stone-600">{item.payload.name}:</span>
        <span className="font-mono text-xs font-semibold text-stone-900">
          {item.payload.value.toLocaleString('fr-FR')} MAD
        </span>
      </div>
    </div>
  )
}

function CustomLabel({
  cx,
  cy,
  total,
}: {
  cx: number
  cy: number
  total: number
}) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        className="fill-stone-900 font-mono text-lg font-bold"
      >
        {total.toLocaleString('fr-FR')}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="fill-stone-500 text-xs"
      >
        MAD total
      </text>
    </g>
  )
}

export function CostDistributionChart({
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

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => (
            <span className="text-xs text-stone-600">{value}</span>
          )}
        />
        {/* Center label */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-stone-900 text-base font-bold"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {total.toLocaleString('fr-FR')}
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-stone-500 text-[11px]"
        >
          MAD total
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}
