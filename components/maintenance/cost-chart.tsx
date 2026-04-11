'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type HistoryEntry = {
  started_at: string
  parts_cost: number
  labor_cost: number
}

export function CostChart({ data }: { data: HistoryEntry[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Sort by date ascending
    const sorted = [...data].sort(
      (a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
    )

    let cumulative = 0
    return sorted.map(entry => {
      const cost = entry.parts_cost + entry.labor_cost
      cumulative += cost
      return {
        date: format(new Date(entry.started_at), 'dd MMM yy', { locale: fr }),
        cost,
        cumulative,
      }
    })
  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm text-stone-400">
          Pas assez de données pour le graphique des coûts
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="mb-4 font-heading text-lg text-stone-900">
        Coûts cumulés de maintenance
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#78716c' }}
              tickLine={false}
              axisLine={{ stroke: '#d6d3d1' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#78716c' }}
              tickLine={false}
              axisLine={{ stroke: '#d6d3d1' }}
              tickFormatter={(v: number) => `${v.toLocaleString('fr-FR')}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e7e5e4',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                `${Number(value).toLocaleString('fr-FR')} DH`,
                name === 'cumulative' ? 'Cumulé' : 'Coût',
              ]}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#DC2626"
              strokeWidth={2}
              fill="url(#costGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
