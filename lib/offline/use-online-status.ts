'use client'

import { useState, useEffect, useCallback } from 'react'
import { getQueueSize, processQueue } from './sync-queue'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [queueSize, setQueueSize] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const goOnline = async () => {
      setIsOnline(true)
      // Auto-sync when coming back online
      const size = await getQueueSize()
      if (size > 0) {
        setIsSyncing(true)
        await processQueue()
        setIsSyncing(false)
        setQueueSize(await getQueueSize())
      }
    }

    const goOffline = () => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Check queue size periodically
    const interval = setInterval(async () => {
      setQueueSize(await getQueueSize())
    }, 5000)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      clearInterval(interval)
    }
  }, [])

  const syncNow = useCallback(async () => {
    setIsSyncing(true)
    const result = await processQueue()
    setIsSyncing(false)
    setQueueSize(await getQueueSize())
    return result
  }, [])

  return { isOnline, queueSize, isSyncing, syncNow }
}
