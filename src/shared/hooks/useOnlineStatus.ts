import { useEffect, useState } from 'react'
import { isNativePlatform } from '@/shared/lib/registerServiceWorker'

const PROBE_INTERVAL_MS = 30 * 1000

function probeUrl(): string {
  return `${import.meta.env.BASE_URL}version.json?probe=${Date.now()}`
}

/**
 * Tracks connectivity for the offline banner. `navigator.onLine` alone is
 * unreliable on iOS Safari (airplane mode can still report online), so we
 * also probe `version.json` with `cache: 'no-store'`.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  )

  useEffect(() => {
    if (isNativePlatform()) return
    let cancelled = false

    async function probe() {
      if (typeof document !== 'undefined' && document.hidden) return
      if (!navigator.onLine) {
        if (!cancelled) setIsOnline(false)
        return
      }
      try {
        const response = await fetch(probeUrl(), { cache: 'no-store' })
        if (!cancelled) setIsOnline(response.ok)
      } catch {
        if (!cancelled) setIsOnline(false)
      }
    }

    function handleOnline() {
      void probe()
    }
    function handleOffline() {
      setIsOnline(false)
    }
    function onVisibilityChange() {
      if (!document.hidden) void probe()
    }

    void probe()
    const interval = setInterval(probe, PROBE_INTERVAL_MS)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return isOnline
}
