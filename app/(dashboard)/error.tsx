'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertTriangle className="size-12 text-amber-500" />
      <h2 className="font-heading text-xl text-stone-800">
        Erreur de chargement
      </h2>
      <p className="text-sm text-stone-500">
        Impossible de charger cette page. Veuillez réessayer.
      </p>
      <Button onClick={reset} variant="outline">
        Réessayer
      </Button>
    </div>
  )
}
