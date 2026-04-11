'use client'

import { cn } from '@/lib/utils'
import type { TeamMember } from '@/actions/planning'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-red-600',
    'bg-orange-500',
    'bg-emerald-600',
    'bg-blue-600',
    'bg-violet-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getCapacityColor(capacity: number) {
  if (capacity > 80) return { bar: 'bg-red-500', text: 'text-red-700' }
  if (capacity > 50) return { bar: 'bg-orange-400', text: 'text-orange-700' }
  return { bar: 'bg-emerald-500', text: 'text-emerald-700' }
}

interface WorkloadBarProps {
  team: TeamMember[]
}

export function WorkloadBar({ team }: WorkloadBarProps) {
  if (team.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="text-sm text-stone-400">
          Aucun technicien actif
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-stone-700">
        Charge de travail de l&apos;\u00e9quipe
      </h3>
      <div className="space-y-3">
        {team.map((member) => {
          const colors = getCapacityColor(member.capacity)
          return (
            <div key={member.userId} className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white',
                  getAvatarColor(member.name)
                )}
              >
                {getInitials(member.name)}
              </div>

              {/* Name + hours */}
              <div className="min-w-[100px] shrink-0">
                <p className="truncate text-xs font-medium text-stone-700">
                  {member.name}
                </p>
                <p className="font-mono text-[10px] text-stone-400">
                  {member.scheduledHours}h / 40h
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex flex-1 items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bar)}
                    style={{ width: `${member.capacity}%` }}
                  />
                </div>
                <span
                  className={cn(
                    'min-w-[32px] text-right font-mono text-[10px] font-semibold',
                    colors.text
                  )}
                >
                  {member.capacity}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
