'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw, X } from 'lucide-react'
import { useOnlineStatus } from '@/lib/offline/use-online-status'

export function OfflineIndicator() {
  const { isOnline, queueSize, isSyncing, syncNow } = useOnlineStatus()
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = (!isOnline || queueSize > 0) && !dismissed

  // Reset dismissed state when going offline again
  if (!isOnline && dismissed) {
    setDismissed(false)
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 bg-orange-500 px-4 py-2 text-sm text-white">
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <>
                  <WifiOff className="h-4 w-4 shrink-0" />
                  <span>
                    Mode hors-ligne — Les modifications seront
                    synchronis&eacute;es automatiquement
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw
                    className={`h-4 w-4 shrink-0 ${isSyncing ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isSyncing
                      ? `Synchronisation en cours\u2026 (${queueSize} action${queueSize > 1 ? 's' : ''} en attente)`
                      : `${queueSize} action${queueSize > 1 ? 's' : ''} en attente de synchronisation`}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOnline && queueSize > 0 && !isSyncing && (
                <button
                  onClick={syncNow}
                  className="rounded bg-white/20 px-2 py-0.5 text-xs font-medium hover:bg-white/30 transition-colors"
                >
                  Synchroniser maintenant
                </button>
              )}
              <button
                onClick={() => setDismissed(true)}
                className="rounded p-0.5 hover:bg-white/20 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
