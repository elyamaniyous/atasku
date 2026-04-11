'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

type AlertBannerProps = {
  urgentCount: number
  equipmentNames: string[]
}

const DISMISS_KEY = 'promaint_alert_banner_dismissed'
const DISMISS_DURATION = 60 * 60 * 1000 // 1 hour

export function AlertBanner({ urgentCount, equipmentNames }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(true) // default to hidden until checked

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY)
    if (stored) {
      const ts = parseInt(stored, 10)
      if (Date.now() - ts < DISMISS_DURATION) {
        setDismissed(true)
        return
      }
    }
    setDismissed(false)
  }, [])

  if (urgentCount === 0 || dismissed) return null

  const displayNames = equipmentNames.slice(0, 3)
  const remaining = equipmentNames.length - 3

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between bg-red-600 px-4 py-2.5 text-white md:px-6">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 shrink-0" />
              <span className="font-medium">
                {urgentCount} ordre{urgentCount > 1 ? 's' : ''} urgent
                {urgentCount > 1 ? 's' : ''} non affecte
                {urgentCount > 1 ? 's' : ''}
              </span>
              {displayNames.length > 0 && (
                <span className="hidden text-red-100 md:inline">
                  — {displayNames.join(', ')}
                  {remaining > 0 && ` +${remaining} autre${remaining > 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="flex size-6 items-center justify-center rounded-md text-red-200 transition-colors hover:bg-red-700 hover:text-white"
              aria-label="Masquer l'alerte"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
