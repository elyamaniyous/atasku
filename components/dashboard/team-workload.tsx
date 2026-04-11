'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TechWorkload = {
  name: string
  role: string
  activeOTs: number
  totalHours: number
  capacity: number
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Responsable',
  ADMIN: 'Admin',
  TECHNICIAN: 'Technicien',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getBarColor(capacity: number): string {
  if (capacity >= 80) return 'bg-red-500'
  if (capacity >= 50) return 'bg-orange-400'
  return 'bg-emerald-500'
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-orange-100 text-orange-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ]
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
}

export function TeamWorkload({ team }: { team: TechWorkload[] }) {
  if (team.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-heading text-lg text-stone-900">Charge d&apos;equipe</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-100">
            <Users className="size-6 text-stone-400" />
          </div>
          <p className="mt-3 text-sm text-stone-500">Aucun membre d&apos;equipe</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-heading text-lg text-stone-900">Charge d&apos;equipe</h2>

      <div className="mt-4 space-y-4">
        {team.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  getAvatarColor(tech.name)
                )}
              >
                {getInitials(tech.name)}
              </div>

              {/* Name + info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-800 truncate">
                    {tech.name}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">
                    {ROLE_LABELS[tech.role] || tech.role}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {tech.activeOTs} OT actif{tech.activeOTs !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Percentage */}
              <span className="font-mono text-sm font-semibold text-stone-700">
                {tech.capacity}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <motion.div
                className={cn('h-full rounded-full', getBarColor(tech.capacity))}
                initial={{ width: 0 }}
                animate={{ width: `${tech.capacity}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
