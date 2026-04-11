'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#DC2626',
  NORMAL: '#F97316',
  LOW: '#059669',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nouveau', color: '#78716c' },
  ASSIGNED: { label: 'Affecté', color: '#2563EB' },
  IN_PROGRESS: { label: 'En cours', color: '#F97316' },
  ON_HOLD: { label: 'En attente', color: '#D97706' },
  COMPLETED: { label: 'Terminé', color: '#059669' },
  CANCELLED: { label: 'Annulé', color: '#EF4444' },
}

interface CorrectiveChartsProps {
  byPriority: { URGENT: number; NORMAL: number; LOW: number }
  byStatus: Record<string, number>
}

export function CorrectiveCharts({ byPriority, byStatus }: CorrectiveChartsProps) {
  const priorityData = [
    { name: 'Urgent', value: byPriority.URGENT, color: PRIORITY_COLORS.URGENT },
    { name: 'Normal', value: byPriority.NORMAL, color: PRIORITY_COLORS.NORMAL },
    { name: 'Basse', value: byPriority.LOW, color: PRIORITY_COLORS.LOW },
  ].filter(d => d.value > 0)

  const totalPriority = priorityData.reduce((s, d) => s + d.value, 0)

  return (
    <>
      {/* Priority Pie Chart */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">
          Répartition par priorité
        </h3>
        {totalPriority > 0 ? (
          <div className="flex items-center gap-4">
            <div className="h-[140px] w-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [String(value), 'OTs']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e7e5e4',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {priorityData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs text-stone-600">{d.name}</span>
                  <span className="font-mono text-xs font-semibold text-stone-800">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-stone-400">
            Aucune donnée
          </p>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">
          Par statut
        </h3>
        <div className="space-y-2.5">
          {Object.entries(byStatus).map(([status, count]) => {
            const config = STATUS_CONFIG[status]
            if (!config || count === 0) return null
            const maxCount = Math.max(...Object.values(byStatus), 1)
            const pct = (count / maxCount) * 100
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">{config.label}</span>
                  <span className="font-mono text-xs font-semibold text-stone-800">
                    {count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-stone-100">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
