'use client'

import { cn } from '@/lib/utils'

interface MTBFMTTRDisplayProps {
  mtbf: number | null
  mttr: number | null
}

function getMTBFColor(value: number): string {
  if (value > 500) return 'text-emerald-600'
  if (value > 200) return 'text-orange-600'
  return 'text-red-600'
}

function getMTBFBg(value: number): string {
  if (value > 500) return 'border-emerald-200 bg-emerald-50/50'
  if (value > 200) return 'border-orange-200 bg-orange-50/50'
  return 'border-red-200 bg-red-50/50'
}

function getMTTRColor(value: number): string {
  if (value < 4) return 'text-emerald-600'
  if (value < 8) return 'text-orange-600'
  return 'text-red-600'
}

function getMTTRBg(value: number): string {
  if (value < 4) return 'border-emerald-200 bg-emerald-50/50'
  if (value < 8) return 'border-orange-200 bg-orange-50/50'
  return 'border-red-200 bg-red-50/50'
}

export function MTBFMTTRDisplay({ mtbf, mttr }: MTBFMTTRDisplayProps) {
  if (mtbf === null && mttr === null) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm text-stone-400">
          Pas assez de données pour calculer MTBF/MTTR
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* MTBF Card */}
      <div
        className={cn(
          'rounded-xl border p-6 transition-shadow hover:shadow-md',
          mtbf !== null ? getMTBFBg(mtbf) : 'border-stone-200 bg-white'
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          MTBF
        </p>
        {mtbf !== null ? (
          <>
            <p
              className={cn(
                'mt-2 font-mono text-3xl font-bold',
                getMTBFColor(mtbf)
              )}
            >
              {mtbf}
              <span className="ml-1 text-base font-normal text-stone-400">h</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Heures entre pannes
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-stone-400">Aucune donnée</p>
        )}
      </div>

      {/* MTTR Card */}
      <div
        className={cn(
          'rounded-xl border p-6 transition-shadow hover:shadow-md',
          mttr !== null ? getMTTRBg(mttr) : 'border-stone-200 bg-white'
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          MTTR
        </p>
        {mttr !== null ? (
          <>
            <p
              className={cn(
                'mt-2 font-mono text-3xl font-bold',
                getMTTRColor(mttr)
              )}
            >
              {mttr}
              <span className="ml-1 text-base font-normal text-stone-400">h</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Temps moyen de réparation
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-stone-400">Aucune donnée</p>
        )}
      </div>
    </div>
  )
}
