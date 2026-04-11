// IndexedDB wrapper for offline mutation queue
const DB_NAME = 'promaint-offline'
const STORE_NAME = 'sync-queue'
const DB_VERSION = 1
const MAX_RETRIES = 3

export interface QueueItem {
  id: string
  action: string // 'create_ot' | 'update_status' | 'create_equipment' | 'create_meter_reading'
  endpoint: string // API path
  data: Record<string, unknown>
  timestamp: number
  retries: number
  status: 'pending' | 'processing' | 'failed'
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addToQueue(
  item: Omit<QueueItem, 'id' | 'timestamp' | 'retries' | 'status'>
): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  const entry: QueueItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
    status: 'pending',
  }

  return new Promise((resolve, reject) => {
    const req = store.add(entry)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function getQueueItems(): Promise<QueueItem[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => {
      const items = (req.result as QueueItem[]).sort(
        (a, b) => a.timestamp - b.timestamp
      )
      resolve(items)
    }
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function getQueueSize(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const req = store.count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function updateQueueItem(
  id: string,
  updates: Partial<QueueItem>
): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const item = getReq.result as QueueItem | undefined
      if (!item) {
        reject(new Error(`Queue item ${id} not found`))
        return
      }
      const updated = { ...item, ...updates }
      const putReq = store.put(updated)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
    tx.oncomplete = () => db.close()
  })
}

export async function processQueue(): Promise<{
  processed: number
  failed: number
}> {
  const items = await getQueueItems()
  const pending = items.filter(
    (item) => item.status === 'pending' || item.status === 'processing'
  )

  let processed = 0
  let failed = 0

  for (const item of pending) {
    await updateQueueItem(item.id, { status: 'processing' })

    try {
      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await removeFromQueue(item.id)
      processed++
    } catch {
      const newRetries = item.retries + 1
      if (newRetries >= MAX_RETRIES) {
        await updateQueueItem(item.id, {
          status: 'failed',
          retries: newRetries,
        })
        failed++
      } else {
        await updateQueueItem(item.id, {
          status: 'pending',
          retries: newRetries,
        })
      }
    }
  }

  return { processed, failed }
}

export async function clearQueue(): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  return new Promise((resolve, reject) => {
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}
