'use client'

import Link from 'next/link'
import { ClipboardPlus, Cog, KanbanSquare, BarChart3 } from 'lucide-react'
import { DIFormDialog } from '@/components/forms/di-form'
import { cn } from '@/lib/utils'

const ACTIONS = [
  {
    label: 'Nouvelle DI',
    icon: ClipboardPlus,
    color: 'bg-red-50 text-red-600',
    href: null as string | null, // triggers dialog
  },
  {
    label: 'Ajouter Equipement',
    icon: Cog,
    color: 'bg-blue-50 text-blue-600',
    href: '/actifs',
  },
  {
    label: 'Kanban OT',
    icon: KanbanSquare,
    color: 'bg-orange-50 text-orange-600',
    href: '/ordres',
  },
  {
    label: 'Rapports',
    icon: BarChart3,
    color: 'bg-emerald-50 text-emerald-600',
    href: '/rapports',
  },
]

function ActionButton({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof ClipboardPlus
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-stone-100 bg-stone-50/50 p-4 transition-all hover:scale-[1.02] hover:shadow-sm hover:bg-white cursor-pointer">
      <div className={cn('flex size-10 items-center justify-center rounded-full', color)}>
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-medium text-stone-700 text-center">{label}</span>
    </div>
  )
}

export function QuickActions() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-heading text-lg text-stone-900">Actions rapides</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          if (action.href === null) {
            // DI form dialog trigger
            return (
              <DIFormDialog key={action.label}>
                <ActionButton
                  icon={action.icon}
                  label={action.label}
                  color={action.color}
                />
              </DIFormDialog>
            )
          }

          return (
            <Link key={action.label} href={action.href}>
              <ActionButton
                icon={action.icon}
                label={action.label}
                color={action.color}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
